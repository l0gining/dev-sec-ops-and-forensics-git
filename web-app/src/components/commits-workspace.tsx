"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { CommitItem } from "@/lib/types";
import { Card, ErrorState } from "@/components/ui";

export function CommitsWorkspace({ caseId }: { caseId: string }) {
  const { data, error } = useQuery({
    queryKey: ["commits", caseId],
    queryFn: () => apiFetch<{ commits: CommitItem[] }>(`/api/cases/${caseId}/commits`)
  });
  return (
    <div className="p-6">
      <ErrorState message={error instanceof Error ? error.message : undefined} />
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Commit history</h2>
        <div className="grid gap-3">
          {(data?.commits ?? []).map((commit) => (
            <a key={commit.sha} href={commit.url} target="_blank" rel="noreferrer" className="grid gap-1 rounded-md border border-border p-3 hover:border-primary">
              <div className="flex items-center justify-between gap-2">
                <strong>{commit.message}</strong>
                <ExternalLink size={16} />
              </div>
              <div className="text-sm text-slate-500">{commit.sha.slice(0, 12)} by {commit.author} on {new Date(commit.date).toLocaleString()}</div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
