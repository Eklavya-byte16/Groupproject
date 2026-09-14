"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  placeholder = "Type a keyword and press Enter…",
  max = 8,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, "");
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div
      onClick={() => ref.current?.focus()}
      className={cn(
        "flex min-h-11 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-all",
        "hover:border-slate-300 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100"
      )}
    >
      <AnimatePresence mode="popLayout">
        {value.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="group inline-flex items-center gap-1 rounded-lg bg-indigo-50 py-1 pl-2 pr-1 text-[12px] font-semibold text-indigo-600 ring-1 ring-indigo-200/70"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((v) => v !== tag));
              }}
              className="grid size-4 cursor-pointer place-items-center rounded-md text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
            >
              <X className="size-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        ref={ref}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(",")) add(v);
          else setDraft(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="h-6 min-w-32 flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      {value.length === 0 && <Plus className="size-3.5 shrink-0 text-slate-300" />}
    </div>
  );
}
