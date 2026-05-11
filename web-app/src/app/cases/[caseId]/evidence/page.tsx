import { CaseHeading } from "@/components/case-heading";
import { EvidenceWorkspace } from "@/components/evidence-workspace";

export default async function EvidencePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <EvidenceWorkspace caseId={caseId} />
    </>
  );
}
