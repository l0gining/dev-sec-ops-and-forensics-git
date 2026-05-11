import { apiError, getServerSettings, readCaseBundle } from "@/lib/github";
import type { AssistantResponse } from "@/lib/types";

function wantsPatch(command: string) {
  return [
    "/improve-case-summary",
    "/rewrite-selected-section",
    "/add-evidence-checklist",
    "/improve-findings",
    "/improve-recommendations",
    "/generate-timeline-summary",
    "/create-final-report-polish"
  ].includes(command);
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ error: "OPENROUTER_API_KEY is not configured in .env.local." }, { status: 503 });
    }

    const body = await request.json();
    const { caseId } = await params;
    const bundle = await readCaseBundle(caseId);
    const settings = getServerSettings();
    const command = body.command || "";
    const selectedText = body.selectedText || "";
    const prompt = body.prompt || command;
    const scope = body.contextScope || "Report + metadata + evidence filenames";
    const evidenceLines = bundle.evidence.map((item) => `- ${item.originalFilename} (${item.sha256}) ${item.description}`).join("\n");
    const context = [
      `Case metadata:\n${JSON.stringify(bundle.metadata, null, 2)}`,
      `Report:\n${bundle.report}`,
      scope.includes("evidence") ? `Evidence index:\n${evidenceLines || "No evidence uploaded."}` : "",
      scope.includes("metadata") ? `Timeline:\n${JSON.stringify(bundle.timeline, null, 2)}` : "",
      selectedText ? `Selected text:\n${selectedText}` : ""
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const system = `You are a forensic investigation assistant inside ForensicPad.
Your job is to help the investigator write clear, structured, evidence-based forensic reports.
Do not invent evidence. Do not claim that something happened unless it is present in the report, metadata, timeline, or evidence context.
When suggesting report changes, produce a structured patch proposal. All edits require investigator approval before being applied.`;

    const editInstruction = wantsPatch(command)
      ? `Return only JSON shaped as {"type":"report_patch","summary":"...","target":{"file":"report.md","heading":"## Findings","startLine":1,"endLine":3},"patch":{"operation":"replace","oldText":"...","newText":"..."},"risk":"low","requiresApproval":true}. Use exact oldText from the report when replacing.`
      : "Return a concise plain-text forensic answer. Do not propose edits unless asked.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ForensicPad"
      },
      body: JSON.stringify({
        model: body.model || settings.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${editInstruction}\n\nUser request: ${prompt}\n\n${context}` }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data.error?.message ?? "OpenRouter request failed." }, { status: response.status });
    }
    const text = data.choices?.[0]?.message?.content ?? "";
    const parsed = wantsPatch(command) ? extractJson(text) : null;
    const payload: AssistantResponse = parsed
      ? { mode: "proposal", proposal: parsed, answer: parsed.summary }
      : { mode: "answer", answer: text };
    return Response.json(payload);
  } catch (error) {
    return apiError(error);
  }
}
