import { getServerSettings } from "@/lib/github";
import type { PublicServerConfig } from "@/lib/types";

export async function GET() {
  const settings = getServerSettings();
  const config: PublicServerConfig = {
    owner: settings.owner,
    repo: settings.repo,
    branch: settings.branch,
    investigationsRoot: settings.root,
    openRouterModel: settings.model,
    githubConfigured: Boolean(process.env.GITHUB_TOKEN && settings.owner && settings.repo),
    openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY)
  };
  return Response.json(config);
}
