"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/client-api";
import { CASE_STATUSES, SEVERITIES } from "@/lib/constants";
import type { CaseMetadata } from "@/lib/types";
import { Badge, Button, ErrorState, Field, inputClass } from "@/components/ui";

export function CaseHeading({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const { data, error } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => apiFetch<{ metadata: CaseMetadata }>(`/api/cases/${caseId}`)
  });
  const metadata = data?.metadata;
  const update = useMutation({
    mutationFn: (patch: Partial<CaseMetadata>) =>
      apiFetch<{ metadata: CaseMetadata }>(`/api/cases/${caseId}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });

  if (!metadata) {
    return (
      <header className="border-b border-border bg-white px-6 py-4">
        <ErrorState message={error instanceof Error ? error.message : "Loading case metadata"} />
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-white px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{metadata.caseId} - {metadata.title}</h1>
            <Badge>{metadata.status}</Badge>
            <Badge tone={metadata.severity === "Critical" || metadata.severity === "High" ? "red" : "neutral"}>{metadata.severity}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{metadata.summary || "Use the metadata controls to capture the investigation summary."}</p>
        </div>
        <div className="grid min-w-[280px] gap-2 md:grid-cols-2">
          <Field label="Status">
            <select className={inputClass} value={metadata.status} onChange={(event) => update.mutate({ status: event.target.value as CaseMetadata["status"] })}>
              {CASE_STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select className={inputClass} value={metadata.severity} onChange={(event) => update.mutate({ severity: event.target.value as CaseMetadata["severity"] })}>
              {SEVERITIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-primary">Metadata</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Related repository">
            <input className={inputClass} defaultValue={metadata.relatedRepository} onBlur={(event) => update.mutate({ relatedRepository: event.target.value })} />
          </Field>
          <Field label="Commit SHA">
            <input className={inputClass} defaultValue={metadata.relatedCommitSha} onBlur={(event) => update.mutate({ relatedCommitSha: event.target.value })} />
          </Field>
          <Field label="Workflow run">
            <input className={inputClass} defaultValue={metadata.relatedWorkflowRun} onBlur={(event) => update.mutate({ relatedWorkflowRun: event.target.value })} />
          </Field>
          <Field label="Artifact">
            <input className={inputClass} defaultValue={metadata.relatedArtifact} onBlur={(event) => update.mutate({ relatedArtifact: event.target.value })} />
          </Field>
          <Field label="Summary">
            <textarea className={`${inputClass} md:col-span-2`} defaultValue={metadata.summary} onBlur={(event) => update.mutate({ summary: event.target.value })} rows={3} />
          </Field>
          <div className="flex items-end">
            <Button variant="secondary" disabled={update.isPending} onClick={() => update.mutate({ status: "Archived" })}>Archive case</Button>
          </div>
        </div>
      </details>
      <ErrorState message={update.error instanceof Error ? update.error.message : undefined} />
    </header>
  );
}
