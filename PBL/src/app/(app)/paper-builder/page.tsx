"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  ClipboardList,
  FileText,
  FlaskConical,
  Gauge,
  GripVertical,
  Lightbulb,
  ListChecks,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import { useApp, useActivePaper } from "@/lib/store";
import type { Paper, QuestionRubric } from "@/lib/data";
import { uid } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Progress,
  Select,
  Textarea,
} from "@/components/ui";
import { TagInput } from "@/components/tag-input";
import { Dropzone } from "@/components/dropzone";
import { toast } from "@/components/toast";

const STEPS = [
  { id: 1, label: "Paper Meta", icon: ClipboardList, hint: "Basic exam details" },
  { id: 2, label: "Syllabus Context", icon: BookMarked, hint: "Scope & reference" },
  { id: 3, label: "Question Rubric", icon: ListChecks, hint: "Keywords & model answers" },
  { id: 4, label: "Benchmark & Publish", icon: FlaskConical, hint: "Sample sheet + go live" },
];

const emptyQuestion = (n: number): QuestionRubric => ({
  id: uid("q"),
  number: `Q.${n}`,
  text: "",
  maxMarks: 10,
  modelAnswer: "",
  keywords: [],
});

export default function PaperBuilderPage() {
  const router = useRouter();
  const activePaper = useActivePaper();
  const savePaper = useApp((s) => s.savePaper);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [draft, setDraft] = useState<Paper>(() =>
    activePaper
      ? { ...activePaper, questions: activePaper.questions.map((q) => ({ ...q, keywords: [...q.keywords] })) }
      : {
          id: uid("paper"),
          subjectCode: "",
          subjectName: "",
          semester: "Semester IV",
          examTitle: "",
          totalMarks: 50,
          passingMarks: 20,
          syllabusNotes: "",
          syllabusFileName: null,
          sampleFileName: null,
          questions: [emptyQuestion(1)],
          status: "draft",
          createdAt: new Date().toISOString(),
        }
  );
  const [touched, setTouched] = useState(false);

  const allocated = draft.questions.reduce((a, q) => a + (q.maxMarks || 0), 0);
  const keywordCount = draft.questions.reduce((a, q) => a + q.keywords.length, 0);
  const modelAnswerCount = draft.questions.filter((q) => q.modelAnswer.trim().length > 10).length;

  const step1Valid =
    draft.subjectCode.trim() !== "" &&
    draft.subjectName.trim() !== "" &&
    draft.examTitle.trim() !== "" &&
    draft.totalMarks > 0 &&
    draft.passingMarks > 0 &&
    draft.passingMarks <= draft.totalMarks;

  const step3Valid = draft.questions.every(
    (q) => q.text.trim().length > 5 && q.maxMarks > 0 && q.keywords.length >= 2
  );

  const marksBalanced = allocated === draft.totalMarks;

  const readiness = useMemo(() => {
    let score = 0;
    if (step1Valid) score += 25;
    if (draft.syllabusNotes.trim().length > 20 || draft.syllabusFileName) score += 20;
    if (step3Valid) score += 30;
    if (keywordCount >= draft.questions.length * 3) score += 15;
    if (draft.sampleFileName) score += 10;
    return Math.min(100, score);
  }, [step1Valid, step3Valid, draft, keywordCount]);

  const patch = (p: Partial<Paper>) => setDraft((d) => ({ ...d, ...p }));
  const patchQ = (id: string, p: Partial<QuestionRubric>) =>
    setDraft((d) => ({ ...d, questions: d.questions.map((q) => (q.id === id ? { ...q, ...p } : q)) }));

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setTouched(true);
  };

  const publish = () => {
    if (!step1Valid || !step3Valid) {
      toast.warning("Rubric incomplete", "Fill all required fields; each question needs text, marks and ≥2 keywords.");
      return;
    }
    savePaper({ ...draft, status: "published" });
    toast.success("Paper published successfully", `${draft.subjectCode} rubric is live — pending sheets will be re-analysed against it.`);
    router.push("/evaluate");
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* stepper */}
      <div className="relative mb-8">
        <div className="absolute left-0 right-0 top-5 hidden h-px bg-slate-200 md:block" />
        <motion.div
          className="absolute left-0 top-5 hidden h-px bg-gradient-to-r from-indigo-500 to-violet-500 md:block"
          animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="relative grid grid-cols-2 gap-y-4 md:grid-cols-4">
          {STEPS.map((s) => {
            const done = s.id < step;
            const current = s.id === step;
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className="group flex cursor-pointer flex-col items-center gap-1.5"
              >
                <span
                  className={`grid size-10 place-items-center rounded-xl border text-[13px] font-bold transition-all duration-200 ${
                    current
                      ? "border-indigo-600 bg-gradient-to-b from-indigo-500 to-violet-600 text-white shadow-glow scale-110"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 bg-white text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500"
                  }`}
                >
                  {done ? <Check className="size-4.5" /> : <s.icon className="size-4.5" />}
                </span>
                <span className={`text-[12px] font-semibold ${current ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-500"}`}>
                  {s.label}
                </span>
                <span className="hidden text-[10.5px] text-slate-400 md:block">{s.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        {/* form column */}
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: 28 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 * dir }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ---------------- STEP 1 ---------------- */}
              {step === 1 && (
                <Card className="p-6">
                  <CardHeader
                    icon={ClipboardList}
                    title="Paper Meta Information"
                    subtitle="Course mapping and mark scheme for this examination"
                  />
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Label required>Subject Code</Label>
                      <Input
                        placeholder="e.g. CS-301"
                        value={draft.subjectCode}
                        error={touched && !draft.subjectCode.trim() ? "Required" : undefined}
                        onChange={(e) => patch({ subjectCode: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div>
                      <Label required>Subject Name</Label>
                      <Input
                        placeholder="e.g. Data Structures & Algorithms"
                        value={draft.subjectName}
                        error={touched && !draft.subjectName.trim() ? "Required" : undefined}
                        onChange={(e) => patch({ subjectName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label required>Semester</Label>
                      <Select value={draft.semester} onChange={(e) => patch({ semester: e.target.value })}>
                        {["Semester I", "Semester II", "Semester III", "Semester IV", "Semester V", "Semester VI", "Semester VII", "Semester VIII"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label required>Exam Title</Label>
                      <Input
                        placeholder="e.g. Mid-Semester Theory Examination 2026"
                        value={draft.examTitle}
                        error={touched && !draft.examTitle.trim() ? "Required" : undefined}
                        onChange={(e) => patch({ examTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label required hint="grand total">
                        Total Marks
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={draft.totalMarks || ""}
                        onChange={(e) => patch({ totalMarks: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label required hint="must be ≤ total">
                        Passing Marks
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={draft.passingMarks || ""}
                        error={touched && draft.passingMarks > draft.totalMarks ? "Exceeds total marks" : undefined}
                        onChange={(e) => patch({ passingMarks: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* ---------------- STEP 2 ---------------- */}
              {step === 2 && (
                <Card className="p-6">
                  <CardHeader
                    icon={BookMarked}
                    title="Syllabus & Topic Context"
                    subtitle="Ground the AI evaluator in your taught syllabus for accurate matching"
                  />
                  <div className="mt-6 space-y-5">
                    <div>
                      <Label required hint={`${draft.syllabusNotes.length} chars`}>
                        Units, chapters & reference material
                      </Label>
                      <Textarea
                        rows={6}
                        placeholder="Paste unit-wise syllabus coverage… e.g. Unit I–III: Asymptotic analysis & Big-O, stacks, queues, BST traversals. Reference: CLRS Ch. 1–4, 10–12."
                        value={draft.syllabusNotes}
                        onChange={(e) => patch({ syllabusNotes: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label hint="PDF / DOC up to 25 MB">Upload syllabus document</Label>
                      <Dropzone
                        label="Browse syllabus file"
                        fileName={draft.syllabusFileName}
                        sampleName="DSA_Syllabus_2026.pdf"
                        onUploaded={(name) => {
                          patch({ syllabusFileName: name });
                          toast.success("Syllabus uploaded", "AI extracted 14 topic anchors for rubric grounding.");
                        }}
                        onClear={() => patch({ syllabusFileName: null })}
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* ---------------- STEP 3 ---------------- */}
              {step === 3 && (
                <div className="space-y-4">
                  {draft.questions.map((q, idx) => {
                    const complete = q.text.trim().length > 5 && q.maxMarks > 0 && q.keywords.length >= 2;
                    return (
                      <motion.div
                        key={q.id}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <Card className="p-5">
                          <div className="mb-4 flex items-center gap-3">
                            <GripVertical className="size-4 shrink-0 cursor-grab text-slate-300" />
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-indigo-500 to-violet-600 font-display text-[12px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13.5px] font-semibold text-slate-800">Question {idx + 1}</p>
                              <p className="text-[11.5px] text-slate-400">
                                {complete ? "Rubric complete — AI ready" : "Needs text, marks & ≥2 keywords"}
                              </p>
                            </div>
                            <Badge tone={complete ? "emerald" : "amber"} dot>
                              {complete ? "Ready" : "Incomplete"}
                            </Badge>
                            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
                              <span className="px-1 text-[11px] font-semibold uppercase text-slate-400">Marks</span>
                              <input
                                type="number"
                                min={1}
                                value={q.maxMarks || ""}
                                onChange={(e) => patchQ(q.id, { maxMarks: Number(e.target.value) })}
                                className="font-display w-12 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-center text-sm font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (draft.questions.length <= 1) {
                                  toast.warning("At least one question required");
                                  return;
                                }
                                setDraft((d) => ({ ...d, questions: d.questions.filter((x) => x.id !== q.id) }));
                              }}
                              className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                              aria-label="Delete question"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <Label required>Question text</Label>
                                <Textarea
                                  rows={4}
                                  placeholder="Full question as it appears on the exam paper…"
                                  value={q.text}
                                  error={touched && q.text.trim().length <= 5 ? "Describe the question" : undefined}
                                  onChange={(e) => patchQ(q.id, { text: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label hint={`${q.keywords.length}/8 tags`} required>
                                  Weightage keywords / technical terms
                                </Label>
                                <TagInput
                                  value={q.keywords}
                                  onChange={(tags) => patchQ(q.id, { keywords: tags })}
                                  placeholder="e.g. Time Complexity, Big-O, Space Tradeoff…"
                                />
                              </div>
                            </div>
                            <div>
                              <Label hint="AI benchmark">Expected model answer / key points</Label>
                              <Textarea
                                rows={9}
                                placeholder="Ideal answer outline the AI should compare against…"
                                value={q.modelAnswer}
                                onChange={(e) => patchQ(q.id, { modelAnswer: e.target.value })}
                                className="h-full min-h-[196px]"
                              />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}

                  <button
                    onClick={() =>
                      setDraft((d) => ({ ...d, questions: [...d.questions, emptyQuestion(d.questions.length + 1)] }))
                    }
                    className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-[13.5px] font-semibold text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600"
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                      <Plus className="size-3.5" />
                    </span>
                    Add Question {draft.questions.length + 1}
                  </button>
                </div>
              )}

              {/* ---------------- STEP 4 ---------------- */}
              {step === 4 && (
                <Card className="p-6">
                  <CardHeader
                    icon={FlaskConical}
                    title="Sample Answer Sheet Benchmark"
                    subtitle="Upload a topper's script to fine-tune the AI scoring curve"
                  />
                  <div className="mt-6 space-y-6">
                    <Dropzone
                      label="Browse sample answer sheet"
                      sublabel="A high-scoring historical script · PDF or scanned images"
                      fileName={draft.sampleFileName}
                      sampleName="Topper_Sample_Sheet_2025.pdf"
                      onUploaded={(name) => {
                        patch({ sampleFileName: name });
                        toast.success("Benchmark calibrated", "Scoring curve tuned against the topper reference script.");
                      }}
                      onClear={() => patch({ sampleFileName: null })}
                    />

                    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/40 p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 ring-1 ring-indigo-100">
                          <Lightbulb className="size-4" />
                        </span>
                        <div className="text-[12.5px] leading-relaxed text-slate-600">
                          <p className="font-semibold text-slate-800">How benchmarking works</p>
                          The sample script is parsed for phrasing density and keyword placement. The AI then calibrates how strictly partial phrasing is rewarded when checking new student sheets.
                        </div>
                      </div>
                    </div>

                    {!marksBalanced && (
                      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-700">
                        <FileText className="size-4 shrink-0" />
                        Question marks sum to {allocated}, but the declared total is {draft.totalMarks}. Publishing is still allowed — the per-question scheme takes precedence.
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* footer nav */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" onClick={() => go(Math.max(1, step - 1))} disabled={step === 1} icon={ArrowLeft}>
              Previous
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => {
                  if (step === 1 && !step1Valid) {
                    setTouched(true);
                    toast.warning("Complete paper meta", "Subject code, name, title and valid marks are required.");
                    return;
                  }
                  if (step === 3 && !step3Valid) {
                    setTouched(true);
                    toast.warning("Rubric incomplete", "Every question needs text, marks and at least 2 keywords.");
                    return;
                  }
                  go(step + 1);
                }}
              >
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button size="lg" onClick={publish} className="shadow-glow">
                <Rocket className="size-4" /> Save &amp; Publish Paper
              </Button>
            )}
          </div>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <Card className="p-5 xl:sticky xl:top-24">
            <CardHeader icon={Gauge} title="Rubric Health" subtitle="Live readiness metrics" tone="violet" />
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-slate-500">AI readiness</span>
                <span className="font-display font-bold text-slate-800 tabular-nums">{readiness}%</span>
              </div>
              <Progress value={readiness} />
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <HealthRow
                ok={step1Valid}
                label="Paper meta complete"
                detail={step1Valid ? `${draft.subjectCode} · ${draft.totalMarks} marks` : "Missing required fields"}
              />
              <HealthRow
                ok={allocated > 0}
                label="Marks allocated"
                detail={
                  <span>
                    <span className={marksBalanced ? "text-emerald-600" : "text-amber-600"}>{allocated}</span> / {draft.totalMarks} assigned
                  </span>
                }
              />
              <HealthRow
                ok={keywordCount >= draft.questions.length * 3}
                label="Keyword coverage"
                detail={`${keywordCount} weightage terms across ${draft.questions.length} questions`}
              />
              <HealthRow
                ok={modelAnswerCount === draft.questions.length}
                label="Model answers"
                detail={`${modelAnswerCount}/${draft.questions.length} provided`}
              />
              <HealthRow
                ok={Boolean(draft.sampleFileName)}
                label="Benchmark script"
                detail={draft.sampleFileName ? "Topper reference linked" : "Optional — improves calibration"}
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                <Lightbulb className="size-3.5 text-amber-500" /> Rubric tip
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                Strong rubrics use 4–6 unambiguous keywords per question and a model answer of 40+ words. This typically lifts AI–teacher agreement above 90%.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ ok, label, detail }: { ok: boolean; label: string; detail: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"
        }`}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-slate-700">{label}</p>
        <p className="text-[11.5px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
