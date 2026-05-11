import { useCallback, useEffect, useRef, useState } from "react";
import type { ExerciseType } from "../types/exercise";
import { createId } from "../utils/id";
import {
  appendHistoryEntry,
  createHistoryEntry,
  historyToCsv,
  loadHistory,
  resetHistory,
  type RepHistoryEntry,
} from "../storage/history";

export function useRepHistory() {
  const [history, setHistory] = useState<RepHistoryEntry[]>([]);
  const sessionIdRef = useRef(createId());

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const recordRep = useCallback((exercise: ExerciseType) => {
    const entry = createHistoryEntry(exercise, sessionIdRef.current);
    setHistory(appendHistoryEntry(entry));
  }, []);

  const resetLocalHistory = useCallback(() => {
    setHistory(resetHistory());
  }, []);

  const startNewSession = useCallback(() => {
    sessionIdRef.current = createId();
  }, []);

  const exportCsv = useCallback((fileName: string) => {
    const blob = new Blob([historyToCsv(loadHistory())], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    history,
    recordRep,
    resetLocalHistory,
    startNewSession,
    exportCsv,
  };
}
