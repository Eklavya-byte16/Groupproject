import { avg, clamp, pct, uid } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type EvalStatus = "pending" | "in-review" | "approved";

export interface StudentRef {
  id: string;
  name: string;
  rollNo: string;
  fileName: string;
  pages: number;
}

export interface QuestionRubric {
  id: string;
  number: string;
  text: string;
  maxMarks: number;
  modelAnswer: string;
  keywords: string[];
}

export interface Paper {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
  examTitle: string;
  totalMarks: number;
  passingMarks: number;
  syllabusNotes: string;
  syllabusFileName: string | null;
  sampleFileName: string | null;
  questions: QuestionRubric[];
  status: "draft" | "published";
  createdAt: string;
}

export interface KeywordHit {
  keyword: string;
  matched: boolean;
}

export interface QEval {
  qid: string;
  number: string;
  text: string;
  maxMarks: number;
  aiMarks: number;
  teacherMarks: number | null;
  overridden: boolean;
  comment: string;
  confidence: number;
  keywords: KeywordHit[];
  justification: string;
}

export interface Evaluation {
  id: string;
  paperId: string;
  student: StudentRef;
  analysis: QEval[] | null;
  syllabusMatch: number;
  status: EvalStatus;
  approvedAt: string | null;
}

/* ------------------------------------------------------------------ */
/* AI simulation engine (mock)                                         */
/* ------------------------------------------------------------------ */

const OPENERS = [
  "The response shows a {level} command of the concept.",
  "The student demonstrates a {level} understanding of the topic.",
  "This attempt reflects a {level} engagement with the question.",
];

function levelFor(ratio: number) {
  if (ratio >= 0.85) return "strong";
  if (ratio >= 0.6) return "fair";
  if (ratio >= 0.4) return "partial";
  return "limited";
}

export function justify(
  q: QuestionRubric,
  hits: KeywordHit[],
  aiMarks: number
): string {
  const matched = hits.filter((h) => h.matched).map((h) => h.keyword);
  const missing = hits.filter((h) => !h.matched).map((h) => h.keyword);
  const ratio = matched.length / Math.max(1, hits.length);
  const opener =
    OPENERS[Math.floor(Math.random() * OPENERS.length)].replace(
      "{level}",
      levelFor(ratio)
    );
  const parts: string[] = [opener];
  if (matched.length > 0) {
    parts.push(
      `The answer correctly articulates ${listJoin(matched)}, which aligns with the model answer.`
    );
  }
  if (missing.length > 0) {
    parts.push(
      `However, ${listJoin(missing)} ${
        missing.length > 1 ? "are" : "is"
      } not explicitly addressed — the rubric expects this for full credit.`
    );
  }
  if (aiMarks >= q.maxMarks) {
    parts.push("Full marks recommended with high confidence.");
  } else if (aiMarks >= q.maxMarks * 0.6) {
    parts.push(
      `Partial credit of ${aiMarks}/${q.maxMarks} is recommended based on keyword coverage and reasoning depth.`
    );
  } else {
    parts.push(
      `Significant gaps detected; ${aiMarks}/${q.maxMarks} recommended. Manual review is advised.`
    );
  }
  return parts.join(" ");
}

function listJoin(items: string[]) {
  if (items.length <= 1) return `"${items[0] ?? ""}"`;
  if (items.length === 2) return `"${items[0]}" and "${items[1]}"`;
  return `${items
    .slice(0, -1)
    .map((i) => `"${i}"`)
    .join(", ")} and "${items[items.length - 1]}"`;
}

