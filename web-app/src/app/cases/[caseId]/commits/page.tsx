import { CaseHeading } from "@/components/case-heading";
import { CommitsWorkspace } from "@/components/commits-workspace";

export default async function CommitsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <CommitsWorkspace caseId={caseId} />
    </>
  );
}
