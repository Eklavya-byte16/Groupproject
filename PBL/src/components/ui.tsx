"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "outline";
type BtnSize = "sm" | "md" | "lg" | "icon";

const btnVariants: Record<BtnVariant, string> = {
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_24px_-10px_rgb(79_70_229/0.7)] hover:from-indigo-400 hover:to-indigo-600 border border-indigo-500/60",
  secondary:
    "bg-white text-slate-700 border border-slate-200 shadow-card hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent",
  danger:
    "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 shadow-card",
  dark: "bg-ink-900 text-white border border-white/10 hover:bg-ink-800 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
  outline:
    "bg-indigo-50/60 text-indigo-600 border border-indigo-200 hover:bg-indigo-100/70 hover:border-indigo-300",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon: Icon, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 select-none",
        "active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
        "disabled:opacity-55 disabled:pointer-events-none cursor-pointer",
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" />
      )}
      {children}
    </button>
  );
});

/* ---------------- Badge ---------------- */

export type BadgeTone = "indigo" | "emerald" | "amber" | "rose" | "slate" | "violet" | "sky" | "teal";

const badgeTones: Record<BadgeTone, string> = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-200/70",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200/80",
  amber: "bg-amber-50 text-amber-600 ring-amber-200/80",
  rose: "bg-rose-50 text-rose-600 ring-rose-200/80",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  violet: "bg-violet-50 text-violet-600 ring-violet-200/80",
  sky: "bg-sky-50 text-sky-600 ring-sky-200/80",
  teal: "bg-teal-50 text-teal-600 ring-teal-200/80",
};

const dotTones: Record<BadgeTone, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-400",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  teal: "bg-teal-500",
};

export function Badge({
  tone = "slate",
  dot,
  pulse,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide ring-1",
        badgeTones[tone],
        className
      )}
    >
      {dot && (
        <span className={cn("size-1.5 rounded-full", dotTones[tone], pulse && "animate-pulse-dot")} />
      )}
      {children}
    </span>
  );
}

/* ---------------- Card ---------------- */

export function Card({
  className,
  children,
  hover,
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-card border border-slate-100",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:border-slate-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  tone = "indigo",
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  tone?: BadgeTone;
}) {
  const iconTones: Record<BadgeTone, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
    teal: "bg-teal-50 text-teal-600 ring-teal-100",
  };
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl ring-1", iconTones[tone])}>
            <Icon className="size-4.5" />
          </span>
        )}
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------------- Form controls ---------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, icon: Icon, ...rest },
  ref
) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-all placeholder:text-slate-400",
          Icon && "pl-10",
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            : "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100",
          "focus:outline-none",
          className
        )}
        {...rest}
      />
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4",
        error
          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
          : "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100",
        className
      )}
      {...rest}
    />
  );
});

export function Label({
  children,
  required,
  hint,
  className,
}: {
  children: ReactNode;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-slate-700", className)}>
      <span>
        {children}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {hint && <span className="text-[11.5px] font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...rest },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-all hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
});

/* ---------------- Switch ---------------- */

export function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50",
        checked ? "bg-indigo-600" : "bg-slate-200"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(16_24_40/0.3)]",
          checked ? "right-0.5" : "left-0.5"
        )}
      />
    </button>
  );
}

/* ---------------- Progress ---------------- */

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500",
          barClassName
        )}
      />
    </div>
  );
}

/* ---------------- Misc ---------------- */

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-slate-100", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded-md border border-slate-200 bg-slate-50 px-1 text-[10.5px] font-semibold text-slate-500 shadow-[0_1px_0_rgb(15_23_42/0.08)]">
      {children}
    </kbd>
  );
}

export function Avatar({
  name,
  className,
  tone = 0,
}: {
  name: string;
  className?: string;
  tone?: number;
}) {
  const tones = [
    "from-indigo-500 to-violet-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-sky-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-violet-500 to-purple-600",
  ];
  const init = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 select-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white ring-2 ring-white shadow-sm",
        tones[tone % tones.length],
        className
      )}
    >
      {init}
    </span>
  );
}
