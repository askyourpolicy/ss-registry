"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type AuthState,
  type AuthStatus,
  challengeAndVerifyTotp,
  createAuthErrorState,
  describeAuthError,
  initialAuthState,
  resolveSessionState,
  type SignUpInput,
  type SignUpOutcome,
  toError,
} from "@/auth/auth-state";
import { getSupabaseClient } from "@/lib/supabase";

type AuthContextValue = {
  confirmTotpEnrollment: (factorId: string, code: string) => Promise<string | null>;
  error: Error | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaSetupRequired: boolean;
  retry: () => Promise<void>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<SignUpOutcome>;
  status: AuthStatus;
  user: User | null;
  verifyMfa: (code: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// A before-user-created hook rejects anyone who is not already a member of the organization, and
// Supabase relays that as an empty error, so state the remedy instead of the missing detail.
const signUpRejected =
  "This account could not be created. Your email has to be added to the organization first. Ask a Stitch administrator, then sign up again.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(initialAuthState);
  const mounted = useRef(false);
  const mfaRequest = useRef<Promise<string | null> | null>(null);
  const principal = useRef<string | null | undefined>(undefined);
  const requestSequence = useRef(0);
  const stateRef = useRef<AuthState>(initialAuthState);

  const commit = useCallback((requestId: number, nextState: AuthState) => {
    if (mounted.current && requestId === requestSequence.current) {
      stateRef.current = nextState;
      setState(nextState);
    }
  }, []);

  const updatePrincipal = useCallback(
    (requestId: number, session: Session | null) => {
      if (requestId !== requestSequence.current) return;
      const nextPrincipal = session?.user.id ?? null;
      if (principal.current === undefined || principal.current !== nextPrincipal) {
        queryClient.clear();
      }
      principal.current = nextPrincipal;
    },
    [queryClient],
  );

  const inspectSession = useCallback(
    async (session: Session | null, requestId = ++requestSequence.current, showLoading = true) => {
      updatePrincipal(requestId, session);
      if (showLoading) {
        commit(requestId, {
          error: null,
          factorId: null,
          session,
          status: "loading",
        });
      }

      let nextState = createAuthErrorState(
        new Error("Your session could not be verified."),
        session,
      );
      try {
        nextState = await resolveSessionState(session);
      } catch (error) {
        nextState = createAuthErrorState(error, session);
      } finally {
        commit(requestId, nextState);
      }
      return nextState;
    },
    [commit, updatePrincipal],
  );

  const refreshSession = useCallback(async () => {
    const requestId = ++requestSequence.current;
    commit(requestId, {
      error: null,
      factorId: null,
      session: null,
      status: "loading",
    });

    let nextState: AuthState | null = null;
    try {
      const { data, error } = await getSupabaseClient().auth.getSession();
      if (error) {
        throw new Error(`Your session could not be loaded: ${error.message}`, { cause: error });
      }
      nextState = await inspectSession(data.session, requestId);
    } catch (error) {
      nextState = createAuthErrorState(error, null);
    } finally {
      if (nextState) commit(requestId, nextState);
    }
  }, [commit, inspectSession]);

  useEffect(() => {
    mounted.current = true;
    let unsubscribe: () => void = () => undefined;

    try {
      const {
        data: { subscription },
      } = getSupabaseClient().auth.onAuthStateChange((event, nextSession) => {
        globalThis.setTimeout(() => {
          if (!mounted.current) return;
          const current = stateRef.current;
          const isSamePrincipalRefresh =
            nextSession !== null &&
            current.status !== "loading" &&
            current.session?.user.id === nextSession.user.id &&
            (event === "SIGNED_IN" || event === "TOKEN_REFRESHED");
          void inspectSession(nextSession, undefined, !isSamePrincipalRefresh);
        }, 0);
      });
      unsubscribe = () => subscription.unsubscribe();
    } catch (error) {
      const requestId = ++requestSequence.current;
      commit(requestId, createAuthErrorState(error, null));
    }

    void refreshSession();
    return () => {
      mounted.current = false;
      requestSequence.current += 1;
      unsubscribe();
    };
  }, [commit, inspectSession, refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const requestId = ++requestSequence.current;
      commit(requestId, {
        error: null,
        factorId: null,
        session: null,
        status: "loading",
      });

      let nextState: AuthState | null = null;
      let message: string | null = null;
      try {
        const { data, error } = await getSupabaseClient().auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          message = describeAuthError(error.message);
          nextState = {
            error: null,
            factorId: null,
            session: null,
            status: "signed-out",
          };
        } else {
          nextState = await inspectSession(data.session, requestId);
          if (nextState.status === "error") message = nextState.error?.message ?? "Sign in failed.";
        }
      } catch (error) {
        message = toError(error, "Sign in failed.").message;
        nextState = {
          error: null,
          factorId: null,
          session: null,
          status: "signed-out",
        };
      } finally {
        if (nextState) commit(requestId, nextState);
      }
      return message;
    },
    [commit, inspectSession],
  );

  // A failed sign up leaves the signed-out state untouched so the form keeps what was typed.
  const signUp = useCallback(
    async ({ email, firstName, lastName, password }: SignUpInput): Promise<SignUpOutcome> => {
      try {
        const { data, error } = await getSupabaseClient().auth.signUp({
          email,
          options: {
            data: { first_name: firstName, has_password: true, last_name: lastName },
          },
          password,
        });
        if (error) {
          return { message: describeAuthError(error.message, signUpRejected), status: "error" };
        }
        // Supabase withholds the session until the address is confirmed.
        if (!data.session) return { message: null, status: "confirmation-required" };

        const nextState = await inspectSession(data.session, ++requestSequence.current);
        return nextState.status === "error"
          ? { message: nextState.error?.message ?? "Sign up failed.", status: "error" }
          : { message: null, status: "signed-up" };
      } catch (error) {
        return { message: toError(error, "Sign up failed.").message, status: "error" };
      }
    },
    [inspectSession],
  );

  const signOut = useCallback(async () => {
    const currentSession = state.session;
    const requestId = ++requestSequence.current;
    commit(requestId, {
      error: null,
      factorId: null,
      session: currentSession,
      status: "loading",
    });

    let nextState: AuthState | null = null;
    let message: string | null = null;
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) {
        throw new Error(`Sign out failed: ${error.message}`, { cause: error });
      }
      updatePrincipal(requestId, null);
      queryClient.clear();
      nextState = await inspectSession(null, requestId);
    } catch (error) {
      const normalized = toError(error, "Sign out failed.");
      message = normalized.message;
      nextState = createAuthErrorState(normalized, currentSession);
    } finally {
      if (nextState) commit(requestId, nextState);
    }
    return message;
  }, [commit, inspectSession, queryClient, state.session, updatePrincipal]);

  const reloadVerifiedSession = useCallback(
    async (requestId: number) => {
      const { data, error } = await getSupabaseClient().auth.getSession();
      if (error) {
        throw new Error(`Your verified session could not be loaded: ${error.message}`, {
          cause: error,
        });
      }
      return inspectSession(data.session, requestId);
    },
    [inspectSession],
  );

  // Enrollment verification keeps the caller's state so a rejected code does not discard the
  // in-progress QR code, which Supabase cannot reissue for the same factor.
  const confirmTotpEnrollment = useCallback(
    async (factorId: string, code: string) => {
      const currentSession = stateRef.current.session;
      try {
        const verificationMessage = await challengeAndVerifyTotp(factorId, code);
        if (verificationMessage) return verificationMessage;

        const nextState = await reloadVerifiedSession(++requestSequence.current);
        return nextState.status === "error"
          ? (nextState.error?.message ?? "Authenticator verification failed.")
          : null;
      } catch (error) {
        const normalized = toError(error, "Authenticator verification failed.");
        commit(++requestSequence.current, createAuthErrorState(normalized, currentSession));
        return normalized.message;
      }
    },
    [commit, reloadVerifiedSession],
  );

  const verifyMfa = useCallback(
    (code: string) => {
      if (state.status !== "mfa-required" || !state.factorId || !state.session) {
        return Promise.resolve("No verified authenticator is available.");
      }
      if (mfaRequest.current) return mfaRequest.current;
      const factorId = state.factorId;

      const request = (async () => {
        const previousState = state;
        const requestId = ++requestSequence.current;
        commit(requestId, { ...state, status: "loading" });

        let nextState: AuthState = previousState;
        let message: string | null = null;
        try {
          message = await challengeAndVerifyTotp(factorId, code);
          if (!message) {
            nextState = await reloadVerifiedSession(requestId);
            if (nextState.status === "error") {
              message = nextState.error?.message ?? "MFA verification failed.";
            }
          }
        } catch (error) {
          const normalized = toError(error, "MFA verification failed.");
          message = normalized.message;
          nextState = createAuthErrorState(normalized, previousState.session);
        } finally {
          commit(requestId, nextState);
        }
        return message;
      })();
      const trackedRequest = request.finally(() => {
        if (mfaRequest.current === trackedRequest) mfaRequest.current = null;
      });
      mfaRequest.current = trackedRequest;
      return trackedRequest;
    },
    [commit, reloadVerifiedSession, state],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      confirmTotpEnrollment,
      error: state.error,
      loading: state.status === "loading",
      mfaRequired: state.status === "mfa-required",
      mfaSetupRequired: state.status === "mfa-setup-required",
      retry: refreshSession,
      session: state.session,
      signIn,
      signOut,
      signUp,
      status: state.status,
      user: state.session?.user ?? null,
      verifyMfa,
    }),
    [confirmTotpEnrollment, refreshSession, signIn, signOut, signUp, state, verifyMfa],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
