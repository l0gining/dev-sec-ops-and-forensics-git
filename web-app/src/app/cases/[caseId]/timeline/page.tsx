import { CaseHeading } from "@/components/case-heading";
import { TimelineWorkspace } from "@/components/timeline-workspace";

export default async function TimelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <TimelineWorkspace caseId={caseId} />
    </>
  );
}
