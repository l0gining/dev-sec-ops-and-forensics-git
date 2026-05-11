import { CaseHeading } from "@/components/case-heading";
import { NotesWorkspace } from "@/components/notes-workspace";

export default async function NotesPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseHeading caseId={caseId} />
      <NotesWorkspace caseId={caseId} />
    </>
  );
}
