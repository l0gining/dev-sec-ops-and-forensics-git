import { apiError, readCaseBundle, uploadEvidence } from "@/lib/github";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const bundle = await readCaseBundle(caseId);
    return Response.json({ evidence: bundle.evidence });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const body = await request.json();
    return Response.json({ evidence: await uploadEvidence(caseId, body) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
