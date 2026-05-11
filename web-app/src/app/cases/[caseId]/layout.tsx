import { CaseTabs } from "@/components/case-tabs";

export default async function CaseLayout({ children, params }: { children: React.ReactNode; params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <>
      <CaseTabs caseId={caseId} />
      {children}
    </>
  );
}
