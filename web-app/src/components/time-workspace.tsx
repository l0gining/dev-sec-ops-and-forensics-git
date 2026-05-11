"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Square } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { useAppStore } from "@/lib/store";
import type { TimeSession } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button, Card, ErrorState, Field, inputClass } from "@/components/ui";

export function TimeWorkspace({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const { activeTimerCase, timerStartedAt, startTimer, stopTimer } = useAppStore();
  const { data, error } = useQuery({
    queryKey: ["time", caseId],
    queryFn: () => apiFetch<{ sessions: TimeSession[] }>(`/api/cases/${caseId}/time`)
  });
  const save = useMutation({
    mutationFn: (session: Omit<TimeSession, "id">) =>
      apiFetch(`/api/cases/${caseId}/time`, {
        method: "POST",
        body: JSON.stringify(session)
      }),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["time", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
  const sessions = data?.sessions ?? [];
  const totalSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);

  function finish() {
    const stopped = stopTimer();
    if (!stopped) return;
    save.mutate({
      startedAt: new Date(stopped.startedAt).toISOString(),
      endedAt: new Date(stopped.endedAt).toISOString(),
      durationSeconds: Math.max(1, Math.round((stopped.endedAt - stopped.startedAt) / 1000)),
      note
    });
  }

  return (
    <div className="grid gap-4 p-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Manual timer</h2>
        <div className="grid gap-3">
          <div className="rounded-md bg-muted p-4 text-3xl font-bold">{formatDuration(totalSeconds)}</div>
          <Field label="Session note">
            <textarea className={inputClass} rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
          {activeTimerCase === caseId ? (
            <Button variant="danger" onClick={finish} disabled={save.isPending}>
              <Square size={16} /> Stop and commit
            </Button>
          ) : (
            <Button onClick={() => startTimer(caseId)}>
              <Play size={16} /> Start timer
            </Button>
          )}
          {timerStartedAt && activeTimerCase === caseId ? <div className="text-sm text-slate-500">Started {new Date(timerStartedAt).toLocaleTimeString()}</div> : null}
          <ErrorState message={save.error instanceof Error ? save.error.message : error instanceof Error ? error.message : undefined} />
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Sessions</h2>
        <div className="grid gap-2">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-md border border-border p-3">
              <div className="font-semibold">{formatDuration(session.durationSeconds)}</div>
              <div className="text-sm text-slate-500">{new Date(session.startedAt).toLocaleString()} - {new Date(session.endedAt).toLocaleString()}</div>
              <div className="mt-1 text-sm">{session.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
