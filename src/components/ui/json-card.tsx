"use client";

import * as React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JsonViewer, type JsonViewerProps } from "@/components/ui/json-viewer";

type JsonCardProps = Omit<React.ComponentProps<typeof Card>, "children" | "title"> & {
  actions?: React.ReactNode;
  description?: React.ReactNode;
  title: React.ReactNode;
  value: unknown;
  viewerProps?: Omit<JsonViewerProps, "data" | "value">;
};

function JsonCard({ actions, description, title, value, viewerProps, ...props }: JsonCardProps) {
  return (
    <Card data-component="json-card" {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description != null ? <CardDescription>{description}</CardDescription> : null}
        {actions != null ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <JsonViewer value={value} {...viewerProps} />
      </CardContent>
    </Card>
  );
}

export { JsonCard, type JsonCardProps };
