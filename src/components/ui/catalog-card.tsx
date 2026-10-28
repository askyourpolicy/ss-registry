"use client";

/**
 * A library card for catalog grids: tile, name, kind and status on top, a
 * blurb that always takes the same number of lines, then a footer with the
 * card's numbers and action, so every card in a row lines up regardless of copy.
 */
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Fragment, type ComponentType, type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { interactiveCard } from "@/lib/interactive";
import { cn } from "@/lib/utils";

function CatalogTile({
  className,
  icon: Icon,
  tint,
}: {
  className?: string;
  icon: ComponentType<{ className?: string }>;
  /** Background and foreground classes for the tile. Defaults to the muted surface. */
  tint?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        tint ?? "bg-muted text-muted-foreground",
        className,
      )}
      data-slot="catalog-tile"
    >
      <Icon className="size-5" />
    </span>
  );
}

type CatalogCardProps = {
  action?: ReactNode;
  description?: ReactNode;
  /** The blurb always takes this many lines, so every card in a row lines up. */
  descriptionLines?: 1 | 2;
  details?: ReactNode;
  /** Makes the whole card a plain link. Pass `render` instead to use a router's link. */
  href?: string;
  media: ReactNode;
  meta?: ReactNode[];
  /** Makes the whole card a link rendered by this element, for example `<Link to="/items/1" />`. */
  render?: useRender.RenderProp;
  /** A status dot, shown opposite the title. */
  status?: ReactNode;
  subtitle: ReactNode;
  title: ReactNode;
};

function CatalogCard({
  action,
  description,
  descriptionLines = 2,
  details,
  href,
  media,
  meta = [],
  render,
  status,
  subtitle,
  title,
}: CatalogCardProps) {
  const linked = Boolean(href || render);

  const card = (
    <Card
      className={cn("h-full", linked && interactiveCard.card)}
      data-slot="catalog-card"
      size="sm"
    >
      <CardHeader className="flex items-center gap-3">
        {media}
        <div className="min-w-0 flex-1 space-y-0.5">
          <CardTitle className={cn("truncate", linked && interactiveCard.title)}>{title}</CardTitle>
          <CardDescription className="truncate text-xs">{subtitle}</CardDescription>
        </div>
        {status ? <div className="shrink-0 self-start text-xs">{status}</div> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p
          className={cn(
            "text-muted-foreground",
            descriptionLines === 1 ? "truncate" : "line-clamp-2 min-h-10 text-balance",
          )}
          title={
            descriptionLines === 1 && typeof description === "string" ? description : undefined
          }
        >
          {description}
        </p>
        {details}
      </CardContent>
      {meta.length || action ? (
        <CardFooter className="min-h-12 flex-wrap justify-between gap-x-3 gap-y-2 py-2.5 text-xs text-muted-foreground tabular-nums">
          {meta.length ? (
            <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              {meta.map((item, index) => (
                <Fragment key={index}>
                  {index ? <span aria-hidden>·</span> : null}
                  <span className="flex items-center">{item}</span>
                </Fragment>
              ))}
            </span>
          ) : null}
          {action ? <div className="ml-auto">{action}</div> : null}
        </CardFooter>
      ) : null}
    </Card>
  );

  const link = useRender({
    defaultTagName: "a",
    props: mergeProps<"a">({ className: interactiveCard.link, href }, { children: card }),
    render,
  });

  return linked ? link : card;
}

export { CatalogCard, CatalogTile, type CatalogCardProps };
