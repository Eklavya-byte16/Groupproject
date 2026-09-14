"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "success" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "info" }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "warning" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "error" }),
};

const toneStyles: Record<ToastTone, { icon: typeof CheckCircle2; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: "ring-emerald-100", iconColor: "text-emerald-500" },
  info: { icon: Info, ring: "ring-indigo-100", iconColor: "text-indigo-500" },
  warning: { icon: AlertTriangle, ring: "ring-amber-100", iconColor: "text-amber-500" },
  error: { icon: XCircle, ring: "ring-rose-100", iconColor: "text-rose-500" },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const style = toneStyles[item.tone];
  const Icon = style.icon;
  useEffect(() => {}, []);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "pointer-events-auto flex w-[360px] items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-lift ring-1",
        style.ring
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", style.iconColor)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{item.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
