import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline",
        /* New: gradient brand button for hero CTAs */
        brand:
          "text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-[0.98]",
        /* New: subtle outlined brand variant */
        "outline-brand":
          "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98]",
        /* New: ghost on dark backgrounds */
        "ghost-dark":
          "text-white/85 hover:bg-white/10 hover:text-white active:scale-[0.98]",
        /* New: white filled for dark hero sections */
        white:
          "bg-white text-gray-900 shadow-md hover:bg-white/90 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-lg px-7 text-base",
        xl:      "h-13 rounded-lg px-9 text-base",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isBrand = variant === "brand";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={
          isBrand
            ? { background: "var(--gradient-brand)", ...style }
            : style
        }
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };