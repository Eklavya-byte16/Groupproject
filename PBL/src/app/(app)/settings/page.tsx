"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BrainCircuit,
  DatabaseBackup,
  MailWarning,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Card, CardHeader, Input, Label, Switch } from "@/components/ui";
import { toast } from "@/components/toast";

export default function SettingsPage() {
  const teacher = useApp((s) => s.teacher);
  const settings = useApp((s) => s.settings);
  const updateTeacher = useApp((s) => s.updateTeacher);
  const updateSettings = useApp((s) => s.updateSettings);
  const resetDemo = useApp((s) => s.resetDemo);

  const [name, setName] = useState(teacher.name);
  const [email, setEmail] = useState(teacher.email);
  const [designation, setDesignation] = useState(teacher.designation);
  const [saving, setSaving] = useState(false);

  const saveProfile = () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.warning("Invalid profile", "Name and a valid institutional email are required.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateTeacher({ name: name.trim(), email: email.trim(), designation });
      setSaving(false);
      toast.success("Profile updated", "Your faculty details have been saved.");
    }, 600);
  };

  const strictLabel =
    settings.strictness >= 75 ? "Strict" : settings.strictness >= 50 ? "Balanced" : settings.strictness >= 30 ? "Lenient" : "Generous";

  return (
    <div className="mx-auto max-w-[860px] space-y-5">
      {/* profile */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <CardHeader icon={UserRound} title="Faculty Profile" subtitle="Shown on grade reports and approval trails" />
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 py-2 pl-2 pr-4">
              <Avatar name={name || teacher.name} className="size-9" />
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{name || teacher.name}</p>
                <Badge tone="indigo" className="mt-0.5">Teacher</Badge>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label required>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label required>Institutional email</Label>
              <Input value={email} type="email" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Designation</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={teacher.department} disabled className="bg-slate-50 text-slate-400" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={saveProfile} loading={saving} icon={Save}>
              Save profile
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* AI preferences */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
        <Card className="p-6">
          <CardHeader icon={BrainCircuit} title="AI Evaluation Preferences" subtitle="Control how the copilot scores and presents analysis" tone="violet" />
          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="mb-0">Scoring strictness</Label>
                <Badge tone={settings.strictness >= 50 ? "indigo" : "amber"}>{strictLabel} · {settings.strictness}%</Badge>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.strictness}
                onChange={(e) => updateSettings({ strictness: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-[11.5px] text-slate-400">
                <span>Reward generous partial phrasing</span>
                <span>Require exact keyword rationale</span>
              </div>
            </div>

            <PrefRow
              icon={SlidersHorizontal}
              title="Show AI confidence scores"
              desc="Display per-question confidence percentages inside the workbench."
              checked={settings.showConfidence}
              onChange={(v) => updateSettings({ showConfidence: v })}
            />
            <PrefRow
              icon={BrainCircuit}
              title="Auto-approve high-confidence sheets"
              desc="Sheets above 96% aggregate confidence skip manual review (you can still reopen)."
              checked={settings.autoApprove}
              onChange={(v) => {
                updateSettings({ autoApprove: v });
                if (v) toast.info("Auto-approve enabled", "High-confidence sheets will be marked approved automatically.");
              }}
            />
          </div>
        </Card>
      </motion.div>

      {/* notifications */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <Card className="p-6">
          <CardHeader icon={Bell} title="Notifications" subtitle="Email and digest preferences" tone="sky" />
          <div className="mt-6 space-y-5">
            <PrefRow
              icon={MailWarning}
              title="Evaluation reminders"
              desc="Nudge me when sheets stay unreviewed for more than 24 hours."
              checked={settings.emailDigest}
              onChange={(v) => updateSettings({ emailDigest: v })}
            />
            <PrefRow
              icon={Bell}
              title="Weekly analytics digest"
              desc="A Monday-morning summary of class performance and weak syllabus areas."
              checked={settings.weeklyReport}
              onChange={(v) => updateSettings({ weeklyReport: v })}
            />
          </div>
        </Card>
      </motion.div>

      {/* danger zone */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
        <Card className="border-rose-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                <DatabaseBackup className="size-4.5" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900">Demo workspace data</h3>
                <p className="mt-0.5 max-w-md text-[13px] leading-relaxed text-slate-500">
                  Restore the seed subject, rubric, students and evaluations. All local edits to papers and marks will be discarded.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => {
                resetDemo();
                toast.success("Demo data reset", "Subject, rubric and evaluation history restored to defaults.");
              }}
            >
              Reset demo data
            </Button>
          </div>
        </Card>
      </motion.div>

      <p className="flex items-center justify-center gap-1.5 pb-4 text-center text-[11.5px] text-slate-400">
        <Trash2 className="size-3" /> EduAssess AI prototype · data persists locally in your browser only
      </p>
    </div>
  );
}

function PrefRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/70">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-slate-800">{title}</p>
        <p className="text-[12px] leading-snug text-slate-500">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
