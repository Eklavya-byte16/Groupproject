"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minus,
  PenLine,
  Plus,
  RefreshCcw,
  ScanSearch,
  Send,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useApp, useActivePaper } from "@/lib/store";
import { finalMarksOf, type Evaluation, type QEval } from "@/lib/data";
import { clamp, cn, pct } from "@/lib/utils";
import { Avatar, Badge, Button, Card, Select, Switch } from "@/components/ui";
import { Dropzone } from "@/components/dropzone";
import { toast } from "@/components/toast";

const PAGES = ["/images/answer-sheet-p1.jpg", "/images/answer-sheet-p2.jpg"];

const ANALYSIS_STEPS = [
  "Running OCR on scanned handwriting…",
  "Segmenting answers by question number…",
  "Matching weightage keywords against rubric…",
  "Scoring against topper benchmark…",
  "Drafting justifications & confidence…",
];

function AnalysisLoader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ANALYSIS_STEPS.length), 520);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
      <div className="relative grid size-20 place-items-center">
        <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-indigo-100 border-t-indigo-500" />
        <Sparkles className="size-7 text-indigo-500" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mt-5 text-[14px] font-medium text-slate-600"
        >
          {ANALYSIS_STEPS[i]}
        </motion.p>
      </AnimatePresence>
      <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2">
        {[0, 1, 2].map((r) => (
          <div key={r} className="space-y-2">
            <div className="h-2.5 animate-shimmer rounded-full bg-slate-100 bg-shimmer" style={{ animationDelay: `${r * 0.15}s` }} />
            <div className="h-2.5 w-2/3 animate-shimmer rounded-full bg-slate-100 bg-shimmer" style={{ animationDelay: `${r * 0.25}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- score stepper ---------------- */
function ScoreStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-xl border bg-white shadow-sm transition-all",
        disabled ? "border-slate-100 opacity-60" : "border-indigo-200 ring-2 ring-indigo-100"
      )}
    >
      <button
        disabled={disabled}
        onClick={() => onChange(clamp(value - 1, 0, max))}
        className="grid size-9 cursor-pointer place-items-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed"
      >
        <Minus className="size-4" />
      </button>
      <div className="flex h-9 items-center gap-0.5 border-x border-slate-100 px-2">
        <input
          type="number"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0, 0, max))}
          className="font-display w-9 text-center text-[15px] font-bold text-slate-900 focus:outline-none disabled:text-slate-400"
        />
        <span className="text-[12px] font-semibold text-slate-400">/ {max}</span>
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(clamp(value + 1, 0, max))}
        className="grid size-9 cursor-pointer place-items-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ---------------- question accordion card ---------------- */
function QuestionCard({
  q,
  open,
  locked,
  showConfidence,
  onToggle,
  onMark,
  onComment,
}: {
  q: QEval;
  open: boolean;
  locked: boolean;
  showConfidence: boolean;
  onToggle: () => void;
  onMark: (marks: number | null, overridden: boolean) => void;
  onComment: (c: string) => void;
}) {
  const final = finalMarksOf(q);
  const ratio = final / q.maxMarks;
  const matched = q.keywords.filter((k) => k.matched).length;

  return (
    <motion.div layout="position" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <button onClick={onToggle} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/70">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-indigo-500 to-violet-600 font-display text-[11px] font-bold text-white">
          {q.number.replace("Q.", "")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-slate-800">{q.text}</span>
          <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-slate-400">
            <span>{matched}/{q.keywords.length} keywords</span>
            <span className="size-1 rounded-full bg-slate-200" />
            {showConfidence && <span>{q.confidence}% AI confidence</span>}
            {q.overridden && (
              <>
                <span className="size-1 rounded-full bg-slate-200" />
                <span className="inline-flex items-center gap-1 font-semibold text-violet-600">
                  <PenLine className="size-3" /> overridden
                </span>
              </>
            )}
          </span>
        </span>
        <Badge
          tone={ratio >= 0.85 ? "emerald" : ratio >= 0.6 ? "indigo" : ratio >= 0.4 ? "amber" : "rose"}
          className="font-display text-[12px]"
        >
          +{final}/{q.maxMarks} Marks
        </Badge>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-4 text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-4 border-t border-slate-100 px-4 py-4">
              {/* marks + override row */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI suggested</p>
                  <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
                    {q.aiMarks}
                    <span className="text-sm font-semibold text-slate-400"> / {q.maxMarks}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Final marks {q.overridden ? "· manual" : "· auto"}
                    </p>
                  </div>
                  <ScoreStepper
                    value={q.overridden && q.teacherMarks !== null ? q.teacherMarks : q.aiMarks}
                    max={q.maxMarks}
                    disabled={locked || !q.overridden}
                    onChange={(v) => onMark(v, true)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-slate-500">Teacher override</span>
                  <Switch
                    checked={q.overridden}
                    disabled={locked}
                    onChange={(on) => onMark(on ? q.aiMarks : null, on)}
                  />
                </div>
              </div>

              {/* keyword chips */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Keyword breakdown
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {q.keywords.map((k, i) => (
                    <motion.span
                      key={k.keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 24 }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1",
                        k.matched
                          ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                          : "bg-rose-50 text-rose-500 ring-rose-200"
                      )}
                    >
                      {k.matched ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                      {k.keyword}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* justification */}
              <div className="rounded-xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/60 to-violet-50/30 p-3.5">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-500">
                  <Sparkles className="size-3.5" /> AI justification
                </p>
                <p className="text-[12.5px] leading-relaxed text-slate-600">{q.justification}</p>
              </div>

              {/* comment */}
              <AnimatePresence initial={false}>
                {q.overridden && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Teacher remark <span className="font-normal normal-case text-slate-300">(visible on grade report)</span>
                    </p>
                    <textarea
                      rows={2}
                      disabled={locked}
                      value={q.comment}
                      onChange={(e) => onComment(e.target.value)}
                      placeholder="Explain why the AI score was adjusted…"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------------- page ---------------- */
export default function EvaluatePage() {
  const activePaper = useActivePaper();
  const evaluations = useApp((s) => s.evaluations);
  const showConfidence = useApp((s) => s.settings.showConfidence);
  const ensureAnalysis = useApp((s) => s.ensureAnalysis);
  const regenerate = useApp((s) => s.regenerate);
  const setMark = useApp((s) => s.setMark);
  const setComment = useApp((s) => s.setComment);
  const approve = useApp((s) => s.approve);
  const addStudentFile = useApp((s) => s.addStudentFile);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);

  const ev: Evaluation | null = useMemo(
    () => evaluations.find((e) => e.id === selectedId) ?? evaluations[0] ?? null,
    [evaluations, selectedId]
  );

  // kick off analysis when a pending sheet is selected
  useEffect(() => {
    if (!ev) return;
    setOpenIds(ev.analysis?.map((q) => q.qid).slice(0, 1) ?? []);
    setPage(1);
    if (!ev.analysis && ev.status === "pending") {
      setAnalyzing(true);
      const t = setTimeout(() => {
        ensureAnalysis(ev.id);
        setAnalyzing(false);
        toast.success("AI analysis complete", `${ev.student.name}'s sheet is ready for review.`);
      }, 2100);
      return () => clearTimeout(t);
    }
  }, [ev?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activePaper || !ev) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-slate-400">
        No active paper — publish a rubric first in the Paper Studio.
      </div>
    );
  }

  const analysis = ev.analysis;
  const locked = ev.status === "approved";
  const finalTotal = analysis?.reduce((a, q) => a + finalMarksOf(q), 0) ?? 0;
  const aiTotal = analysis?.reduce((a, q) => a + q.aiMarks, 0) ?? 0;
  const maxTotal = analysis?.reduce((a, q) => a + q.maxMarks, 0) ?? activePaper.totalMarks;
  const kwFound = analysis?.reduce((a, q) => a + q.keywords.filter((k) => k.matched).length, 0) ?? 0;
  const kwTotal = analysis?.reduce((a, q) => a + q.keywords.length, 0) ?? 0;
  const scorePct = pct(finalTotal, maxTotal);
  const nextPending = evaluations.find((e) => e.status !== "approved" && e.id !== ev.id);

  const CIRC = 2 * Math.PI * 24;

  const runRegenerate = () => {
    setAnalyzing(true);
    setTimeout(() => {
      regenerate(ev.id);
      setAnalyzing(false);
      setOpenIds([]);
      toast.info("AI analysis regenerated", "Fresh keyword pass completed with updated scoring.");
    }, 2000);
  };

  const runApprove = () => {
    setApproving(true);
    setTimeout(() => {
      approve(ev.id);
      setApproving(false);
      toast.success("Marks approved & submitted", `${ev.student.name}: ${finalTotal}/${maxTotal} pushed to the gradebook.`);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      {/* context strip */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2 pl-3 pr-4 shadow-card">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <ScanSearch className="size-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              {activePaper.subjectCode} — {activePaper.subjectName}
            </p>
            <p className="text-[11.5px] text-slate-400">
              {activePaper.examTitle} · {activePaper.questions.length}Q rubric · {activePaper.totalMarks} marks
            </p>
          </div>
        </div>
        <Badge tone={ev.status === "approved" ? "emerald" : ev.status === "in-review" ? "indigo" : "amber"} dot pulse={ev.status !== "approved"} className="ml-auto">
          {ev.status === "approved" ? "Approved & published" : ev.status === "in-review" ? "AI review in progress" : "Pending analysis"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(380px,5fr)_7fr]">
        {/* ============ LEFT: selector + viewer ============ */}
        <div className="space-y-4">
          {/* student selector */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={ev.student.name} tone={2} className="size-10" />
              <div className="min-w-0 flex-1">
                <Select value={ev.id} onChange={(e) => setSelectedId(e.target.value)} className="h-10 text-[13px]">
                  {evaluations.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.student.name} — {x.student.rollNo} · {x.student.fileName}
                      {x.status === "approved" ? " ✓" : ""}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="slate">
                <UserRound className="size-3" /> Roll {ev.student.rollNo}
              </Badge>
              <Badge tone="slate">
                <FileText className="size-3" /> {ev.student.pages} pages scanned
              </Badge>
              {nextPending && (
                <Badge tone="amber">{evaluations.filter((e) => e.status !== "approved").length} in queue</Badge>
              )}
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <Dropzone
                compact
                label="Upload another answer sheet"
                sampleName="Student_220131_Roll31.pdf"
                onUploaded={(name) => {
                  const id = addStudentFile(name);
                  setSelectedId(id);
                }}
                onClear={() => {}}
              />
            </div>
          </Card>

          {/* PDF viewer */}
          <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-ink-950 shadow-lift">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] px-3.5 py-2.5">
              <FileText className="size-4 text-indigo-300" />
              <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-slate-300">{ev.student.fileName}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="min-w-14 text-center font-display text-[12px] font-semibold text-slate-300 tabular-nums">
                  {page} / {ev.student.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(ev.student.pages, p + 1))}
                  disabled={page >= ev.student.pages}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
                <span className="mx-1 h-4 w-px bg-white/10" />
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ZoomOut className="size-4" />
                </button>
                <span className="min-w-11 text-center font-display text-[12px] font-semibold text-slate-300 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.9, +(z + 0.15).toFixed(2)))}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ZoomIn className="size-4" />
                </button>
                <span className="mx-1 h-4 w-px bg-white/10" />
                <button
                  onClick={() => toast.info("Download started", ev.student.fileName)}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Download className="size-4" />
                </button>
                <button
                  onClick={() => toast.info("Fullscreen preview", "Presenter mode is available in the deployed build.")}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="scroll-slim scroll-slim-dark relative h-[540px] overflow-auto bg-[#0d1220] dot-grid-dark">
              <div className="grid min-h-full min-w-full place-items-center p-8">
                <motion.img
                  key={page}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  src={PAGES[Math.min(page - 1, PAGES.length - 1)]}
                  alt={`Answer sheet page ${page}`}
                  style={{ width: `${88 * zoom}%` }}
                  transition={{ duration: 0.25 }}
                  className="rounded-md shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)] ring-1 ring-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ RIGHT: AI panel ============ */}
        <div className="min-w-0">
          {analyzing || !analysis ? (
            <AnalysisLoader />
          ) : (
            <>
              {/* match status */}
              <Card className="mb-4 p-4">
                <div className="flex flex-wrap items-center gap-5">
                  {/* ring */}
                  <div className="relative grid size-[68px] shrink-0 place-items-center">
                    <svg className="size-[68px] -rotate-90" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="24" fill="none" strokeWidth="5" className="stroke-slate-100" />
                      <motion.circle
                        cx="30"
                        cy="30"
                        r="24"
                        fill="none"
                        strokeWidth="5"
                        strokeLinecap="round"
                        className="stroke-indigo-500"
                        strokeDasharray={CIRC}
                        initial={{ strokeDashoffset: CIRC }}
                        animate={{ strokeDashoffset: CIRC * (1 - ev.syllabusMatch / 100) }}
                        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </svg>
                    <span className="absolute font-display text-[14px] font-bold text-slate-800 tabular-nums">
                      {ev.syllabusMatch}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-slate-800">
                      AI Keyword Matcher
                      <Badge tone={ev.syllabusMatch >= 85 ? "emerald" : ev.syllabusMatch >= 70 ? "indigo" : "amber"}>
                        Syllabus match {ev.syllabusMatch}%
                      </Badge>
                    </p>
                    <p className="mt-1 text-[12.5px] text-slate-500">
                      Keywords found <span className="font-bold text-slate-700">{kwFound}/{kwTotal}</span> across {analysis.length} questions · Benchmark: {activePaper.sampleFileName ?? "default curve"}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="hidden text-right sm:block">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI raw total</p>
                      <p className="font-display text-lg font-bold text-slate-700 tabular-nums">{aiTotal}/{maxTotal}</p>
                    </div>
                    <Button variant="secondary" size="sm" icon={WandSparkles} onClick={runRegenerate} disabled={locked}>
                      Regenerate
                    </Button>
                  </div>
                </div>
              </Card>

              {locked && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3"
                >
                  <BadgeCheck className="size-5 shrink-0 text-emerald-500" />
                  <p className="text-[13px] font-medium text-emerald-700">
                    Approved on {ev.approvedAt ? new Date(ev.approvedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""} — marks are published to the gradebook and locked for editing.
                  </p>
                </motion.div>
              )}

              {/* question accordions */}
              <div className="space-y-3">
                {analysis.map((q, i) => (
                  <motion.div
                    key={q.qid}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <QuestionCard
                      q={q}
                      locked={locked}
                      showConfidence={showConfidence}
                      open={openIds.includes(q.qid)}
                      onToggle={() =>
                        setOpenIds((ids) => (ids.includes(q.qid) ? ids.filter((x) => x !== q.qid) : [...ids, q.qid]))
                      }
                      onMark={(marks, overridden) => setMark(ev.id, q.qid, marks, overridden)}
                      onComment={(c) => setComment(ev.id, q.qid, c)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* sticky footer */}
              <div className="sticky bottom-4 z-20 mt-5">
                <motion.div
                  layout
                  className="overflow-hidden rounded-2xl border border-slate-800/70 bg-ink-950/95 shadow-lift backdrop-blur"
                >
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Final marks {analysis.some((q) => q.overridden) && "· with overrides"}
                      </p>
                      <p className="font-display text-[26px] font-bold leading-none text-white tabular-nums">
                        <AnimatedTotal value={finalTotal} />
                        <span className="text-[15px] font-semibold text-slate-500"> / {maxTotal}</span>
                      </p>
                    </div>
                    <div className="w-28">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            scorePct >= 80 ? "bg-emerald-400" : scorePct >= 50 ? "bg-indigo-400" : "bg-amber-400"
                          )}
                          animate={{ width: `${scorePct}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">{scorePct}% scored</p>
                    </div>
                    <div className="hidden gap-1.5 md:flex">
                      {analysis.map((q) => (
                        <span
                          key={q.qid}
                          className={cn(
                            "rounded-lg px-2 py-1 font-display text-[11px] font-bold ring-1 tabular-nums",
                            q.overridden ? "bg-violet-500/15 text-violet-300 ring-violet-400/30" : "bg-white/5 text-slate-300 ring-white/10"
                          )}
                        >
                          {q.number}: {finalMarksOf(q)}/{q.maxMarks}
                        </span>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2.5">
                      <Button variant="dark" size="sm" icon={RefreshCcw} onClick={runRegenerate} disabled={locked}>
                        Regenerate AI
                      </Button>
                      {locked ? (
                        <Button variant="secondary" size="sm" onClick={() => nextPending && setSelectedId(nextPending.id)}>
                          Next sheet <ChevronRight className="size-3.5" />
                        </Button>
                      ) : (
                        <Button size="sm" loading={approving} onClick={runApprove} className="shadow-[0_0_24px_rgb(99_102_241/0.45)]">
                          <Send className="size-3.5" /> Approve &amp; Submit Marks
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AnimatedTotal({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const from = display;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 500);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}
