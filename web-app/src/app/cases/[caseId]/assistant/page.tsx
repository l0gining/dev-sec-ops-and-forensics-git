import { CaseHeading } from "@/components/case-heading";
import { AssistantWorkspace } from "@/components/assistant-workspace";

export default async function AssistantPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <AssistantWorkspace caseId={caseId} />
    </>
  );
}
