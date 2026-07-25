"use client";

import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { AuthError } from "@/auth/auth-error";
import { useAuth } from "@/auth/auth-provider";
import { FullPageSpinner } from "@/auth/guards";
import { SignUpForm } from "@/auth/sign-up-form";
import { TotpEnrollmentForm } from "@/auth/totp-enrollment-form";
import {
  AuthShell,
  AuthShellBrand,
  AuthShellCard,
  AuthShellContent,
  AuthShellFooter,
  AuthShellHeader,
} from "@/components/ui/auth-shell";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { BrandLockup } from "@/components/ui/stitch-brand";

export type AuthPageMode = "sign-in" | "sign-up";

export function AuthPage({ appName, mode = "sign-in" }: { appName: string; mode?: AuthPageMode }) {
  const auth = useAuth();
  const location = useLocation();
  const from = getReturnPath(location.state);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (auth.loading) return <FullPageSpinner label="Checking your session" />;
  if (auth.status === "authenticated") return <Navigate replace to={from} />;

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const message = await auth.signIn(email.trim(), password);
      if (message) setError(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const message = await auth.verifyMfa(code);
      if (message) setError(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "MFA verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    setError("");
    setSubmitting(true);
    try {
      const message = await auth.signOut();
      if (message) setError(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign out failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const content =
    auth.status === "mfa-required" ? (
      <MfaChallengeForm
        code={code}
        error={error}
        onCodeChange={setCode}
        onSignOut={() => void signOut()}
        onSubmit={submitCode}
        submitting={submitting}
      />
    ) : auth.status === "mfa-setup-required" ? (
      <TotpEnrollmentForm
        appName={appName}
        onSignOut={() => void signOut()}
        signingOut={submitting}
      />
    ) : auth.status === "error" ? (
      <AuthError message={error || auth.error?.message || "Your session could not be verified."} />
    ) : mode === "sign-up" ? (
      <SignUpForm />
    ) : (
      <CredentialsForm
        email={email}
        error={error}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={submitCredentials}
        password={password}
        submitting={submitting}
      />
    );

  return (
    <AuthShell className="[&_[data-slot=auth-shell-container]]:gap-4">
      <AuthShellBrand className="justify-start px-3">
        <BrandLockup applicationName={appName} markClassName="size-6" />
      </AuthShellBrand>
      <AuthShellCard>
        <AuthShellHeader className="gap-1 text-left">
          <h1 className="font-heading leading-none font-semibold">{getTitle(auth.status, mode)}</h1>
          {auth.status === "error" ? null : (
            <CardDescription>{getDescription(auth.status, mode, appName)}</CardDescription>
          )}
        </AuthShellHeader>
        <AuthShellContent>{content}</AuthShellContent>
      </AuthShellCard>
      {auth.status === "signed-out" ? (
        <AuthModeSwitch mode={mode} returnState={location.state} />
      ) : null}
    </AuthShell>
  );
}

function AuthModeSwitch({ mode, returnState }: { mode: AuthPageMode; returnState: unknown }) {
  const signingUp = mode === "sign-up";
  return (
    <AuthShellFooter>
      {signingUp ? "Already have an account? " : "Need an account? "}
      <Link
        className="underline underline-offset-3 hover:text-foreground"
        state={returnState}
        to={signingUp ? "/auth" : "/auth/sign-up"}
      >
        {signingUp ? "Sign in" : "Create one"}
      </Link>
    </AuthShellFooter>
  );
}

function CredentialsForm({
  email,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password,
  submitting,
}: {
  email: string;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
  submitting: boolean;
}) {
  return (
    <form className="space-y-4 pt-1" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          autoComplete="username"
          id="email"
          onChange={(event) => onEmailChange(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete="current-password"
          id="password"
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      {error ? <AuthError message={error} /> : null}
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function MfaChallengeForm({
  code,
  error,
  onCodeChange,
  onSignOut,
  onSubmit,
  submitting,
}: {
  code: string;
  error: string;
  onCodeChange: (value: string) => void;
  onSignOut: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}) {
  return (
    <form className="space-y-4 pt-1" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label className="block text-center" htmlFor="mfa-code">
          Authentication code
        </Label>
        <div className="flex justify-center">
          <InputOTP
            autoComplete="one-time-code"
            disabled={submitting}
            id="mfa-code"
            maxLength={6}
            onChange={onCodeChange}
            value={code}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot index={index} key={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      {error ? <AuthError message={error} /> : null}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={submitting}
          onClick={onSignOut}
          type="button"
          variant="outline"
        >
          Start over
        </Button>
        <Button className="flex-1" disabled={submitting || code.length !== 6} type="submit">
          {submitting ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </form>
  );
}

function getReturnPath(state: unknown) {
  if (!state || typeof state !== "object" || !("from" in state)) return "/";
  const from = state.from;
  if (!from || typeof from !== "object" || !("pathname" in from)) return "/";
  return typeof from.pathname === "string" && from.pathname.startsWith("/") ? from.pathname : "/";
}

function getTitle(status: string, mode: AuthPageMode) {
  if (status === "mfa-required") return "Verify your identity";
  if (status === "mfa-setup-required") return "Set up authentication";
  if (status === "error") return "Session verification failed";
  return mode === "sign-up" ? "Create your account" : "Sign in";
}

function getDescription(status: string, mode: AuthPageMode, appName: string) {
  if (status === "mfa-required") return "Enter the code from your authenticator.";
  if (status === "mfa-setup-required") {
    return `${appName} requires a TOTP authenticator.`;
  }
  return mode === "sign-up"
    ? "Use the email a Stitch administrator added to your organization."
    : "Use your Stitch platform credentials.";
}