export function simulateQuestion(
  q: QuestionRubric,
  rigor = 0.74,
  fixedHits?: KeywordHit[],
  fixedMarks?: number
): QEval {
  const hits =
    fixedHits ??
    q.keywords.map((k) => ({ keyword: k, matched: Math.random() < rigor }));
  const coverage = hits.filter((h) => h.matched).length / Math.max(1, hits.length);
  const noise = Math.random() * 1.4 - 0.9;
  const aiMarks = fixedMarks ?? clamp(Math.round(coverage * q.maxMarks + noise), 0, q.maxMarks);
  return {
    qid: q.id,
    number: q.number,
    text: q.text,
    maxMarks: q.maxMarks,
    aiMarks,
    teacherMarks: null,
    overridden: false,
    comment: "",
    confidence: 76 + Math.floor(Math.random() * 21),
    keywords: hits,
    justification: justify(q, hits, aiMarks),
  };
}

export function buildAnalysis(paper: Paper, rigor = 0.74): QEval[] {
  return paper.questions.map((q) => simulateQuestion(q, rigor));
}

/* ------------------------------------------------------------------ */
/* Seed content                                                        */
/* ------------------------------------------------------------------ */

export function seedPaper(): Paper {
  return {
    id: "paper_dsa_midsem",
    subjectCode: "CS-301",
    subjectName: "Data Structures & Algorithms",
    semester: "Semester IV",
    examTitle: "Mid-Semester Theory Examination 2026",
    totalMarks: 50,
    passingMarks: 20,
    syllabusNotes:
      "Unit I–III: Asymptotic analysis & Big-O notation, searching algorithms (linear, binary), stacks, queues and their applications, linked representations, binary trees, BST construction and traversals. Reference: CLRS Ch. 1–4, 10–12.",
    syllabusFileName: "DSA_Syllabus_2026.pdf",
    sampleFileName: "Topper_Sample_Sheet_2025.pdf",
    questions: [
      {
        id: "q_dsa_1",
        number: "Q.1",
        text: "Define time complexity. Compare the worst-case time complexity of Binary Search vs Linear Search using Big-O notation, with a suitable example.",
        maxMarks: 20,
        modelAnswer:
          "Time complexity quantifies the growth of an algorithm's running time with input size n. Linear Search is O(n) worst case since every element may be inspected. Binary Search halves the search interval each step, giving O(log n). Example: for n = 1,000,000, linear search may need 10⁶ comparisons while binary search needs at most ~20.",
        keywords: [
          "Time Complexity",
          "Big-O Notation",
          "O(log n)",
          "Divide and Conquer",
          "Search Interval",
        ],
      },
      {
        id: "q_dsa_2",
        number: "Q.2",
        text: "Differentiate between Stack and Queue data structures. Enlist two real-world applications of each with brief justification.",
        maxMarks: 15,
        modelAnswer:
          "Stack: LIFO ordering with push/pop at one end — used in function call stacks, undo/redo, expression evaluation. Queue: FIFO ordering with enqueue at rear and dequeue at front — used in printer job scheduling, CPU task scheduling, BFS traversal.",
        keywords: [
          "LIFO",
          "FIFO",
          "Push/Pop",
          "Enqueue/Dequeue",
          "Function Call Stack",
          "Printer Queue",
        ],
      },
      {
        id: "q_dsa_3",
        number: "Q.3",
        text: "Construct a Binary Search Tree for the keys [50, 30, 70, 20, 40, 60, 80] and write its In-order and Pre-order traversals. State the height of the tree.",
        maxMarks: 15,
        modelAnswer:
          "Root 50 with left subtree rooted at 30 and right at 70; 20-40 under 30, 60-80 under 70. In-order (sorted): 20 30 40 50 60 70 80. Pre-order: 50 30 20 40 70 60 80. Height = 2 (balanced).",
        keywords: [
          "BST Property",
          "In-order Traversal",
          "Pre-order Traversal",
          "Root 50",
          "Sorted Sequence",
          "Tree Height = 2",
        ],
      },
    ],
    status: "published",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  };
}

function mkEval(
  student: StudentRef,
  paper: Paper,
  analysis: QEval[] | null,
  status: EvalStatus,
  syllabusMatch: number,
  approvedAt: string | null = null
): Evaluation {
  return { id: uid("ev"), paperId: paper.id, student, analysis, status, syllabusMatch, approvedAt };
}

