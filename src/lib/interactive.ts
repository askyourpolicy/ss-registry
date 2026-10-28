/**
 * Hover and focus treatments for clickable things that aren't Buttons, so a
 * card or a row responds the same way on every page.
 */

/** A whole Card that navigates: wrap it in a link/button with `link`, put `card` on the Card. */
export const interactiveCard = {
  card: "transition-all group-hover:-translate-y-0.5 group-hover:ring-primary/40 group-focus-visible:ring-primary/50",
  link: "group block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  title: "transition-colors group-hover:text-primary",
};

/** A clickable row in a list or divided card body. Same tint as a TableRow. */
export const interactiveRow =
  "transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50";
