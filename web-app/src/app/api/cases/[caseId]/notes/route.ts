import { apiError, readCaseBundle, saveNotes } from "@/lib/github";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const bundle = await readCaseBundle(caseId);
    return Response.json({ notes: bundle.notes });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const { notes } = await request.json();
    return Response.json({ notes: await saveNotes(caseId, notes) });
  } catch (error) {
    return apiError(error);
  }
}
