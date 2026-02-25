# Recipe From Ingredients (Gemini)

Single-page React app with a tiny serverless API that calls Gemini to create a recipe from your ingredients.

## Setup

1. Install deps
2. Add environment variable
3. Run dev server

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=YOUR_KEY
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add `GEMINI_API_KEY` in Vercel project settings.
4. Deploy.

The serverless endpoint is at `/api/generate`.
