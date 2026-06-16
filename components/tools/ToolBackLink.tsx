"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Small "back to tools" link shown at the top of every tool sub-page. */
export function ToolBackLink() {
  return (
    <Link
      href="/tools"
      className="inline-flex w-fit items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-foreground/70 neu-raised-xs neu-interactive transition-colors hover:text-foreground"
    >
      <ArrowRight className="size-4" />
      חזרה לכלים
    </Link>
  );
}
