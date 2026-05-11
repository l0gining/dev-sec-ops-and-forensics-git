import { CaseHeading } from "@/components/case-heading";
import { TimeWorkspace } from "@/components/time-workspace";

export default async function TimePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <TimeWorkspace caseId={caseId} />
    </>
  );
}
