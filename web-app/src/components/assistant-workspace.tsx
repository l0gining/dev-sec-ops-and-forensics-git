"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, Send, Wand2, X } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { AI_COMMANDS, AI_CONTEXT_SCOPES } from "@/lib/constants";
import { loadClientSettings } from "@/lib/settings";
import { useAppStore } from "@/lib/store";
import type { AiContextScope, AssistantResponse, ReportPatchProposal } from "@/lib/types";
import { DiffViewer } from "@/components/diff-viewer";
import { Badge, Button, Card, ErrorState, Field, inputClass } from "@/components/ui";

export function AssistantWorkspace({ caseId }: { caseId: string }) {
  const setActivePatch = useAppStore((state) => state.setActivePatch);
  const [prompt, setPrompt] = useState("");
  const [command, setCommand] = useState("/summarize-report");
  const [selectedText, setSelectedText] = useState("");
  const [contextScope, setContextScope] = useState<AiContextScope>(AI_CONTEXT_SCOPES[2]);
  const [model, setModel] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; patch?: ReportPatchProposal }>>([]);
  const ask = useMutation({
    mutationFn: () =>
      apiFetch<AssistantResponse>(`/api/cases/${caseId}/assistant`, {
        method: "POST",
        body: JSON.stringify({ prompt: prompt || command, command, selectedText, contextScope, model })
      }),
    onSuccess: (data) => {
      if (data.mode === "proposal") {
        setMessages((items) => [
          ...items,
          { role: "assistant", content: data.answer ?? data.proposal.summary, patch: data.proposal }
        ]);
      } else {
        setMessages((items) => [...items, { role: "assistant", content: data.answer }]);
      }
      setPrompt("");
    }
  });

  useEffect(() => {
    const settings = loadClientSettings();
    setContextScope(settings.aiContextScope);
    setModel(settings.openRouterModel);
  }, []);

  function stagePatch(patch: ReportPatchProposal) {
    setActivePatch(patch);
  }

  return (
    <div className="grid gap-4 p-6 xl:grid-cols-[360px_1fr]">
      <Card className="p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Bot size={18} /> AI assistant</h2>
        <div className="grid gap-3">
          <Field label="Command">
            <select className={inputClass} value={command} onChange={(event) => setCommand(event.target.value)}>
              {AI_COMMANDS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Context scope">
            <select className={inputClass} value={contextScope} onChange={(event) => setContextScope(event.target.value as typeof contextScope)}>
              {AI_CONTEXT_SCOPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Model">
            <input className={inputClass} value={model} onChange={(event) => setModel(event.target.value)} />
          </Field>
          <Field label="Selected report text">
            <textarea className={inputClass} rows={5} value={selectedText} onChange={(event) => setSelectedText(event.target.value)} placeholder="Paste section text for rewrite commands" />
          </Field>
          <Field label="Prompt">
            <textarea className={inputClass} rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask a question or add detail for the command" />
          </Field>
          <Button disabled={ask.isPending} onClick={() => ask.mutate()}>
            <Send size={16} /> Send
          </Button>
          <ErrorState message={ask.error instanceof Error ? ask.error.message : undefined} />
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Responses and patch approvals</h2>
          <Badge>Edit proposals are staged only after approval</Badge>
        </div>
        <div className="grid gap-3">
          {messages.map((message, index) => (
            <div key={index} className="grid gap-3 rounded-md border border-border p-3">
              <div className="text-sm font-semibold">{message.role}</div>
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              {message.patch ? (
                <div className="grid gap-3 rounded-md bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{message.patch.target.heading ?? "report.md"}</strong>
                    <Badge tone={message.patch.risk === "high" ? "red" : message.patch.risk === "medium" ? "amber" : "green"}>{message.patch.risk} risk</Badge>
                  </div>
                  <DiffViewer oldText={message.patch.patch.oldText} newText={message.patch.patch.newText} />
                  <div className="flex gap-2">
                    <Button onClick={() => stagePatch(message.patch!)}>
                      <Wand2 size={16} /> Stage for report review
                    </Button>
                    <Button variant="secondary" onClick={() => setMessages((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                      <X size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
          {!messages.length ? <div className="rounded-md bg-muted p-4 text-sm text-slate-600">Ask about the report or run a command. Edit commands return a structured patch that must be staged and approved in the report editor.</div> : null}
        </div>
      </Card>
    </div>
  );
}
