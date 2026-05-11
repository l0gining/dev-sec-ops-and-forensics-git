import { apiError, appendTimeline, readCaseBundle } from "@/lib/github";

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const bundle = await readCaseBundle(caseId);
    return Response.json({ timeline: bundle.timeline });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await params;
    const body = await request.json();
    const event = {
      timestamp: body.timestamp || new Date().toISOString(),
      type: body.type || "manual",
      title: body.title,
      description: body.description || "",
      source: "ForensicPad"
    };
    return Response.json({ timeline: await appendTimeline(caseId, event) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
