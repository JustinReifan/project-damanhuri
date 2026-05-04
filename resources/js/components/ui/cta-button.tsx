
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ctaButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 group relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 hover:-translate-y-1 border border-primary/50 hover:border-primary",
        secondary: "bg-transparent text-secondary-foreground border border-primary/50 hover:bg-secondary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm",
      },
      size: {
        default: "h-12 px-8 py-3",
        lg: "h-12 md:h-14 text-base px-10 py-4 md:text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface CtaButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof ctaButtonVariants> {
  asChild?: boolean;
}

function CtaButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: CtaButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(ctaButtonVariants({ variant, size }), className)}
      {...props}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </Comp>
  );
}

export { CtaButton, ctaButtonVariants };
