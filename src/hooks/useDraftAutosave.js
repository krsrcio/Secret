import { useEffect, useRef } from "react";

export function useDraftAutosave(draft, onSave, delay = 600) {
  const draftRef = useRef(draft);
  const saveRef = useRef(onSave);

  useEffect(() => {
    draftRef.current = draft;
    saveRef.current = onSave;
  }, [draft, onSave]);

  useEffect(() => {
    const timeout = setTimeout(() => onSave(draft), delay);
    return () => clearTimeout(timeout);
  }, [draft, onSave, delay]);

  useEffect(
    () => () => {
      saveRef.current(draftRef.current);
    },
    [],
  );
}
