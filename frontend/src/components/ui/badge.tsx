import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-muted text-muted-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground border-border",
        success: "border-transparent bg-status-healthy/10 text-status-healthy",
        warning: "border-transparent bg-status-warning/10 text-status-warning",
        critical: "border-transparent bg-status-danger/10 text-status-danger",
        high: "border-transparent bg-status-danger/10 text-status-danger",
        medium: "border-transparent bg-status-warning/10 text-status-warning",
        low: "border-transparent bg-status-healthy/10 text-status-healthy",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
