import { useCallback, useState } from "react";

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  return { open, setOpen, close, show };
}
