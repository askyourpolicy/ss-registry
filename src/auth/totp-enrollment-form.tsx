"use client";

import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { AuthError } from "@/auth/auth-error";
import { useAuth } from "@/auth/auth-provider";
import { startTotpEnrollment, type TotpEnrollment } from "@/auth/auth-state";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CopyButton } from "@/components/ui/copy-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export function TotpEnrollmentForm({
  appName,
  onSignOut,
  signingOut,
}: {
  appName: string;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const auth = useAuth();
  const [code, setCode] = useState("");
  const [enrolling, setEnrolling] = useState(true);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [error, setError] = useState("");
  const [secretVisible, setSecretVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const requested = useRef(false);

  const beginEnrollment = useCallback(async () => {
    setEnrolling(true);
    setError("");
    try {
      setEnrollment(await startTotpEnrollment(appName));
    } catch (cause) {
      setEnrollment(null);
      setError(cause instanceof Error ? cause.message : "Authenticator setup failed.");
    } finally {
      setEnrolling(false);
    }
  }, [appName]);

  // Enrolling twice would strand the secret the operator already scanned.
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void beginEnrollment();
  }, [beginEnrollment]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;
    setError("");
    setSubmitting(true);
    try {
      const message = await auth.confirmTotpEnrollment(enrollment.factorId, code);
      if (message) {
        setError(message);
        setCode("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authenticator verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (enrolling) {
    return (
      <div
        aria-live="polite"
        className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
        role="status"
      >
        <Spinner aria-hidden="true" className="size-4" />
        Preparing your authenticator
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="space-y-4 pt-1">
        <AuthError message={error || "Your authenticator could not be set up."} />
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={signingOut}
            onClick={onSignOut}
            type="button"
            variant="outline"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
          <Button className="flex-1" onClick={() => void beginEnrollment()} type="button">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4 pt-1" onSubmit={submit}>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg border border-border-subtle bg-white p-3">
          <img alt="Authenticator enrollment QR code" className="size-40" src={enrollment.qrCode} />
        </div>
        <Collapsible
          className="w-full space-y-1.5"
          onOpenChange={setSecretVisible}
          open={secretVisible}
        >
          <div className="flex justify-center">
            <CollapsibleTrigger render={<Button size="sm" variant="ghost" />}>
              {secretVisible ? <CaretDownIcon /> : <CaretRightIcon />}
              Can’t scan? Enter this key instead.
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <CopyButton
              className="h-auto w-full justify-between px-3 py-2 whitespace-normal"
              label="setup key"
              size="default"
              value={enrollment.secret}
              variant="outline"
            >
              <code className="font-mono text-xs break-all">{enrollment.secret}</code>
            </CopyButton>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="space-y-1.5">
        <Label className="block text-center" htmlFor="enrollment-code">
          Authentication code
        </Label>
        <div className="flex justify-center">
          <InputOTP
            autoComplete="one-time-code"
            disabled={submitting}
            id="enrollment-code"
            maxLength={6}
            onChange={setCode}
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
          disabled={submitting || signingOut}
          onClick={onSignOut}
          type="button"
          variant="outline"
        >
          Sign out
        </Button>
        <Button className="flex-1" disabled={submitting || code.length !== 6} type="submit">
          {submitting ? "Verifying…" : "Enable"}
        </Button>
      </div>
    </form>
  );
}
