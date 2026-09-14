"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  FileScan,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { Avatar, Badge, Kbd } from "@/components/ui";
import { toast } from "@/components/toast";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/paper-builder", label: "Question Bank / Set Paper", icon: Layers },
  { href: "/evaluate", label: "Evaluate Answer Sheets", icon: FileScan, pendingChip: true },
  { href: "/results", label: "Results & Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/dashboard": { title: "Faculty Dashboard", crumb: "Overview" },
  "/paper-builder": { title: "Paper & Rubric Studio", crumb: "Assessment Design" },
  "/evaluate": { title: "AI Evaluation Workbench", crumb: "Answer Sheet Checking" },
  "/results": { title: "Gradebook & Analytics", crumb: "Class Performance" },
  "/settings": { title: "Settings", crumb: "Workspace" },
};

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#f4f6fb]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
          <GraduationCap className="size-7 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span className="size-2 animate-pulse-dot rounded-full bg-indigo-500" />
          Preparing your workspace…
        </div>
      </motion.div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useApp((s) => s.hasHydrated);
  const isAuthed = useApp((s) => s.isAuthed);
  const teacher = useApp((s) => s.teacher);
  const pending = useApp((s) => s.evaluations.filter((e) => e.status !== "approved").length);
  const logout = useApp((s) => s.logout);
  const resetDemo = useApp((s) => s.resetDemo);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthed) router.replace("/login");
  }, [hydrated, isAuthed, router]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!hydrated || !isAuthed) return <Splash />;

  const meta = TITLES[pathname] ?? { title: "EduAssess AI", crumb: "" };

  const navContent = (isMobile: boolean) => (
    <>
      {/* brand */}
      <div className={cn("flex h-16 items-center gap-3 border-b border-white/[0.06] px-4", collapsed && !isMobile && "justify-center px-0")}>
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_20px_rgb(99_102_241/0.45)]">
          <GraduationCap className="size-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold tracking-tight text-white">
              EduAssess <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">AI</span>
            </p>
            <p className="truncate text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Assessment Suite
            </p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      {/* nav */}
      <nav className="scroll-slim scroll-slim-dark flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className={cn("mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600", collapsed && !isMobile && "text-center")}>
          {collapsed && !isMobile ? "· · ·" : "Workspace"}
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const showChip = "pendingChip" in item && item.pendingChip && pending > 0;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150",
                collapsed && !isMobile && "justify-center px-0",
                active ? "text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId={isMobile ? "nav-pill-mobile" : "nav-pill"}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/90 to-violet-600/80 shadow-[0_8px_24px_-8px_rgb(99_102_241/0.8)]"
                />
              )}
              <item.icon className={cn("relative z-10 size-4.5 shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="relative z-10 flex-1 truncate text-left">{item.label}</span>
                  {showChip && (
                    <span
                      className={cn(
                        "relative z-10 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] font-bold",
                        active ? "bg-white/20 text-white" : "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                      )}
                    >
                      {pending}
                    </span>
                  )}
                </>
              )}
              {collapsed && !isMobile && showChip && (
                <span className="absolute right-2 top-2 z-10 size-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div className="border-t border-white/[0.06] p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.05]",
            collapsed && !isMobile && "justify-center bg-transparent p-0 ring-0"
          )}
        >
          <Avatar name={teacher.name} className="size-8" />
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-200">{teacher.name}</p>
              <p className="truncate text-[11px] text-slate-500">{teacher.designation}, CSE</p>
            </div>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed && "Collapse sidebar"}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-dvh">
      {/* desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 272 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 left-0 z-40 hidden flex-col bg-gradient-to-b from-ink-950 via-ink-900 to-[#12172b] shadow-[1px_0_0_rgb(255_255_255/0.04)] lg:flex"
      >
        <div className="pointer-events-none absolute inset-0 dot-grid-dark opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="relative flex h-full flex-col">{navContent(false)}</div>
      </motion.aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink-900 lg:hidden"
            >
              {navContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main column */}
      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[272px]")}>
        {/* topbar */}
        <header className="glass-top sticky top-0 z-30 border-b border-slate-200/70">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-9 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-card lg:hidden"
            >
              <Menu className="size-4.5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display truncate text-[17px] font-bold tracking-tight text-slate-900">
                  {meta.title}
                </h1>
                <Badge tone="indigo" className="hidden sm:inline-flex">
                  <Sparkles className="size-3" /> AI Copilot Active
                </Badge>
              </div>
              <p className="hidden text-[12px] text-slate-400 sm:block">{meta.crumb} · AY 2025-26</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search papers, students…"
                  className="h-9 w-56 rounded-xl border border-slate-200 bg-white/80 pl-9 pr-12 text-[13px] shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-all placeholder:text-slate-400 focus:w-72 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
                <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </div>
              <button
                onClick={() => toast.info("No new alerts", "You're all caught up. 3 answer sheets still await review.")}
                className="relative grid size-9 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-card transition-colors hover:text-indigo-600"
              >
                <Bell className="size-4.5" />
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-card transition-colors hover:border-slate-300"
                >
                  <Avatar name={teacher.name} className="size-7" />
                  <span className="hidden text-[13px] font-semibold text-slate-700 sm:block">
                    {initials(teacher.name)}
                  </span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lift"
                      >
                        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 px-4 py-3">
                          <p className="text-[13.5px] font-semibold text-slate-900">{teacher.name}</p>
                          <p className="truncate text-[12px] text-slate-500">{teacher.email}</p>
                          <p className="mt-0.5 text-[11px] font-medium text-indigo-500">
                            Dept. of {teacher.department}
                          </p>
                        </div>
                        <div className="p-1.5">
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              router.push("/settings");
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Settings className="size-4 text-slate-400" /> Profile & preferences
                          </button>
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              resetDemo();
                              toast.success("Demo data reset", "All papers and evaluations restored to seed state.");
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          >
                            <RotateCcw className="size-4 text-slate-400" /> Reset demo data
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              router.replace("/login");
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <LogOut className="size-4" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* page */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
