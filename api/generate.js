export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  const { ingredients, diet, servings, timeLimit } = req.body || {};
  if (!ingredients || typeof ingredients !== "string") {
    res.status(400).json({ error: "Invalid ingredients" });
    return;
  }

  const prompt = `You are a helpful cooking assistant. Create a short recipe using the provided ingredients.

Requirements:
- Use exactly two ingredients from the provided list. You may add common pantry staples (salt, pepper, oil, butter, herbs).
- Diet restriction: ${diet || "none"}.
- Servings: ${servings || "2"}.
- Max total time: ${timeLimit || "30"} minutes.
- Output format:
Title:
Ingredients:
Steps:
Time:
Servings:

Ingredients list: ${ingredients.trim()}`;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "Gemini API error";
      res.status(response.status).json({ error: message });
      return;
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text.";

    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
