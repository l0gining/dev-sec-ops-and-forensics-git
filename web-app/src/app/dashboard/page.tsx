"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, FileWarning, FolderOpen, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { CaseListItem } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Badge, Card, ErrorState } from "@/components/ui";
import { LoadingBlock } from "@/components/loading";
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => apiFetch<{ cases: CaseListItem[] }>("/api/cases")
  });
  const cases = data?.cases ?? [];
  const openCases = cases.filter((item) => !["Closed", "Archived"].includes(item.status));
  const totalSeconds = cases.reduce((sum, item) => sum + (item.totalSeconds ?? 0), 0);
  const highRisk = cases.filter((item) => ["High", "Critical"].includes(item.severity));
  const recent = cases.slice(0, 5);

  return (
    <>
      <PageHeader title="Investigation Dashboard" eyebrow="ForensicPad">
        <Badge tone={error ? "red" : "green"}>{error ? "GitHub sync needs setup" : "GitHub sync ready"}</Badge>
      </PageHeader>
      <div className="grid gap-5 p-6">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
        {isLoading ? (
          <LoadingBlock label="Loading cases from GitHub" />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric icon={FolderOpen} label="Open cases" value={openCases.length.toString()} />
              <Metric icon={ShieldAlert} label="High severity" value={highRisk.length.toString()} />
              <Metric icon={Clock} label="Total time" value={formatDuration(totalSeconds)} />
              <Metric icon={FileWarning} label="Evidence files" value={cases.reduce((sum, item) => sum + (item.evidenceCount ?? 0), 0).toString()} />
            </section>
            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold">
                  <Activity size={18} /> Recently updated cases
                </div>
                <div className="grid gap-2">
                  {recent.length ? (
                    recent.map((item) => (
                      <Link
                        key={item.folderName}
                        href={`/cases/${item.folderName}/report`}
                        className="grid gap-1 rounded-md border border-border p-3 hover:border-primary"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">{item.caseId} - {item.title}</span>
                          <Badge>{item.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.severity} severity, {formatDuration(item.totalSeconds ?? 0)} logged
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-md bg-muted p-4 text-sm text-slate-600">No cases yet. Create the first one from Cases.</div>
                  )}
                </div>
              </Card>
              <Card className="p-4">
                <div className="mb-3 font-semibold">Cases by status</div>
                <div className="grid gap-2">
                  {Object.entries(
                    cases.reduce<Record<string, number>>((acc, item) => {
                      acc[item.status] = (acc[item.status] ?? 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                      <span>{status}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </>
        )}
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon size={18} className="text-primary" />
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
    </Card>
  );
}
