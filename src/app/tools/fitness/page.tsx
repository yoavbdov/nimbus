"use client";

import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { FitnessUpdateView } from "@/components/tools/fitness/FitnessUpdateView";

export default function FitnessUpdatePage() {
  return (
    <PageShell title="עדכון מד כושר מרוכז">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bloom bloom-indigo rounded-3xl"
      >
        <FitnessUpdateView />
      </motion.div>
    </PageShell>
  );
}
