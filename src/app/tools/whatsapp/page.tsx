"use client";

import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { WhatsAppView } from "@/components/tools/whatsapp/WhatsAppView";

export default function WhatsAppPage() {
  return (
    <PageShell title="שליחת וואטסאפ">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bloom bloom-indigo rounded-3xl"
      >
        <WhatsAppView />
      </motion.div>
    </PageShell>
  );
}
