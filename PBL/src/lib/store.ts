"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildAnalysis,
  rollForIndex,
  seedEvaluations,
  seedPaper,
  UPLOAD_NAME_POOL,
  type Evaluation,
  type Paper,
} from "@/lib/data";
import { uid } from "@/lib/utils";

export interface TeacherProfile {
  name: string;
  email: string;
  department: string;
  designation: string;
}

export interface AppSettings {
  strictness: number;
  autoApprove: boolean;
  showConfidence: boolean;
  emailDigest: boolean;
  weeklyReport: boolean;
}

interface AppState {
  hasHydrated: boolean;
  isAuthed: boolean;
  teacher: TeacherProfile;
  papers: Paper[];
  activePaperId: string | null;
  evaluations: Evaluation[];
  settings: AppSettings;
  uploadCount: number;

  setHasHydrated: (v: boolean) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateTeacher: (patch: Partial<TeacherProfile>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;

  savePaper: (paper: Paper) => void;
  setActivePaper: (id: string | null) => void;

  addStudentFile: (fileName: string) => string;
  ensureAnalysis: (evalId: string) => void;
  regenerate: (evalId: string) => void;
  setMark: (evalId: string, qid: string, marks: number | null, overridden: boolean) => void;
  setComment: (evalId: string, qid: string, comment: string) => void;
  approve: (evalId: string) => void;
  removeStudent: (evalId: string) => void;
  resetDemo: () => void;
}

function seed() {
  const paper = seedPaper();
  return {
    papers: [paper],
    activePaperId: paper.id,
    evaluations: seedEvaluations(paper),
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  strictness: 65,
  autoApprove: false,
  showConfidence: true,
  emailDigest: true,
  weeklyReport: false,
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      isAuthed: false,
      teacher: {
        name: "Prof. Ananya Sharma",
        email: "a.sharma@srtech.edu.in",
        department: "Computer Science & Engineering",
        designation: "Associate Professor",
      },
      ...seed(),
      settings: DEFAULT_SETTINGS,
      uploadCount: 0,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      login: (email, name) =>
        set((s) => ({
          isAuthed: true,
          teacher: {
            ...s.teacher,
            email,
            name: name ?? s.teacher.name,
          },
        })),

      logout: () => set({ isAuthed: false }),

      updateTeacher: (patch) =>
        set((s) => ({ teacher: { ...s.teacher, ...patch } })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      savePaper: (paper) =>
        set((s) => {
          const exists = s.papers.some((p) => p.id === paper.id);
          const papers = exists
            ? s.papers.map((p) => (p.id === paper.id ? paper : p))
            : [...s.papers, paper];
          // Any evaluation that is not yet approved must be re-analysed
          // against the freshly published rubric.
          const evaluations = s.evaluations.map((ev) =>
            ev.status === "approved"
              ? ev
              : { ...ev, paperId: paper.id, analysis: null, status: "pending" as const, syllabusMatch: 0 }
          );
          return { papers, evaluations, activePaperId: paper.id };
        }),

      setActivePaper: (id) => set({ activePaperId: id }),

      addStudentFile: (fileName) => {
        const i = get().uploadCount;
        const name = UPLOAD_NAME_POOL[i % UPLOAD_NAME_POOL.length];
        const id = uid("ev");
        set((s) => ({
          uploadCount: s.uploadCount + 1,
          evaluations: [
            {
              id,
              paperId: s.activePaperId ?? s.papers[0]?.id ?? "",
              student: {
                id: uid("st"),
                name,
                rollNo: rollForIndex(s.uploadCount + 31),
                fileName,
                pages: 2,
              },
              analysis: null,
              syllabusMatch: 0,
              status: "pending",
              approvedAt: null,
            },
            ...s.evaluations,
          ],
        }));
        return id;
      },

      ensureAnalysis: (evalId) =>
        set((s) => {
          const paper =
            s.papers.find((p) => p.id === s.activePaperId) ?? s.papers[0];
          if (!paper) return s;
          return {
            evaluations: s.evaluations.map((ev) =>
              ev.id === evalId && (!ev.analysis || ev.analysis.length === 0)
                ? {
                    ...ev,
                    analysis: buildAnalysis(paper, 0.55 + s.settings.strictness / 300),
                    syllabusMatch: 72 + Math.floor(Math.random() * 24),
                    status: "in-review",
                  }
                : ev
            ),
          };
        }),

      regenerate: (evalId) =>
        set((s) => {
          const paper =
            s.papers.find((p) => p.id === s.activePaperId) ?? s.papers[0];
          if (!paper) return s;
          return {
            evaluations: s.evaluations.map((ev) =>
              ev.id === evalId && ev.status !== "approved"
                ? {
                    ...ev,
                    analysis: buildAnalysis(paper, 0.5 + Math.random() * 0.4),
                    syllabusMatch: 70 + Math.floor(Math.random() * 27),
                    status: "in-review",
                    approvedAt: null,
                  }
                : ev
            ),
          };
        }),

      setMark: (evalId, qid, marks, overridden) =>
        set((s) => ({
          evaluations: s.evaluations.map((ev) =>
            ev.id !== evalId || !ev.analysis
              ? ev
              : {
                  ...ev,
                  analysis: ev.analysis.map((q) =>
                    q.qid === qid
                      ? { ...q, teacherMarks: marks, overridden }
                      : q
                  ),
                }
          ),
        })),

      setComment: (evalId, qid, comment) =>
        set((s) => ({
          evaluations: s.evaluations.map((ev) =>
            ev.id !== evalId || !ev.analysis
              ? ev
              : {
                  ...ev,
                  analysis: ev.analysis.map((q) =>
                    q.qid === qid ? { ...q, comment } : q
                  ),
                }
          ),
        })),

      approve: (evalId) =>
        set((s) => ({
          evaluations: s.evaluations.map((ev) =>
            ev.id === evalId
              ? { ...ev, status: "approved", approvedAt: new Date().toISOString() }
              : ev
          ),
        })),

      removeStudent: (evalId) =>
        set((s) => ({
          evaluations: s.evaluations.filter((ev) => ev.id !== evalId),
        })),

      resetDemo: () =>
        set({
          ...seed(),
          uploadCount: 0,
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "eduassess-store-v1",
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useActivePaper = () =>
  useApp((s) => s.papers.find((p) => p.id === s.activePaperId) ?? s.papers[0] ?? null);
