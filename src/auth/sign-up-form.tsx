"use client";

import { type FormEvent, useState } from "react";

import { AuthError } from "@/auth/auth-error";
import { useAuth } from "@/auth/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const minimumPasswordLength = 8;

export function SignUpForm() {
  const auth = useAuth();
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) {
      setError("Enter your first and last name.");
      return;
    }
    if (password.length < minimumPasswordLength) {
      setError(`Password must be at least ${minimumPasswordLength} characters.`);
      return;
    }

    const trimmedEmail = email.trim();
    setSubmitting(true);
    try {
      const outcome = await auth.signUp({
        email: trimmedEmail,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        password,
      });
      if (outcome.status === "error") setError(outcome.message);
      if (outcome.status === "confirmation-required") setConfirmationEmail(trimmedEmail);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <div className="pt-1">
        <Alert>
          <AlertTitle>Confirm your email</AlertTitle>
          <AlertDescription>
            We sent a confirmation link to {confirmationEmail}. Open it, then sign in to set up your
            authenticator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form className="space-y-4 pt-1" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first-name">First name</Label>
          <Input
            autoComplete="given-name"
            id="first-name"
            onChange={(event) => setFirstName(event.target.value)}
            required
            value={firstName}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last-name">Last name</Label>
          <Input
            autoComplete="family-name"
            id="last-name"
            onChange={(event) => setLastName(event.target.value)}
            required
            value={lastName}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sign-up-email">Email</Label>
        <Input
          autoComplete="email"
          id="sign-up-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sign-up-password">Password</Label>
        <Input
          autoComplete="new-password"
          id="sign-up-password"
          minLength={minimumPasswordLength}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <p className="text-xs text-muted-foreground">
          At least {minimumPasswordLength} characters.
        </p>
      </div>
      {error ? <AuthError message={error} /> : null}
      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
