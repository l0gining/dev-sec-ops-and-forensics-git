import { apiError, readCaseBundle, updateMetadata } from "@/lib/github";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    return Response.json(await readCaseBundle(caseId));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const body = await request.json();
    return Response.json({ metadata: await updateMetadata(caseId, body) });
  } catch (error) {
    return apiError(error);
  }
}
