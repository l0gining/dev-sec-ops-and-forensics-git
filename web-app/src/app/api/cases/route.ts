import { apiError, createCase, listCases } from "@/lib/github";

export async function GET() {
  try {
    return Response.json({ cases: await listCases() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json({ case: await createCase(body) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
