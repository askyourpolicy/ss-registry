import type { ComponentProps, ReactNode } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MetricCardTone = "default" | "positive" | "warning" | "destructive" | "info";

type MetricCardProps = Omit<ComponentProps<typeof Card>, "children"> & {
  delta?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  label: ReactNode;
  loading?: boolean;
  tone?: MetricCardTone;
  value: ReactNode;
};

const toneClasses: Record<
  MetricCardTone,
  {
    accent: string;
    delta: string;
    icon: string;
  }
> = {
  default: {
    accent: "text-foreground",
    delta: "bg-muted text-muted-foreground",
    icon: "bg-muted text-muted-foreground",
  },
  positive: {
    accent: "text-status-success",
    delta: "bg-status-success-muted text-status-success-muted-foreground",
    icon: "bg-status-success-muted text-status-success-muted-foreground",
  },
  warning: {
    accent: "text-status-warning",
    delta: "bg-status-warning-muted text-status-warning-muted-foreground",
    icon: "bg-status-warning-muted text-status-warning-muted-foreground",
  },
  destructive: {
    accent: "text-destructive",
    delta: "bg-destructive/10 text-destructive",
    icon: "bg-destructive/10 text-destructive",
  },
  info: {
    accent: "text-status-info",
    delta: "bg-status-info-muted text-status-info-muted-foreground",
    icon: "bg-status-info-muted text-status-info-muted-foreground",
  },
};

function MetricCard({
  className,
  delta,
  description,
  icon,
  label,
  loading = false,
  tone = "default",
  value,
  ...props
}: MetricCardProps) {
  const styles = toneClasses[tone];

  return (
    <Card
      aria-busy={loading || undefined}
      className={className}
      data-component="metric-card"
      data-tone={tone}
      {...props}
    >
      <CardHeader className="gap-2">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <CardDescription className="min-w-0">{label}</CardDescription>
          {icon != null ? (
            <span
              aria-hidden="true"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
                styles.icon,
              )}
            >
              {icon}
            </span>
          ) : null}
        </div>
        {loading ? (
          <Skeleton aria-hidden="true" className="h-8 w-28 max-w-full" />
        ) : (
          <CardTitle className={cn("text-3xl leading-none font-semibold", styles.accent)}>
            {value}
          </CardTitle>
        )}
        {delta != null || description != null ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs leading-snug">
            {delta != null ? (
              <span className={cn("rounded-full px-2 py-0.5 font-medium", styles.delta)}>
                {delta}
              </span>
            ) : null}
            {description != null ? (
              <span className="min-w-0 text-muted-foreground">{description}</span>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
    </Card>
  );
}

export { MetricCard, type MetricCardProps, type MetricCardTone };
