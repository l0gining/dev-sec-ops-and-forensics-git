"use client";

import { buildLineDiff } from "@/lib/utils";

export function DiffViewer({ oldText = "", newText }: { oldText?: string; newText: string }) {
  return (
    <pre className="max-h-[340px] overflow-auto rounded-md border border-border bg-slate-950 p-3 text-xs text-white">
      {buildLineDiff(oldText, newText).map((line, index) => (
        <div key={`${index}-${line.type}`} className={line.type === "added" ? "text-emerald-300" : "text-rose-300"}>
          {line.type === "added" ? "+ " : "- "}
          {line.line || " "}
        </div>
      ))}
    </pre>
  );
}
