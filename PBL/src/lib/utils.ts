import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const uid = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export const avg = (nums: number[]) =>
  nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;

export type GradeTone = "emerald" | "teal" | "indigo" | "sky" | "amber" | "rose";

export function gradeFor(scorePct: number, passingPct = 40): { label: string; tone: GradeTone } {
  if (scorePct >= 90) return { label: "A+", tone: "emerald" };
  if (scorePct >= 80) return { label: "A", tone: "teal" };
  if (scorePct >= 70) return { label: "B+", tone: "indigo" };
  if (scorePct >= 60) return { label: "B", tone: "sky" };
  if (scorePct >= 50) return { label: "C", tone: "amber" };
  if (scorePct >= passingPct) return { label: "P", tone: "amber" };
  return { label: "F", tone: "rose" };
}

export function todayLong() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
