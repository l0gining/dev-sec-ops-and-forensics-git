"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { TimelineEvent } from "@/lib/types";
import { Button, Card, ErrorState, Field, inputClass } from "@/components/ui";

export function TimelineWorkspace({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("manual");
  const [description, setDescription] = useState("");
  const { data, error } = useQuery({
    queryKey: ["timeline", caseId],
    queryFn: () => apiFetch<{ timeline: TimelineEvent[] }>(`/api/cases/${caseId}/timeline`)
  });
  const add = useMutation({
    mutationFn: () =>
      apiFetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        body: JSON.stringify({ title, type, description })
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["timeline", caseId] });
    }
  });

  return (
    <div className="grid gap-4 p-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Add manual event</h2>
        <div className="grid gap-3">
          <Field label="Title">
            <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Type">
            <input className={inputClass} value={type} onChange={(event) => setType(event.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={inputClass} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <Button disabled={!title || add.isPending} onClick={() => add.mutate()}>
            <Plus size={16} /> Commit event
          </Button>
          <ErrorState message={add.error instanceof Error ? add.error.message : error instanceof Error ? error.message : undefined} />
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Chronology</h2>
        <div className="grid gap-3">
          {(data?.timeline ?? []).map((event) => (
            <div key={event.id} className="grid gap-1 border-l-2 border-primary pl-4">
              <div className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()} - {event.type}</div>
              <div className="font-semibold">{event.title}</div>
              <div className="text-sm text-slate-600">{event.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
