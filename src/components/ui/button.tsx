import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva("ui-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: { default: "ui-button-primary", outline: "ui-button-outline", ghost: "ui-button-ghost", destructive: "ui-button-destructive" },
    size: { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-xs", icon: "h-9 w-9" },
  }, defaultVariants: { variant: "default", size: "default" },
});
export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(variants({ variant, size, className }))} {...props} />;
}
