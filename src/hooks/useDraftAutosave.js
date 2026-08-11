import { useEffect, useRef } from "react";

export function useDraftAutosave(draft, onSave, delay = 600) {
  const draftRef = useRef(draft);
  const saveRef = useRef(onSave);

  useEffect(() => {
    draftRef.current = draft;
    saveRef.current = onSave;
  }, [draft, onSave]);

  useEffect(() => {
    if (typeof onSave !== "function") return undefined;
    const timeout = setTimeout(() => onSave(draft), delay);
    return () => clearTimeout(timeout);
  }, [draft, onSave, delay]);

  useEffect(
    () => () => {
      if (typeof saveRef.current === "function") {
        saveRef.current(draftRef.current);
      }
    },
    [],
  );
}
