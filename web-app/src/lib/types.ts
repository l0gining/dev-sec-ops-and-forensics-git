import type { AI_CONTEXT_SCOPES, CASE_STATUSES, SEVERITIES } from "./constants";

export type CaseStatus = (typeof CASE_STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type AiContextScope = (typeof AI_CONTEXT_SCOPES)[number];

export type CaseMetadata = {
  caseId: string;
  title: string;
  status: CaseStatus;
  severity: Severity;
  createdAt: string;
  updatedAt: string;
  investigator: string;
  relatedRepository: string;
  relatedCommitSha: string;
  relatedWorkflowRun: string;
  relatedArtifact: string;
  tags: string[];
  summary: string;
};

export type CaseListItem = CaseMetadata & {
  folderName: string;
  path: string;
  totalSeconds?: number;
  evidenceCount?: number;
};

export type TimelineEvent = {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  source: string;
};

export type TimeSession = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  note: string;
};

export type EvidenceItem = {
  id: string;
  originalFilename: string;
  storedFilename: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  sha256: string;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
};

export type CommitItem = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export type AppSettings = {
  owner: string;
  repo: string;
  branch: string;
  investigationsRoot: string;
  allowedExtensions: string[];
  maxEvidenceFileSizeMb: number;
  reportTemplateHeadings: string[];
  openRouterModel: string;
  aiContextScope: AiContextScope;
};

export type PublicServerConfig = {
  owner: string;
  repo: string;
  branch: string;
  investigationsRoot: string;
  openRouterModel: string;
  githubConfigured: boolean;
  openRouterConfigured: boolean;
};

export type ReportPatchProposal = {
  type: "report_patch";
  summary: string;
  target: {
    file: "report.md";
    heading?: string;
    startLine?: number;
    endLine?: number;
  };
  patch: {
    operation: "replace" | "append" | "prepend";
    oldText?: string;
    newText: string;
  };
  risk: "low" | "medium" | "high";
  requiresApproval: true;
};

export type AssistantResponse =
  | { mode: "answer"; answer: string }
  | { mode: "proposal"; proposal: ReportPatchProposal; answer?: string };
