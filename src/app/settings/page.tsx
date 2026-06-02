"use client";

import { motion } from "framer-motion";
import { Bell, Building2, Globe, Palette, User } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-2xl neu-raised-xs flex items-center justify-center shrink-0">
            <Icon className="size-5 tint-text" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground/80">{description}</p>
          </div>
        </div>
        <Separator className="bg-foreground/8" />
        {children}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-foreground/70">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl neu-inset px-4 py-3 cursor-pointer">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/80">{description}</p>
      </div>
      <Checkbox defaultChecked={defaultChecked} className="size-5" />
    </label>
  );
}

export default function SettingsPage() {
  return (
    <PageShell title="הגדרות">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bloom bloom-indigo rounded-3xl space-y-4"
      >
        <div className="space-y-1.5 px-1">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
            הגדרות
          </h1>
          <p className="text-xs text-muted-foreground/80">
            ניהול פרטי המועדון, התראות והעדפות תצוגה
          </p>
        </div>

        <SettingsSection
          icon={Building2}
          title="פרטי המועדון"
          description="שם המועדון ופרטי קשר המוצגים במערכת"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם המועדון">
              <Input
                defaultValue="Chess Nimbus"
                className="h-10 neu-inset border-0 rounded-xl text-sm"
              />
            </Field>
            <Field label="דוא״ל ליצירת קשר">
              <Input
                type="email"
                defaultValue="info@chessnimbus.co.il"
                dir="ltr"
                className="h-10 neu-inset border-0 rounded-xl text-sm text-start"
              />
            </Field>
            <Field label="טלפון">
              <Input
                defaultValue="03-1234567"
                dir="ltr"
                className="h-10 neu-inset border-0 rounded-xl text-sm text-start"
              />
            </Field>
            <Field label="כתובת">
              <Input
                defaultValue="רחוב המלך 1, תל אביב"
                className="h-10 neu-inset border-0 rounded-xl text-sm"
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="התראות"
          description="בחר אילו עדכונים תרצה לקבל"
        >
          <div className="space-y-2.5">
            <ToggleRow
              label="התראות דוא״ל"
              description="קבלת סיכום שבועי ועדכוני תחרויות בדוא״ל"
              defaultChecked
            />
            <ToggleRow
              label="תזכורות אירועים"
              description="תזכורת לפני תחילת חוג, תחרות או אירוע"
              defaultChecked
            />
            <ToggleRow
              label="עדכוני מערכת"
              description="הודעות על תכונות חדשות ושינויים במערכת"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Palette}
          title="תצוגה"
          description="התאמת מראה המערכת"
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl neu-inset px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">ערכת נושא</p>
              <p className="text-xs text-muted-foreground/80">
                מעבר בין מצב בהיר לכהה
              </p>
            </div>
            <div className="neu-raised-xs neu-interactive rounded-xl">
              <ThemeToggle />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Globe}
          title="שפה ואזור"
          description="העדפות שפה ופורמט תאריכים"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שפה">
              <Input
                defaultValue="עברית"
                className="h-10 neu-inset border-0 rounded-xl text-sm"
              />
            </Field>
            <Field label="אזור זמן">
              <Input
                defaultValue="(GMT+2) ירושלים"
                className="h-10 neu-inset border-0 rounded-xl text-sm"
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={User}
          title="חשבון"
          description="פרטי המשתמש המחובר"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם מלא">
              <Input
                defaultValue="מנהל המועדון"
                className="h-10 neu-inset border-0 rounded-xl text-sm"
              />
            </Field>
            <Field label="דוא״ל">
              <Input
                type="email"
                defaultValue="yoavbdov@gmail.com"
                dir="ltr"
                className="h-10 neu-inset border-0 rounded-xl text-sm text-start"
              />
            </Field>
          </div>
        </SettingsSection>
      </motion.div>
    </PageShell>
  );
}
