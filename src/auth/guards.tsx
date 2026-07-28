"use client";

import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import { isStitchEmail } from "@/auth/authorization";
import { useAuth } from "@/auth/auth-provider";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) return <FullPageSpinner label="Loading your session" />;
  if (auth.status !== "authenticated") {
    return <Navigate replace state={{ from: location }} to="/auth" />;
  }
  return <Outlet />;
}

export function StitchOnlyRoute() {
  const auth = useAuth();
  return (
    <StitchEmailGate email={auth.user?.email}>
      <Outlet />
    </StitchEmailGate>
  );
}

export function StitchEmailGate({
  children,
  email,
}: {
  children: ReactNode;
  email: string | null | undefined;
}) {
  return isStitchEmail(email) ? children : <Navigate replace to="/" />;
}

export function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="grid min-h-svh place-items-center bg-background">
      <div
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <Spinner aria-hidden="true" className="size-4" />
        {label}
      </div>
    </div>
  );
}
