import { CaseHeading } from "@/components/case-heading";
import { ReportEditor } from "@/components/report-editor";

export default async function ReportPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <ReportEditor caseId={caseId} />
    </>
  );
}
