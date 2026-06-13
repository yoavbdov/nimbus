"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LifeBuoy,
  Mail,
  Send,
  MessageCircleQuestion,
  ImageUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupportTicket } from "@/hooks/support/useSupportTicket";
import {
  SUPPORT_AREA_OPTIONS,
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_EMAIL,
  SUPPORT_PRIORITY_OPTIONS,
  type SupportArea,
  type SupportCategory,
  type SupportPriority,
} from "@/lib/support-form";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
};

const fieldClass =
  "h-9 rounded-xl neu-inset border-0 px-3 text-start text-foreground placeholder:text-muted-foreground/70";
const selectTriggerClass = cn(
  fieldClass,
  "min-w-40 gap-2 text-center [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center",
);
const selectContentClass =
  "[&_[data-slot=select-item]]:justify-center [&_[data-slot=select-item]]:pl-8 [&_[data-slot=select-item]]:text-center";

function FieldLabel({
  required,
  centered,
  children,
}: {
  required?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label
      onClick={(e) => e.preventDefault()}
      className={cn(
        "cursor-default gap-1 text-foreground/80",
        centered ? "w-full justify-center" : "w-fit",
      )}
    >
      {children}
      {required && (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      )}
    </Label>
  );
}

function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn("space-y-1.5", className)}
    >
      {children}
    </motion.div>
  );
}

export function SupportNewTicket() {
  const { values, updateField, reset, submit, valid } = useSupportTicket();
  const isOther = values.category === "other";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="size-10 rounded-2xl neu-raised-sm bloom bloom-indigo flex items-center justify-center shrink-0">
              <LifeBuoy className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                פתיחת פנייה לתמיכה
              </h2>
              <p className="text-sm text-muted-foreground">
                מלאו את הפרטים ונחזור אליכם בהקדם. שדות המסומנים ב־
                <span className="text-destructive">*</span> הם שדות חובה.
              </p>
            </div>
          </div>

          <motion.form
            variants={bodyVariants}
            initial="hidden"
            animate="show"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <Field>
                <FieldLabel required centered>
                  סוג פנייה
                </FieldLabel>
                <Select
                  value={values.category}
                  onValueChange={(v) =>
                    updateField("category", v as SupportCategory)
                  }
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="בחרו סוג" />
                  </SelectTrigger>
                  <SelectContent
                    dir="rtl"
                    position="popper"
                    className={selectContentClass}
                  >
                    {SUPPORT_CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <AnimatePresence initial={false}>
                {isOther && (
                  <motion.div
                    key="custom-category"
                    initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
                    exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.25, ease }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <FieldLabel required centered>
                      פירוט סוג הפנייה
                    </FieldLabel>
                    <Input
                      autoFocus
                      value={values.customCategory}
                      onChange={(e) =>
                        updateField("customCategory", e.target.value)
                      }
                      placeholder="במה מדובר?"
                      className={cn(fieldClass, "w-56 text-center")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field>
                <FieldLabel required centered>
                  דחיפות
                </FieldLabel>
                <Select
                  value={values.priority}
                  onValueChange={(v) =>
                    updateField("priority", v as SupportPriority)
                  }
                >
                  <SelectTrigger className={cn(selectTriggerClass, "min-w-32")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    dir="rtl"
                    position="popper"
                    className={selectContentClass}
                  >
                    {SUPPORT_PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel centered>מה מושפע?</FieldLabel>
                <Select
                  value={values.area}
                  onValueChange={(v) => updateField("area", v as SupportArea)}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="בחירת אזור" />
                  </SelectTrigger>
                  <SelectContent
                    dir="rtl"
                    position="popper"
                    className={selectContentClass}
                  >
                    {SUPPORT_AREA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field className="max-w-md">
              <FieldLabel required>נושא</FieldLabel>
              <Input
                value={values.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder="תיאור קצר של הפנייה"
                className={fieldClass}
              />
            </Field>

            <Field>
              <FieldLabel required>תיאור מפורט</FieldLabel>
              <Textarea
                value={values.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder={
                  "על מנת שנוכל לסייע לכם, נשמח לפירוט מקסימלי, מה מושפע, איך ניתן לשחזר את התקלה.\n\nאנא צרפו תמונות ומסמכים שיכולים לסייע לנו לטפל בבעיה :)"
                }
                className={cn(fieldClass, "h-auto min-h-32 py-2")}
              />
            </Field>

            <Field className="max-w-md">
              <FieldLabel>צירוף קבצים</FieldLabel>
              <Label className="group flex w-fit cursor-pointer items-center gap-2 rounded-xl neu-raised-xs neu-interactive px-3 py-2 text-sm text-foreground/80 transition-colors">
                <ImageUp className="size-4 text-primary/70" />
                <span>הוספת קבצים</span>
                <span className="text-xs text-muted-foreground">
                  (תמונות, מסמכים)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="sr-only"
                />
              </Label>
            </Field>

            <motion.div
              variants={itemVariants}
              className="flex flex-row-reverse items-center gap-2 pt-1"
            >
              <Button
                type="submit"
                disabled={!valid}
                className="rounded-xl gap-1.5"
              >
                <Send className="size-4" />
                שליחת פנייה
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={reset}
                className="rounded-xl"
              >
                ניקוי
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </Card>

      <motion.div
        variants={bodyVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
            <div className="h-1 tint-bar" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl neu-raised-xs flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    כתובת תמיכה
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    dir="ltr"
                    className="text-sm text-primary hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
            <div className="h-1 tint-bar" />
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircleQuestion className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  לפני שפותחים פנייה
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ציינו את הפרטים הרלוונטיים ככל האפשר — צילומי מסך, שעת התקלה
                והשלבים לשחזורה — כדי שנוכל לטפל בפנייה במהירות.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
