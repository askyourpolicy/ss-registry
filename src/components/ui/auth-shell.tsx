import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BrandLockup } from "@/components/ui/stitch-brand";
import { cn } from "@/lib/utils";

function AuthShell({ className, children, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "grid min-h-svh place-items-center bg-background px-4 py-10 sm:px-6",
        className,
      )}
      data-slot="auth-shell"
      {...props}
    >
      <div className="flex w-full max-w-sm flex-col gap-6" data-slot="auth-shell-container">
        {children}
      </div>
    </main>
  );
}

function AuthShellBrand({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex justify-center", className)} data-slot="auth-shell-brand" {...props}>
      {children ?? <BrandLockup />}
    </div>
  );
}

function AuthShellCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("w-full", className)} data-component="auth-shell-card" {...props} />;
}

function AuthShellHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      className={cn("text-center", className)}
      data-component="auth-shell-header"
      {...props}
    />
  );
}

function AuthShellContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={className} data-component="auth-shell-content" {...props} />;
}

function AuthShellCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      className={cn("flex-col items-stretch gap-2", className)}
      data-component="auth-shell-card-footer"
      {...props}
    />
  );
}

function AuthShellFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn("text-center text-xs leading-snug text-muted-foreground", className)}
      data-slot="auth-shell-footer"
      {...props}
    />
  );
}

export {
  AuthShell,
  AuthShellBrand,
  AuthShellCard,
  AuthShellCardFooter,
  AuthShellContent,
  AuthShellFooter,
  AuthShellHeader,
};
