"use client";

import { Button } from "@/components/ui/button";
import { WHATSAPP_EMOJIS } from "@/lib/whatsapp-templates";

/** Inline row of WhatsApp emojis; clicking one inserts it at the caret. */
export function EmojiBar({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl neu-inset p-2">
      {WHATSAPP_EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onPick(emoji)}
          aria-label={`הוספת ${emoji}`}
          className="rounded-lg text-lg hover:bg-primary/15"
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
