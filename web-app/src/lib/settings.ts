import { AI_CONTEXT_SCOPES, DEFAULT_ALLOWED_EXTENSIONS, DEFAULT_TEMPLATE_HEADINGS } from "./constants";
import type { AppSettings } from "./types";
import { safeJson } from "./utils";

export const OPENROUTER_DEFAULT_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL ?? "";
export const SETTINGS_KEY = "forensicpad.settings";

export function defaultSettings(): AppSettings {
  return {
    owner: "",
    repo: "",
    branch: "main",
    investigationsRoot: "investigations",
    allowedExtensions: DEFAULT_ALLOWED_EXTENSIONS,
    maxEvidenceFileSizeMb: 5,
    reportTemplateHeadings: DEFAULT_TEMPLATE_HEADINGS,
    openRouterModel: OPENROUTER_DEFAULT_MODEL,
    aiContextScope: AI_CONTEXT_SCOPES[2]
  };
}

export function loadClientSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings();
  const stored = window.localStorage.getItem(SETTINGS_KEY);
  return stored ? { ...defaultSettings(), ...safeJson<Partial<AppSettings>>(stored, {}) } : defaultSettings();
}
