"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { AI_CONTEXT_SCOPES } from "@/lib/constants";
import { defaultSettings, loadClientSettings, SETTINGS_KEY } from "@/lib/settings";
import type { AppSettings, PublicServerConfig } from "@/lib/types";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());
  const [saved, setSaved] = useState(false);
  const { data: serverConfig } = useQuery({
    queryKey: ["config"],
    queryFn: () => apiFetch<PublicServerConfig>("/api/config")
  });

  useEffect(() => {
    setSettings(loadClientSettings());
  }, []);

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <>
      <PageHeader title="Settings" eyebrow="Lab configuration">
        <Button onClick={save}><Save size={16} /> {saved ? "Saved" : "Save locally"}</Button>
      </PageHeader>
      <div className="grid gap-5 p-6 xl:grid-cols-2">
        <Card className="grid gap-3 p-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Server sync status</h2>
            <div className="flex gap-2">
              <Badge tone={serverConfig?.githubConfigured ? "green" : "red"}>
                {serverConfig?.githubConfigured ? "GitHub configured" : "GitHub env missing"}
              </Badge>
              <Badge tone={serverConfig?.openRouterConfigured ? "green" : "amber"}>
                {serverConfig?.openRouterConfigured ? "OpenRouter configured" : "OpenRouter env missing"}
              </Badge>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-4">
            <span>Owner: <strong>{serverConfig?.owner || "unset"}</strong></span>
            <span>Repo: <strong>{serverConfig?.repo || "unset"}</strong></span>
            <span>Branch: <strong>{serverConfig?.branch || "main"}</strong></span>
            <span>Root: <strong>{serverConfig?.investigationsRoot || "investigations"}</strong></span>
          </div>
          <p className="text-sm text-slate-500">Repository writes and secrets are controlled by `.env.local`. Local settings below tune browser-side defaults and request preferences without exposing tokens.</p>
        </Card>
        <Card className="grid gap-4 p-4">
          <h2 className="text-lg font-semibold">Repository</h2>
          <Field label="Repository owner">
            <input className={inputClass} value={settings.owner} onChange={(event) => setSettings({ ...settings, owner: event.target.value })} />
          </Field>
          <Field label="Repository name">
            <input className={inputClass} value={settings.repo} onChange={(event) => setSettings({ ...settings, repo: event.target.value })} />
          </Field>
          <Field label="Default branch">
            <input className={inputClass} value={settings.branch} onChange={(event) => setSettings({ ...settings, branch: event.target.value })} />
          </Field>
          <Field label="Investigations root folder">
            <input className={inputClass} value={settings.investigationsRoot} onChange={(event) => setSettings({ ...settings, investigationsRoot: event.target.value })} />
          </Field>
          <p className="text-sm text-slate-500">Server writes use `.env.local`; these local settings drive UI defaults and AI request preferences without exposing tokens.</p>
        </Card>
        <Card className="grid gap-4 p-4">
          <h2 className="text-lg font-semibold">Evidence and AI</h2>
          <Field label="Allowed evidence file types">
            <textarea className={inputClass} rows={4} value={settings.allowedExtensions.join("\n")} onChange={(event) => setSettings({ ...settings, allowedExtensions: event.target.value.split(/\s+/).filter(Boolean) })} />
          </Field>
          <Field label="Maximum evidence file size MB">
            <input className={inputClass} type="number" value={settings.maxEvidenceFileSizeMb} onChange={(event) => setSettings({ ...settings, maxEvidenceFileSizeMb: Number(event.target.value) })} />
          </Field>
          <Field label="OpenRouter model">
            <input className={inputClass} value={settings.openRouterModel} onChange={(event) => setSettings({ ...settings, openRouterModel: event.target.value })} />
          </Field>
          <Field label="AI context scope">
            <select className={inputClass} value={settings.aiContextScope} onChange={(event) => setSettings({ ...settings, aiContextScope: event.target.value as AppSettings["aiContextScope"] })}>
              {AI_CONTEXT_SCOPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
        </Card>
        <Card className="grid gap-4 p-4 xl:col-span-2">
          <h2 className="text-lg font-semibold">Report template headings</h2>
          <textarea className={`${inputClass} min-h-[220px] font-mono`} value={settings.reportTemplateHeadings.join("\n")} onChange={(event) => setSettings({ ...settings, reportTemplateHeadings: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} />
        </Card>
      </div>
    </>
  );
}
