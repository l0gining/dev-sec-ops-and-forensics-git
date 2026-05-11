import { apiError, listCommits } from "@/lib/github";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    return Response.json({ commits: await listCommits(caseId) });
  } catch (error) {
    return apiError(error);
  }
}