export function seedEvaluations(paper: Paper): Evaluation[] {
  const [q1, q2, q3] = paper.questions;

  const aaravAnalysis: QEval[] = [
    {
      ...simulateQuestion(
        q1,
        0.8,
        q1.keywords.map((k) => ({
          keyword: k,
          matched: k !== "Divide and Conquer",
        })),
        17
      ),
      justification:
        "The response shows a strong command of asymptotic analysis. The student correctly defines Time Complexity and Big-O Notation and derives O(log n) for Binary Search with a clear halving example. However, \"Divide and Conquer\" is not explicitly named as the underlying strategy — the rubric expects this for full credit. Partial credit of 17/20 is recommended.",
      confidence: 94,
    },
    {
      ...simulateQuestion(
        q2,
        0.7,
        q2.keywords.map((k) => ({
          keyword: k,
          matched: !["Enqueue/Dequeue", "Printer Queue"].includes(k),
        })),
        11
      ),
      justification:
        "The student demonstrates a fair understanding of linear data structures. LIFO/FIFO ordering and Push/Pop operations are explained well, and the Function Call Stack application is justified. However, explicit Enqueue/Dequeue terminology is missing and the Printer Queue example is absent; the second queue application described is vague. Partial credit of 11/15 is recommended.",
      confidence: 89,
    },
    {
      ...simulateQuestion(
        q3,
        0.75,
        q3.keywords.map((k) => ({
          keyword: k,
          matched: k !== "Tree Height = 2",
        })),
        13
      ),
      justification:
        "This attempt reflects strong engagement with BST construction. The tree structure respects the BST Property with Root 50 placed correctly, and both In-order Traversal and Pre-order Traversal sequences are correct (Sorted Sequence produced). The height of the tree is not stated explicitly, which the rubric requires. Partial credit of 13/15 is recommended.",
      confidence: 91,
    },
  ];

  const craft = (
    q: QuestionRubric,
    marks: number,
    missed: string[],
    override?: { marks: number; comment: string }
  ): QEval => {
    const base = simulateQuestion(
      q,
      0.9,
      q.keywords.map((k) => ({ keyword: k, matched: !missed.includes(k) })),
      marks
    );
    if (override) {
      base.overridden = true;
      base.teacherMarks = override.marks;
      base.comment = override.comment;
    }
    return base;
  };

  const students: Array<{
    s: StudentRef;
    a: QEval[] | null;
    st: EvalStatus;
    sm: number;
    at?: string;
  }> = [
    {
      s: { id: "st_aarav", name: "Aarav Deshmukh", rollNo: "CS22-015", fileName: "Student_220104_Roll15.pdf", pages: 2 },
      a: aaravAnalysis,
      st: "in-review",
      sm: 88,
    },
    {
      s: { id: "st_meera", name: "Meera Nair", rollNo: "CS22-003", fileName: "Student_220103_Roll03.pdf", pages: 2 },
      a: [craft(q1, 19, []), craft(q2, 14, []), craft(q3, 14, ["Tree Height = 2"])],
      st: "approved",
      sm: 97,
      at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    },
    {
      s: { id: "st_riya", name: "Riya Kapoor", rollNo: "CS22-011", fileName: "Student_220111_Roll11.pdf", pages: 2 },
      a: [
        craft(q1, 15, ["Divide and Conquer"]),
        craft(q2, 11, ["Printer Queue"], { marks: 12, comment: "Second application acceptable — partial logic present." }),
        craft(q3, 11, ["Pre-order Traversal", "Tree Height = 2"]),
      ],
      st: "approved",
      sm: 84,
      at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
    {
      s: { id: "st_dev", name: "Dev Patel", rollNo: "CS22-019", fileName: "Student_220119_Roll19.pdf", pages: 2 },
      a: [
        craft(q1, 12, ["Divide and Conquer", "Search Interval"], { marks: 11, comment: "Worst-case reasoning weak for binary search." }),
        craft(q2, 9, ["Enqueue/Dequeue", "Printer Queue", "Function Call Stack"]),
        craft(q3, 8, ["Pre-order Traversal", "Root 50", "Tree Height = 2"]),
      ],
      st: "approved",
      sm: 71,
      at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      s: { id: "st_sana", name: "Sana Sheikh", rollNo: "CS22-027", fileName: "Student_220127_Roll27.pdf", pages: 2 },
      a: [craft(q1, 18, []), craft(q2, 13, []), craft(q3, 13, ["Tree Height = 2"])],
      st: "approved",
      sm: 93,
      at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      s: { id: "st_ishita", name: "Ishita Verma", rollNo: "CS22-008", fileName: "Student_220108_Roll08.pdf", pages: 2 },
      a: null,
      st: "pending",
      sm: 0,
    },
    {
      s: { id: "st_kabir", name: "Kabir Anand", rollNo: "CS22-023", fileName: "Student_220123_Roll23.pdf", pages: 2 },
      a: null,
      st: "pending",
      sm: 0,
    },
  ];

  return students.map((x) => mkEval(x.s, paper, x.a, x.st, x.sm, x.at ?? null));
}

/* ------------------------------------------------------------------ */
/* Derivations                                                         */
/* ------------------------------------------------------------------ */

export const finalMarksOf = (qe: QEval) =>
  qe.overridden && qe.teacherMarks !== null ? qe.teacherMarks : qe.aiMarks;

export interface ResultRow {
  id: string;
  name: string;
  rollNo: string;
  fileName: string;
  qs: QEval[];
  aiTotal: number;
  finalTotal: number;
  maxTotal: number;
  delta: number;
  status: EvalStatus;
  approvedAt: string | null;
  syllabusMatch: number;
}

export function toRow(ev: Evaluation): ResultRow | null {
  if (!ev.analysis) return null;
  const aiTotal = ev.analysis.reduce((a, q) => a + q.aiMarks, 0);
  const finalTotal = ev.analysis.reduce((a, q) => a + finalMarksOf(q), 0);
  const maxTotal = ev.analysis.reduce((a, q) => a + q.maxMarks, 0);
  return {
    id: ev.id,
    name: ev.student.name,
    rollNo: ev.student.rollNo,
    fileName: ev.student.fileName,
    qs: ev.analysis,
    aiTotal,
    finalTotal,
    maxTotal,
    delta: finalTotal - aiTotal,
    status: ev.status,
    approvedAt: ev.approvedAt,
    syllabusMatch: ev.syllabusMatch,
  };
}

export function keywordStats(rows: ResultRow[], qid: string) {
  const map = new Map<string, { total: number; missed: number }>();
  rows.forEach((r) => {
    const q = r.qs.find((x) => x.qid === qid);
    if (!q) return;
    q.keywords.forEach((h) => {
      const cur = map.get(h.keyword) ?? { total: 0, missed: 0 };
      cur.total += 1;
      if (!h.matched) cur.missed += 1;
      map.set(h.keyword, cur);
    });
  });
  return Array.from(map.entries())
    .map(([keyword, v]) => ({
      keyword,
      ...v,
      missRate: pct(v.missed, v.total),
    }))
    .sort((a, b) => b.missRate - a.missRate);
}

export function questionSummary(rows: ResultRow[], qid: string) {
  const finals: number[] = [];
  const ais: number[] = [];
  rows.forEach((r) => {
    const q = r.qs.find((x) => x.qid === qid);
    if (q) {
      finals.push(finalMarksOf(q));
      ais.push(q.aiMarks);
    }
  });
  return { avgFinal: avg(finals), avgAi: avg(ais), count: finals.length };
}

export const UPLOAD_NAME_POOL = [
  "Tanvi Kulkarni",
  "Rohan Iyer",
  "Ananya Bose",
  "Vikram Reddy",
  "Nidhi Saxena",
  "Farhan Qureshi",
];

export function rollForIndex(i: number) {
  return `CS22-${String((i * 7 + 4) % 40).padStart(3, "0")}`;
}
