"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  GraduationCap,
  Lock,
  Mail,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Button, Input, Label } from "@/components/ui";
import { toast } from "@/components/toast";

const DEMO_EMAIL = "a.sharma@srtech.edu.in";
const DEMO_PASS = "sharma@2026";

export default function LoginPage() {
  const router = useRouter();
  const login = useApp((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid institutional email address.";
    if (password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 850));
    login(email, email === DEMO_EMAIL ? "Prof. Ananya Sharma" : undefined);
    toast.success("Welcome back, Prof. Sharma", "Signed in to the Faculty Evaluation Workspace.");
    router.push("/dashboard");
  };

  const quickFill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setErrors({});
    toast.info("Demo credentials filled", "Press Sign In to continue as Prof. Sharma.");
  };

  return (
    <div className="flex min-h-dvh bg-white">
      {/* ---------- Left brand panel ---------- */}
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        <Image
          src="/images/login-art.jpg"
          alt="EduAssess AI abstract artwork"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-950 via-ink-950/60 to-transparent" />
        <div className="absolute inset-0 dot-grid-dark opacity-30" />

        {/* top brand */}
        <div className="relative z-10 flex items-center gap-3 p-10">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
            <GraduationCap className="size-6 text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-white">
              EduAssess <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">AI</span>
            </p>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              S.R. Institute of Technology
            </p>
          </div>
        </div>

        {/* floating proof cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="absolute right-12 top-32 z-10 animate-float-slow rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
              <FileCheck2 className="size-4.5" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-white">Sheet #220104 evaluated</p>
              <p className="text-[11px] text-emerald-300/90">Final marks 41 / 50 · 18 sec</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7 }}
          className="absolute left-16 top-64 z-10 animate-float-slow rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl [animation-delay:1.4s]"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-400/30">
              <ScanSearch className="size-4.5" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-white">Rubric keyword match</p>
              <p className="text-[11px] text-indigo-300/90">14 / 16 concepts detected · 92%</p>
            </div>
          </div>
        </motion.div>

        {/* bottom copy */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-10 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h2 className="font-display max-w-lg text-4xl font-bold leading-[1.1] tracking-tight text-white">
              The copilot for{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                fair, fast
              </span>{" "}
              assessment.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
              Set rubric-driven question papers and let explainable AI pre-check answer
              sheets — with you always holding the final mark.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Keyword rubric matching", "Teacher override control", "Class analytics"].map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-slate-300 backdrop-blur"
                >
                  <CheckCircle2 className="size-3.5 text-indigo-400" /> {f}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ---------- Right form panel ---------- */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-60 [mask-image:radial-gradient(600px_400px_at_center,black,transparent)]" />
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-indigo-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-violet-100/60 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]"
        >
          {/* mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <GraduationCap className="size-5.5 text-white" />
            </div>
            <p className="font-display text-lg font-bold text-slate-900">EduAssess AI</p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3.5 py-1.5 text-[12px] font-semibold text-indigo-600">
            <GraduationCap className="size-3.5" />
            Department of Computer Science & Engineering
          </span>

          <h1 className="font-display mt-5 text-[32px] font-bold leading-tight tracking-tight text-slate-900">
            Faculty sign in
          </h1>
          <p className="mt-1.5 text-[14.5px] text-slate-500">
            Access the automated paper checking &amp; setting portal.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <Label required>Institutional Email</Label>
              <Input
                icon={Mail}
                type="email"
                placeholder="name@srtech.edu.in"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-[12.5px] font-medium text-rose-500"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <Label required hint="6+ characters">
                Password
              </Label>
              <div className="relative">
                <Input
                  icon={Lock}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  error={errors.password}
                  className="pr-11"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-[12.5px] font-medium text-rose-500"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-3.5 rounded border-slate-300 accent-indigo-600"
                />
                Keep me signed in
              </label>
              <button
                onClick={() => toast.info("Reset link sent", "Check your institutional inbox for password recovery.")}
                className="cursor-pointer font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>

            <Button size="lg" loading={loading} onClick={submit} className="w-full">
              {loading ? "Verifying credentials…" : "Sign in to Workspace"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <div className="relative py-1">
              <div className="h-px bg-slate-200" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                faster demo
              </span>
            </div>

            <button
              onClick={quickFill}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-200 bg-gradient-to-b from-violet-50 to-indigo-50/60 py-3 text-[14px] font-semibold text-violet-700 shadow-sm transition-all hover:border-violet-300 hover:shadow-md active:scale-[0.99]"
            >
              <Sparkles className="size-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Demo Login as Prof. Sharma
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-slate-400">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            SSO secured by institute ERP · Academic Session 2025-26
          </div>
        </motion.div>
      </div>
    </div>
  );
}
