import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-white/[0.02] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200",
          "focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40",
          "hover:border-white/[0.12]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
