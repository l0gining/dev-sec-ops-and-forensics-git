import { apiError, readBase64File } from "@/lib/github";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");
    if (!path) throw new Error("Missing evidence path.");
    return Response.json({ base64: await readBase64File(path) });
  } catch (error) {
    return apiError(error);
  }
}
