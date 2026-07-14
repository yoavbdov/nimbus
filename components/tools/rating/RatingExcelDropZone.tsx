"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FitnessExcelDropZoneProps {
  /** Name of the file currently dropped in, or null when empty. */
  fileName: string | null;
  onFileDrop: (file: File) => void;
  onClear: () => void;
}

/**
 * Drop area for returning the filled Excel file — also clickable to pick a file
 * from the computer. The drag-over highlight is local presentation only; the
 * chosen file is handed up via props.
 */
export function FitnessExcelDropZone({
  fileName,
  onFileDrop,
  onClear,
}: FitnessExcelDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileDrop(file);
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileDrop(file);
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
  };

  if (fileName) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl neu-inset bg-foreground/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-foreground/85">
          <FileSpreadsheet className="size-4 text-primary" />
          <span className="font-medium">{fileName}</span>
          <span className="text-xs text-muted-foreground">נטען בהצלחה</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
          aria-label="הסרת הקובץ"
          className="rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors duration-150 hover:border-primary/60 hover:bg-primary/6",
        dragOver
          ? "border-primary bg-primary/10"
          : "border-foreground/15 bg-foreground/[0.03]",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handlePick}
        className="hidden"
      />
      <UploadCloud
        className={cn(
          "size-7 transition-colors duration-150",
          dragOver ? "text-primary" : "text-foreground/40",
        )}
      />
      <p className="text-sm font-medium text-foreground/80">
        גררו את הקובץ לכאן
      </p>
    </button>
  );
}
