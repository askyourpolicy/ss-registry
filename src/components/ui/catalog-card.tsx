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
  /** A secondary chip, such as "Pinned by a release". It sits in the footer, so the title keeps its width. */
  badge?: ReactNode;
  description?: ReactNode;
  /** The blurb always takes this many lines, so every card in a row lines up:
   *  1 truncates, 2 clamps, and "all" shows a short description whole. */
  descriptionLines?: 1 | 2 | "all";
  details?: ReactNode;
  /** Makes the whole card a plain link. Pass `render` instead to use a router's link. */
  href?: string;
  media: ReactNode;
  meta?: ReactNode[];
  /** Makes the whole card a link rendered by this element, for example `<Link to="/items/1" />`. */
  render?: useRender.RenderProp;
  /** A status dot, shown opposite the title. */
  status?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

/** The title's link on a card with an action: it stretches over the whole card. */
const stretchedLink =
  "outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50";

function CatalogCard({
  action,
  badge,
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
  // A card with a button can't sit inside a link. Its title carries the link instead and
  // stretches over the whole card; the footer's badge and action sit above that.
  const stretched = linked && Boolean(action);
  const titleLink = useRender({
    defaultTagName: "a",
    props: mergeProps<"a">({ className: stretchedLink, href }, { children: title }),
    render,
  });

  const card = (
    <Card
      className={cn("h-full", linked && interactiveCard.card, stretched && "relative")}
      data-slot="catalog-card"
      size="sm"
    >
      <CardHeader className="flex items-center gap-3">
        {media}
        <div className="min-w-0 flex-1 space-y-0.5">
          {/* CardTitle balances its text, which wraps it; nowrap lets truncate clip to one line. */}
          <CardTitle
            className={cn(
              "truncate text-nowrap group-data-[size=sm]/card:text-sm",
              linked && interactiveCard.title,
            )}
          >
            {stretched ? titleLink : title}
          </CardTitle>
          {subtitle != null ? (
            <CardDescription className="truncate text-xs">{subtitle}</CardDescription>
          ) : null}
        </div>
        {status ? <div className="shrink-0 self-start text-xs">{status}</div> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p
          className={cn(
            "text-muted-foreground",
            descriptionLines === 1
              ? "truncate"
              : descriptionLines === 2
                ? "line-clamp-2 min-h-10 text-balance"
                : "text-balance",
          )}
          title={
            descriptionLines === 1 && typeof description === "string" ? description : undefined
          }
        >
          {description}
        </p>
        {details}
      </CardContent>
      {meta.length || badge || action ? (
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
          {badge || action ? (
            <div className={cn("ml-auto flex items-center gap-2", stretched && "relative z-10")}>
              {badge}
              {action}
            </div>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );

  const link = useRender({
    defaultTagName: "a",
    props: mergeProps<"a">({ className: interactiveCard.link, href }, { children: card }),
    render,
  });

  if (!linked) return card;
  if (stretched) return <div className="group h-full">{card}</div>;
  return link;
}

export { CatalogCard, CatalogTile, type CatalogCardProps };
