"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BrainCircuit,
  ChartColumn,
  Download,
  Minus,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useApp, useActivePaper } from "@/lib/store";
import { finalMarksOf, keywordStats, questionSummary, toRow, type ResultRow } from "@/lib/data";
import { gradeFor, pct } from "@/lib/utils";
import { Avatar, Badge, Button, Card, CardHeader, Select } from "@/components/ui";
import { toast } from "@/components/toast";

export default function ResultsPage() {
  const router = useRouter();
  const activePaper = useActivePaper();
  const evaluations = useApp((s) => s.evaluations);

  const [query, setQuery] = useState("");
  const [questionId, setQuestionId] = useState<string>("");

  const rows = useMemo(
    () => evaluations.map(toRow).filter((r): r is ResultRow => r !== null),
    [evaluations]
  );

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.rollNo.toLowerCase().includes(query.toLowerCase())
  );

  const qid = questionId || activePaper?.questions[0]?.id || "";
  const question = activePaper?.questions.find((q) => q.id === qid);
  const kwStats = qid ? keywordStats(rows, qid) : [];
  const qSummary = qid ? questionSummary(rows, qid) : { avgFinal: 0, avgAi: 0, count: 0 };

  const approved = rows.filter((r) => r.status === "approved");
  const classAvg = approved.length
    ? Math.round(approved.reduce((a, r) => a + pct(r.finalTotal, r.maxTotal), 0) / approved.length)
    : 0;
  const topper = [...approved].sort((a, b) => b.finalTotal - a.finalTotal)[0];
  const passRate = approved.length
    ? Math.round((approved.filter((r) => pct(r.finalTotal, r.maxTotal) >= 40).length / approved.length) * 100)
    : 0;
  const overrideCount = rows.reduce((a, r) => a + r.qs.filter((q) => q.overridden).length, 0);

  // grade distribution
  const buckets = [
    { label: "90+", min: 90, count: 0, color: "from-emerald-500 to-teal-400" },
    { label: "80–89", min: 80, count: 0, color: "from-teal-500 to-cyan-400" },
    { label: "70–79", min: 70, count: 0, color: "from-indigo-500 to-violet-400" },
    { label: "60–69", min: 60, count: 0, color: "from-sky-500 to-blue-400" },
    { label: "50–59", min: 50, count: 0, color: "from-amber-500 to-orange-400" },
    { label: "< 50", min: 0, count: 0, color: "from-rose-500 to-pink-400" },
  ];
  rows.forEach((r) => {
    const p = pct(r.finalTotal, r.maxTotal);
    const b = buckets.find((x) => p >= x.min);
    if (b) b.count++;
  });
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const exportCsv = () => {
    if (!activePaper) return;
    const header = ["Roll No", "Name", ...activePaper.questions.map((q) => q.number), "AI Total", "Final Total", "Grade", "Status"];
    const lines = rows.map((r) => [
      r.rollNo,
      r.name,
      ...activePaper.questions.map((q) => {
        const qe = r.qs.find((x) => x.qid === q.id);
        return qe ? finalMarksOf(qe) : "-";
      }),
      r.aiTotal,
      r.finalTotal,
      gradeFor(pct(r.finalTotal, r.maxTotal)).label,
      r.status,
    ]);
    const csv = [header, ...lines].map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${activePaper.subjectCode}_gradebook.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Gradebook exported", `${rows.length} records written to ${activePaper.subjectCode}_gradebook.csv`);
  };

  if (!activePaper) return null;

  return (
    <div className="mx-auto max-w-[1240px]">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] font-bold tracking-tight text-slate-900">
            {activePaper.subjectCode} Gradebook
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {activePaper.subjectName} · {activePaper.semester} · {activePaper.examTitle}
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {/* summary strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Users, label: "Sheets processed", value: `${rows.length}`, tone: "text-indigo-600 bg-indigo-50 ring-indigo-100" },
          { icon: ChartColumn, label: "Class average", value: `${classAvg}%`, tone: "text-violet-600 bg-violet-50 ring-violet-100" },
          { icon: Award, label: "Topper", value: topper ? `${topper.name.split(" ")[0]} · ${topper.finalTotal}` : "—", tone: "text-emerald-600 bg-emerald-50 ring-emerald-100" },
          { icon: TrendingUp, label: "Pass rate", value: `${passRate}%`, tone: "text-sky-600 bg-sky-50 ring-sky-100" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="flex items-center gap-3 p-3.5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ${s.tone}`}>
                <s.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium text-slate-400">{s.label}</p>
                <p className="font-display truncate text-[16px] font-bold text-slate-900 tabular-nums">{s.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <CardHeader icon={SlidersHorizontal} title="Evaluated Students" subtitle={`${filtered.length} of ${rows.length} shown · ${overrideCount} teacher overrides applied`} />
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or roll…"
              className="h-9 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] shadow-[0_1px_2px_rgb(16_24_40/0.04)] placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-[0.09em] text-slate-400">
                <th className="px-5 py-3">Student</th>
                {activePaper.questions.map((q) => (
                  <th key={q.id} className="px-3 py-3 text-center">{q.number}</th>
                ))}
                <th className="px-3 py-3 text-center">AI Total</th>
                <th className="px-3 py-3 text-center">Final</th>
                <th className="px-3 py-3 text-center">Δ</th>
                <th className="px-3 py-3 text-center">Grade</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const g = gradeFor(pct(r.finalTotal, r.maxTotal));
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-indigo-50/30"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} tone={i} className="size-8" />
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-semibold text-slate-800">{r.name}</p>
                          <p className="text-[11.5px] text-slate-400">{r.rollNo}</p>
                        </div>
                      </div>
                    </td>
                    {activePaper.questions.map((q) => {
                      const qe = r.qs.find((x) => x.qid === q.id);
                      if (!qe) return <td key={q.id} className="px-3 py-3.5 text-center text-slate-300">—</td>;
                      const diff = qe.overridden && qe.teacherMarks !== null ? qe.teacherMarks - qe.aiMarks : 0;
                      return (
                        <td key={q.id} className="px-3 py-3.5 text-center">
                          <span
                            className={`inline-flex min-w-14 items-center justify-center gap-1 rounded-lg px-2 py-1 font-display text-[12px] font-bold tabular-nums ring-1 ${
                              diff !== 0
                                ? "bg-violet-50 text-violet-600 ring-violet-200"
                                : "bg-slate-50 text-slate-600 ring-slate-200/70"
                            }`}
                          >
                            {finalMarksOf(qe)}/{qe.maxMarks}
                            {diff !== 0 && (
                              <span className="text-[9px]">{diff > 0 ? "↑" : "↓"}</span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3.5 text-center">
                      <span className="font-display text-[13px] font-semibold text-slate-500 tabular-nums">{r.aiTotal}</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="font-display text-[14px] font-bold text-slate-900 tabular-nums">{r.finalTotal}</span>
                      <span className="text-[11px] text-slate-400">/{r.maxTotal}</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {r.delta === 0 ? (
                        <Minus className="mx-auto size-3.5 text-slate-300" />
                      ) : r.delta > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-emerald-600">
                          <ArrowUp className="size-3" />{r.delta}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-rose-500">
                          <ArrowDown className="size-3" />{Math.abs(r.delta)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Badge tone={g.tone} className="font-display text-[12px]">{g.label}</Badge>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Badge tone={r.status === "approved" ? "emerald" : "amber"} dot pulse={r.status !== "approved"}>
                        {r.status === "approved" ? "Published" : "In Review"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 transition-opacity group-hover:opacity-100 text-indigo-600" onClick={() => router.push("/evaluate")}>
                        Review
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="grid place-items-center py-14 text-[13px] text-slate-400">No students match “{query}”.</div>
          )}
        </div>
      </Card>

      {/* analytics row */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* question-wise weak areas */}
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardHeader
              icon={BrainCircuit}
              title="Question-Wise Weak Areas"
              subtitle="Class-wide missing keywords & syllabus gaps"
              tone="violet"
            />
            <Select value={qid} onChange={(e) => setQuestionId(e.target.value)} className="h-9 w-44 text-[12.5px]">
              {activePaper.questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.number} · {q.maxMarks} marks
                </option>
              ))}
            </Select>
          </div>

          {question && (
            <p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2 text-[12px] italic leading-relaxed text-slate-500 ring-1 ring-slate-100">
              “{question.text}”
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Class avg (final)</p>
              <p className="font-display mt-0.5 text-xl font-bold text-slate-900 tabular-nums">
                {qSummary.avgFinal.toFixed(1)}
                <span className="text-[12px] font-semibold text-slate-400"> / {question?.maxMarks}</span>
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI raw avg</p>
              <p className="font-display mt-0.5 text-xl font-bold text-slate-500 tabular-nums">
                {qSummary.avgAi.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
              Most frequently missed concepts
            </p>
            {kwStats.slice(0, 5).map((k, i) => (
              <div key={k.keyword} className="flex items-center gap-3">
                <span className="w-40 truncate text-[12.5px] font-medium text-slate-600">{k.keyword}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${k.missRate}%` }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${k.missRate >= 50 ? "bg-gradient-to-r from-rose-500 to-orange-400" : k.missRate > 0 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`}
                  />
                </div>
                <span className={`w-24 text-right text-[11.5px] font-semibold tabular-nums ${k.missRate >= 50 ? "text-rose-500" : k.missRate > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {k.missed}/{k.total} missed
                </span>
              </div>
            ))}
          </div>

          {kwStats.some((k) => k.missRate >= 50) && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/60 px-3.5 py-3">
              <TrendingDown className="mt-0.5 size-4 shrink-0 text-rose-500" />
              <p className="text-[12.5px] leading-relaxed text-rose-700">
                <span className="font-bold">Weak area detected:</span> the majority of students missed{" "}
                <span className="font-semibold">{kwStats.filter((k) => k.missRate >= 50).map((k) => `“${k.keyword}”`).join(", ")}</span>.
                Consider a remedial tutorial on this sub-topic before the end-semester exam.
              </p>
            </div>
          )}
        </Card>

        {/* grade distribution */}
        <Card className="p-5">
          <CardHeader icon={ChartColumn} title="Grade Distribution" subtitle="Percentage score buckets across evaluated sheets" tone="sky" />
          <div className="mt-6 space-y-3">
            {buckets.map((b, i) => (
              <div key={b.label} className="group flex items-center gap-3">
                <span className="w-12 text-[12px] font-bold text-slate-500 tabular-nums">{b.label}</span>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.count / maxBucket) * 100}%` }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex h-full items-center rounded-lg bg-gradient-to-r px-2.5 ${b.color}`}
                  >
                    {b.count > 0 && (
                      <span className="font-display text-[11px] font-bold text-white">{b.count}</span>
                    )}
                  </motion.div>
                </div>
                <span className="w-14 text-right text-[12px] font-semibold text-slate-500 tabular-nums">
                  {b.count} {b.count === 1 ? "student" : "students"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/40 p-4">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600">
              <BrainCircuit className="size-3.5" /> AI insight
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
              Teacher overrides shifted the class total by{" "}
              <span className="font-bold text-slate-800">
                {rows.reduce((a, r) => a + Math.abs(r.delta), 0)} marks
              </span>{" "}
              across {overrideCount} questions, and AI–teacher agreement stands at{" "}
              <span className="font-bold text-slate-800">
                {rows.length ? Math.round(100 - (rows.reduce((a, r) => a + Math.abs(r.delta), 0) / Math.max(1, rows.reduce((a, r) => a + r.maxTotal, 0))) * 100) : 0}%
              </span>
              . The engine is calibrated well for this rubric.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
