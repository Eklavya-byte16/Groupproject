"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloudUpload, FileCheck2, FileText, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "uploading" | "done";

export function Dropzone({
  label,
  sublabel,
  fileName,
  sampleName,
  onUploaded,
  onClear,
  compact,
}: {
  label: string;
  sublabel?: string;
  fileName?: string | null;
  sampleName?: string;
  onUploaded: (name: string) => void;
  onClear?: () => void;
  compact?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(fileName ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulate = (name: string) => {
    setPhase("uploading");
    setProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p = Math.min(100, p + 8 + Math.random() * 18);
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setPhase("done");
          onUploaded(name);
        }, 240);
      }
    }, 110);
  };

  const pick = (files: FileList | null) => {
    const f = files?.[0];
    simulate(f ? f.name : (sampleName ?? "document.pdf"));
  };

  const clear = () => {
    setPhase("idle");
    setProgress(0);
    onClear?.();
  };

  const displayName = phase === "done" ? (fileName ?? sampleName ?? "document.pdf") : null;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />
      <AnimatePresence mode="wait" initial={false}>
        {phase === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3.5 py-3"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
              <FileCheck2 className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-emerald-800">{displayName}</p>
              <p className="text-[11.5px] text-emerald-600">Parsed successfully · ready for AI benchmark</p>
            </div>
            <button
              type="button"
              onClick={clear}
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => phase === "idle" && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (phase === "idle") pick(e.dataTransfer.files);
            }}
            className={cn(
              "relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all",
              compact ? "p-4" : "p-6",
              dragging
                ? "border-indigo-400 bg-indigo-50/80 ring-4 ring-indigo-100"
                : "border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/40"
            )}
          >
            {phase === "uploading" && (
              <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-[2px]">
                <div className="w-56">
                  <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-indigo-500" /> Uploading…
                    </span>
                    <span className="font-display tabular-nums">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center text-center">
              <motion.span
                animate={dragging ? { scale: 1.12, y: -3 } : { scale: 1, y: 0 }}
                className={cn(
                  "mb-2.5 grid place-items-center rounded-xl text-indigo-500 ring-1",
                  compact ? "size-9" : "size-11",
                  "bg-gradient-to-b from-indigo-50 to-white ring-indigo-100 shadow-sm"
                )}
              >
                <CloudUpload className={cn(compact ? "size-4.5" : "size-5")} />
              </motion.span>
              <p className="text-[13.5px] font-semibold text-slate-700">
                {label}{" "}
                <span className="font-normal text-slate-400">or drag & drop</span>
              </p>
              {!compact && (
                <p className="mt-1 text-[12px] text-slate-400">
                  {sublabel ?? "PDF, DOC, DOCX up to 25 MB"}
                </p>
              )}
              {sampleName && phase === "idle" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    simulate(sampleName);
                  }}
                  className="mt-2.5 inline-flex cursor-pointer items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11.5px] font-semibold text-violet-600 ring-1 ring-violet-200/70 transition-colors hover:bg-violet-100"
                >
                  <Wand2 className="size-3" /> Use sample: {sampleName}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
