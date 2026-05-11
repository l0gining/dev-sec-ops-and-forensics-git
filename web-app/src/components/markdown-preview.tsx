"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ value }: { value: string }) {
  return (
    <article className="prose max-w-none p-4 text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "_No content yet._"}</ReactMarkdown>
    </article>
  );
}
