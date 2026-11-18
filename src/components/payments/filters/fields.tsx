import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/ui/cn";

const FIELD =
  "h-8 w-full rounded-md bg-white px-2 text-[14px] text-ink shadow-[var(--shadow-button)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_var(--color-brand),0_0_0_4px_rgb(99_91_255/0.2)]";

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(FIELD, className)} {...props} />;
});

export function SelectField({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select className={cn(FIELD, "appearance-none pr-7", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-subdued"
        aria-hidden
      />
    </span>
  );
}
