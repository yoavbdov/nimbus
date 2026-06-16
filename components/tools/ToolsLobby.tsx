"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toolCards } from "@/lib/tools-data";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ToolsLobby() {
  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <div className="p-6 space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
            כלים
          </h1>
          <p className="text-xs text-muted-foreground/80">
            כלי תפעול נוספים לניהול הפעילויות, הנוכחות והתקשורת עם ההורים.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          {toolCards.map(({ href, title, description, icon: Icon }) => (
            <motion.div key={href} variants={itemVariants}>
              <Link
                href={href}
                className="group flex h-full items-start gap-4 rounded-2xl neu-raised-xs neu-interactive p-5 transition-all duration-200 hover:neu-raised-sm"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl neu-inset bg-(--tint-soft)">
                  <Icon className="size-5 tint-text" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-semibold text-foreground">
                      {title}
                    </h2>
                    <ArrowLeft className="size-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  );
}
