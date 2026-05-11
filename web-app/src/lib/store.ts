"use client";

import { create } from "zustand";
import type { ReportPatchProposal } from "./types";

type AppStore = {
  activePatch: ReportPatchProposal | null;
  setActivePatch: (patch: ReportPatchProposal | null) => void;
  activeTimerCase: string | null;
  timerStartedAt: number | null;
  startTimer: (caseId: string) => void;
  stopTimer: () => { caseId: string; startedAt: number; endedAt: number } | null;
};

export const useAppStore = create<AppStore>((set, get) => ({
  activePatch: null,
  setActivePatch: (activePatch) => set({ activePatch }),
  activeTimerCase: null,
  timerStartedAt: null,
  startTimer: (caseId) => set({ activeTimerCase: caseId, timerStartedAt: Date.now() }),
  stopTimer: () => {
    const state = get();
    if (!state.activeTimerCase || !state.timerStartedAt) return null;
    const session = {
      caseId: state.activeTimerCase,
      startedAt: state.timerStartedAt,
      endedAt: Date.now()
    };
    set({ activeTimerCase: null, timerStartedAt: null });
    return session;
  }
}));
