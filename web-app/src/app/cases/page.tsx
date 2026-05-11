"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Plus, Search } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { CASE_STATUSES, SEVERITIES } from "@/lib/constants";
import { loadClientSettings } from "@/lib/settings";
import type { CaseListItem } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Badge, Button, Card, ErrorState, Field, inputClass } from "@/components/ui";
import { LoadingBlock } from "@/components/loading";
import { PageHeader } from "@/components/page-header";

export default function CasesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [title, setTitle] = useState("");
  const [investigator, setInvestigator] = useState("Nik");
  const [tags, setTags] = useState("ci-cd, incident");
  const { data, error, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => apiFetch<{ cases: CaseListItem[] }>("/api/cases")
  });
  const createCase = useMutation({
    mutationFn: () =>
      apiFetch<{ case: CaseListItem }>("/api/cases", {
        method: "POST",
        body: JSON.stringify({
          title,
          investigator,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          templateHeadings: loadClientSettings().reportTemplateHeadings
        })
      }),
    onSuccess: () => {
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
  const cases = useMemo(() => data?.cases ?? [], [data?.cases]);
  const filtered = useMemo(
    () =>
      cases.filter((item) => {
        const text = `${item.caseId} ${item.title} ${item.tags.join(" ")}`.toLowerCase();
        return (
          text.includes(search.toLowerCase()) &&
          (status === "All" || item.status === status) &&
          (severity === "All" || item.severity === severity)
        );
      }),
    [cases, search, status, severity]
  );

  return (
    <>
      <PageHeader title="Cases" eyebrow="Investigations">
        <Button onClick={() => document.getElementById("new-case-title")?.focus()}>
          <Plus size={16} /> New case
        </Button>
      </PageHeader>
      <div className="grid gap-5 p-6 xl:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <h2 className="mb-4 text-lg font-semibold">Create case</h2>
          <div className="grid gap-3">
            <Field label="Title">
              <input id="new-case-title" className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Suspicious Deployment Investigation" />
            </Field>
            <Field label="Investigator">
              <input className={inputClass} value={investigator} onChange={(event) => setInvestigator(event.target.value)} />
            </Field>
            <Field label="Tags">
              <input className={inputClass} value={tags} onChange={(event) => setTags(event.target.value)} />
            </Field>
            <Button disabled={!title.trim() || createCase.isPending} onClick={() => createCase.mutate()}>
              <Plus size={16} /> Create and commit
            </Button>
            <ErrorState message={createCase.error instanceof Error ? createCase.error.message : undefined} />
          </div>
        </Card>
        <section className="grid gap-4">
          <ErrorState message={error instanceof Error ? error.message : undefined} />
          <Card className="grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input className={`${inputClass} w-full pl-9`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cases, tags, ids" />
            </label>
            <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All</option>
              {CASE_STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className={inputClass} value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option>All</option>
              {SEVERITIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Card>
          {isLoading ? <LoadingBlock /> : (
            <div className="grid gap-3">
              {filtered.map((item) => (
                <Link key={item.folderName} href={`/cases/${item.folderName}/report`} className="rounded-lg border border-border bg-white p-4 shadow-sm hover:border-primary">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{item.caseId} - {item.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.summary || "No summary yet."}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{item.status}</Badge>
                      <Badge tone={item.severity === "Critical" || item.severity === "High" ? "red" : "neutral"}>{item.severity}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>{formatDuration(item.totalSeconds ?? 0)} logged</span>
                    <span>{item.evidenceCount ?? 0} evidence files</span>
                    {item.status !== "Archived" ? <span className="inline-flex items-center gap-1"><Archive size={14} /> Archive from metadata panel</span> : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
