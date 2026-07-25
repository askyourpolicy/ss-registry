import type { Session } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/supabase";

export type AuthStatus =
  | "authenticated"
  | "error"
  | "loading"
  | "mfa-required"
  | "mfa-setup-required"
  | "signed-out";

export type AuthState = {
  error: Error | null;
  factorId: string | null;
  session: Session | null;
  status: AuthStatus;
};

export type SignUpInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type SignUpOutcome =
  | { message: null; status: "confirmation-required" }
  | { message: null; status: "signed-up" }
  | { message: string; status: "error" };

export type TotpEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export const initialAuthState: AuthState = {
  error: null,
  factorId: null,
  session: null,
  status: "loading",
};

export function createAuthErrorState(error: unknown, session: Session | null): AuthState {
  return {
    error: toError(error, "Your session could not be verified."),
    factorId: null,
    session,
    status: "error",
  };
}

export async function resolveSessionState(session: Session | null): Promise<AuthState> {
  if (!session) {
    return {
      error: null,
      factorId: null,
      session: null,
      status: "signed-out",
    };
  }

  const { data: factors, error: factorsError } = await getSupabaseClient().auth.mfa.listFactors();
  if (factorsError) {
    throw new Error(`Authenticator factors could not be checked: ${factorsError.message}`, {
      cause: factorsError,
    });
  }

  const verifiedTotp = factors.totp
    .filter((factor) => factor.status === "verified")
    .sort((first, second) => first.id.localeCompare(second.id))[0];
  if (!verifiedTotp) {
    return {
      error: null,
      factorId: null,
      session,
      status: "mfa-setup-required",
    };
  }

  const { data: assurance, error: assuranceError } =
    await getSupabaseClient().auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) {
    throw new Error(`Authenticator assurance could not be checked: ${assuranceError.message}`, {
      cause: assuranceError,
    });
  }

  if (assurance.currentLevel === "aal2") {
    return {
      error: null,
      factorId: null,
      session,
      status: "authenticated",
    };
  }

  if (assurance.currentLevel === "aal1" && assurance.nextLevel === "aal2") {
    return {
      error: null,
      factorId: verifiedTotp.id,
      session,
      status: "mfa-required",
    };
  }

  throw new Error("The session did not provide the required MFA assurance level.");
}

export async function startTotpEnrollment(friendlyName: string): Promise<TotpEnrollment> {
  const { data: factors, error: factorsError } = await getSupabaseClient().auth.mfa.listFactors();
  if (factorsError) {
    throw new Error(
      `Authenticator factors could not be checked: ${describeAuthError(factorsError.message)}`,
      { cause: factorsError },
    );
  }

  // Supabase refuses a new enrollment while abandoned unverified factors remain on the account.
  const unverified = factors.all.filter((factor) => factor.status === "unverified");
  await Promise.all(
    unverified.map(async (factor) => {
      const { error } = await getSupabaseClient().auth.mfa.unenroll({ factorId: factor.id });
      if (error) {
        throw new Error(
          `A previous authenticator could not be removed: ${describeAuthError(error.message)}`,
          { cause: error },
        );
      }
    }),
  );

  const { data, error } = await getSupabaseClient().auth.mfa.enroll({
    factorType: "totp",
    friendlyName,
  });
  if (error) {
    throw new Error(`Authenticator enrollment failed: ${describeAuthError(error.message)}`, {
      cause: error,
    });
  }

  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export async function challengeAndVerifyTotp(factorId: string, code: string) {
  const { data: challenge, error: challengeError } = await getSupabaseClient().auth.mfa.challenge({
    factorId,
  });
  if (challengeError) return describeAuthError(challengeError.message);

  const { error: verifyError } = await getSupabaseClient().auth.mfa.verify({
    challengeId: challenge.id,
    code,
    factorId,
  });
  return verifyError ? describeAuthError(verifyError.message) : null;
}

// Supabase reports 5xx replies by stringifying the whole Response object, so the server's real
// message is lost and `error.message` arrives as "{}". Never show that to an operator.
const opaqueAuthFailure =
  "The authentication service rejected the request without explaining why. Try again, or contact a Stitch administrator if it keeps happening.";

export function describeAuthError(
  message: string | null | undefined,
  fallback = opaqueAuthFailure,
) {
  const described = message?.trim();
  return !described || described === "{}" ? fallback : described;
}

export function toError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback, { cause: error });
}
