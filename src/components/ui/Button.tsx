import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-[var(--shadow-button-primary)] hover:bg-brand-hover disabled:opacity-50",
  secondary:
    "bg-white text-ink shadow-[var(--shadow-button)] hover:text-ink-strong hover:bg-offset/60 disabled:text-faint disabled:hover:bg-white",
  ghost: "text-subdued hover:bg-offset hover:text-ink disabled:text-faint",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2 gap-1 text-[14px] leading-5",
  md: "h-8 px-2.5 gap-1.5 text-[14px] leading-5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "sm", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
