"use client";

import * as React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AccountMenuAvatarProps = Omit<React.ComponentProps<typeof Avatar>, "children"> & {
  alt?: string;
  fallback: React.ReactNode;
  src?: string;
};

function AccountMenuAvatar({
  alt = "",
  className,
  fallback,
  src,
  ...props
}: AccountMenuAvatarProps) {
  return (
    <Avatar className={className} {...props}>
      {src ? <AvatarImage alt={alt} src={src} /> : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

type AccountMenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, "children"> & {
  avatar: React.ReactNode;
  children: React.ReactNode;
  contentProps?: Omit<React.ComponentProps<typeof DropdownMenuContent>, "children">;
  description?: React.ReactNode;
  /** False when the trigger already shows the name and description, so the menu doesn't repeat them. */
  identity?: boolean;
  name: React.ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
};

function AccountMenu({
  avatar,
  children,
  contentProps,
  description,
  identity = true,
  name,
  triggerClassName,
  triggerLabel = "Open account menu",
  ...props
}: AccountMenuProps) {
  const { className: contentClassName, ...resolvedContentProps } = contentProps ?? {};

  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger
        aria-label={triggerLabel}
        render={
          <Button
            className={cn("h-auto min-w-0 justify-start gap-2 px-2 py-1.5", triggerClassName)}
            variant="ghost"
          />
        }
      >
        {avatar}
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm leading-snug font-medium">{name}</span>
          {description != null ? (
            <span className="block truncate text-xs leading-snug text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
        <CaretDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn("min-w-56", contentClassName)}
        {...resolvedContentProps}
      >
        {identity ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2 font-normal" data-slot="account-menu-identity">
                <span className="block truncate text-sm leading-snug font-medium text-foreground">
                  {name}
                </span>
                {description != null ? (
                  <span className="block truncate text-xs leading-snug text-muted-foreground">
                    {description}
                  </span>
                ) : null}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AccountMenu, AccountMenuAvatar, type AccountMenuAvatarProps, type AccountMenuProps };
