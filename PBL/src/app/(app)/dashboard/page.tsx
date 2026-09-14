"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  FileScan,
  FileText,
  Gauge,
  Hourglass,
  Layers,
  TrendingUp,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { toRow, type ResultRow } from "@/lib/data";
import { avg, pct, todayLong } from "@/lib/utils";
import { useCountUp } from "@/lib/hooks";
import { Avatar, Badge, Button, Card } from "@/components/ui";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function StatCard({
  icon: Icon,
  label,
  value,
  decimals = 0,
  suffix,
  delta,
  deltaTone = "emerald",
  sub,
  index,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta?: string;
  deltaTone?: "emerald" | "amber";
  sub: string;
  index: number;
}) {
  const animated = useCountUp(value, 1200);
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={index}>
      <Card hover className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-indigo-50 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[12.5px] font-medium text-slate-500">{label}</p>
            <p className="font-display mt-1.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {animated.toFixed(decimals)}
              {suffix && <span className="ml-0.5 text-lg font-semibold text-slate-400">{suffix}</span>}
            </p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-b from-indigo-50 to-white text-indigo-600 ring-1 ring-indigo-100 shadow-sm">
            <Icon className="size-5" />
          </span>
        </div>
        <div className="relative mt-3 flex items-center gap-2">
          {delta && (
            <Badge tone={deltaTone} className="px-2">
              <TrendingUp className="size-3" /> {delta}
            </Badge>
          )}
          <span className="text-[12px] text-slate-400">{sub}</span>
        </div>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const teacher = useApp((s) => s.teacher);
  const papers = useApp((s) => s.papers);
  const evaluations = useApp((s) => s.evaluations);
  const activePaper = useApp((s) => s.papers.find((p) => p.id === s.activePaperId) ?? s.papers[0]);

  const rows = evaluations.map(toRow).filter((r): r is ResultRow => r !== null);
  const approvedRows = rows.filter((r) => r.status === "approved");
  const pendingEvs = evaluations.filter((e) => e.status !== "approved");
  const avgScore = approvedRows.length
    ? Math.round(avg(approvedRows.map((r) => pct(r.finalTotal, r.maxTotal))))
    : 0;

  const firstName = teacher.name.replace(/^Prof\.\s*/, "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalQMarks = activePaper?.questions.reduce((a, q) => a + q.maxMarks, 0) ?? 0;

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* greeting */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-slate-400">{todayLong()}</p>
          <h2 className="font-display mt-1 text-[28px] font-bold tracking-tight text-slate-900">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Prof. {firstName}
            </span>
          </h2>
        </div>
        {activePaper && (
          <button
            onClick={() => router.push("/paper-builder")}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-card transition-all hover:border-indigo-200 hover:shadow-lift"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <BookOpenCheck className="size-4.5" />
            </span>
            <span className="text-left">
              <span className="block text-[12.5px] font-semibold text-slate-800">
                {activePaper.subjectCode} · {activePaper.examTitle}
              </span>
              <span className="block text-[11.5px] text-slate-400">
                Rubric live · {activePaper.questions.length} questions · {totalQMarks} marks
              </span>
            </span>
            <ArrowUpRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500" />
          </button>
        )}
      </motion.div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Layers} label="Total Papers Created" value={papers.length + 11} delta="+3" sub="this semester" index={1} />
        <StatCard icon={FileScan} label="Answer Sheets Evaluated" value={approvedRows.length} delta="+2" sub="last 24 hours" index={2} />
        <StatCard icon={Hourglass} label="Pending Checks" value={pendingEvs.length} delta={pendingEvs.length > 2 ? "High" : "On track"} deltaTone={pendingEvs.length > 2 ? "amber" : "emerald"} sub="in your queue" index={3} />
        <StatCard icon={Gauge} label="Average Class Score" value={avgScore} suffix="%" decimals={0} delta="+4.2%" sub="vs last mid-sem" index={4} />
      </div>

      {/* CTAs */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            title: "Create & Set Exam Paper",
            desc: "Design a rubric-driven question paper with model answers, keyword weightage and AI benchmark tuning.",
            icon: ClipboardList,
            meta: [`${papers.length} published`, `${activePaper?.questions.length ?? 0} rubric questions`, "Syllabus-aware"],
            cta: "Open Paper Studio",
            href: "/paper-builder",
            glow: "from-indigo-500/15 via-transparent to-transparent",
            ring: "group-hover:border-indigo-200",
            iconBg: "from-indigo-500 to-violet-600",
          },
          {
            title: "Evaluate Student Answer Sheets",
            desc: "Upload scanned scripts, review AI-suggested marks per question, and approve with a single click.",
            icon: FileScan,
            meta: [`${pendingEvs.length} awaiting review`, `${approvedRows.length} approved today`, "OCR + keyword engine"],
            cta: "Open Evaluation Workbench",
            href: "/evaluate",
            glow: "from-emerald-500/15 via-transparent to-transparent",
            ring: "group-hover:border-emerald-200",
            iconBg: "from-emerald-500 to-teal-600",
          },
        ].map((c, i) => (
          <motion.button
            key={c.title}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5 + i}
            onClick={() => router.push(c.href)}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift ${c.ring}`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative flex items-start justify-between">
              <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}>
                <c.icon className="size-6" />
              </span>
              <span className="grid size-9 place-items-center rounded-full border border-slate-200 text-slate-400 transition-all duration-200 group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white">
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:-rotate-45" />
              </span>
            </div>
            <h3 className="font-display relative mt-5 text-[19px] font-bold tracking-tight text-slate-900">
              {c.title}
            </h3>
            <p className="relative mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-slate-500">{c.desc}</p>
            <div className="relative mt-4 flex flex-wrap gap-2">
              {c.meta.map((m) => (
                <span key={m} className="rounded-full bg-slate-50 px-2.5 py-1 text-[11.5px] font-semibold text-slate-500 ring-1 ring-slate-200/70">
                  {m}
                </span>
              ))}
            </div>
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600">
              {c.cta}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        ))}
      </div>

      {/* lower grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* pending queue */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="xl:col-span-3">
          <Card className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-[15.5px] font-semibold tracking-tight text-slate-900">Evaluation Queue</h3>
                <p className="mt-0.5 text-[12.5px] text-slate-400">Sheets waiting for your review</p>
              </div>
              <Badge tone="amber" dot pulse={pendingEvs.length > 0}>
                {pendingEvs.length} pending
              </Badge>
            </div>
            <div className="mt-4 flex-1 space-y-2">
              {pendingEvs.slice(0, 4).map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40"
                >
                  <Avatar name={ev.student.name} tone={i + 1} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-slate-800">{ev.student.name}</p>
                    <p className="truncate text-[11.5px] text-slate-400">
                      {ev.student.rollNo} · {ev.student.fileName}
                    </p>
                  </div>
                  <Badge tone={ev.status === "in-review" ? "indigo" : "slate"}>
                    {ev.status === "in-review" ? "In Review" : "Pending"}
                  </Badge>
                  <Button size="sm" variant={ev.status === "in-review" ? "primary" : "secondary"} onClick={() => router.push("/evaluate")}>
                    {ev.status === "in-review" ? "Resume" : "Start"}
                  </Button>
                </motion.div>
              ))}
              {pendingEvs.length === 0 && (
                <div className="grid h-32 place-items-center rounded-xl border border-dashed border-slate-200 text-[13px] text-slate-400">
                  All caught up — no sheets awaiting review.
                </div>
              )}
            </div>
            <Button variant="ghost" className="mt-3 w-full text-indigo-600 hover:bg-indigo-50" onClick={() => router.push("/evaluate")}>
              Open full workbench <ArrowRight className="size-3.5" />
            </Button>
          </Card>
        </motion.div>

        {/* class snapshot */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} className="xl:col-span-2">
          <Card className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-[15.5px] font-semibold tracking-tight text-slate-900">Class Snapshot</h3>
                <p className="mt-0.5 text-[12.5px] text-slate-400">
                  {activePaper?.subjectCode} · approved scripts
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                <Users className="size-4.5" />
              </span>
            </div>

            {/* mini bar chart */}
            <div className="mt-5 flex flex-1 items-end gap-2.5 px-1">
              {approvedRows.map((r, i) => {
                const p = pct(r.finalTotal, r.maxTotal);
                return (
                  <div key={r.id} className="group flex flex-1 flex-col items-center gap-1.5">
                    <span className="font-display text-[11px] font-bold text-slate-500 tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                      {p}%
                    </span>
                    <div className="flex h-36 w-full items-end overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${p}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-full rounded-lg ${
                          p >= 90
                            ? "bg-gradient-to-t from-emerald-500 to-teal-400"
                            : p >= 70
                              ? "bg-gradient-to-t from-indigo-500 to-violet-400"
                              : "bg-gradient-to-t from-amber-500 to-orange-400"
                        }`}
                      />
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-400">
                      {r.name.split(" ")[0].slice(0, 6)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <div className="rounded-xl bg-emerald-50/70 px-3 py-2.5 ring-1 ring-emerald-100">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="size-3" /> Pass rate
                </p>
                <p className="font-display mt-0.5 text-lg font-bold text-emerald-700 tabular-nums">
                  {approvedRows.length ? Math.round((approvedRows.filter((r) => pct(r.finalTotal, r.maxTotal) >= 40).length / approvedRows.length) * 100) : 0}%
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50/70 px-3 py-2.5 ring-1 ring-indigo-100">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                  <FileText className="size-3" /> Topper
                </p>
                <p className="font-display mt-0.5 truncate text-lg font-bold text-indigo-700">
                  {[...approvedRows].sort((a, b) => b.finalTotal - a.finalTotal)[0]?.name.split(" ")[0] ?? "—"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
