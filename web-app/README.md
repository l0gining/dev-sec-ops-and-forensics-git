# ForensicPad

ForensicPad is a single-folder Next.js lab app for managing forensic investigation cases inside a GitHub repository.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, and `OPENROUTER_API_KEY`.
3. Install dependencies with `npm install`.
4. Run `npm run dev` or `npm run dev:3000`.

The app only writes under the configured investigations root, defaulting to `investigations/`.
