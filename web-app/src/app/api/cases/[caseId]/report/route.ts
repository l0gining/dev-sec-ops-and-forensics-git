import { apiError, readCaseBundle, updateReport } from "@/lib/github";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const bundle = await readCaseBundle(caseId);
    return Response.json({ report: bundle.report, metadata: bundle.metadata });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const { report, message } = await request.json();
    return Response.json(await updateReport(caseId, report, message));
  } catch (error) {
    return apiError(error);
  }
}
