// ============================================================
//  /api/ask  — Sydney Maxing AI backend (Vercel serverless)
//  Calls the Anthropic API with the live web_search tool and
//  returns a short answer with real links.
//
//  Needs one environment variable in Vercel:
//    ANTHROPIC_API_KEY = sk-ant-...   (set in Vercel dashboard)
// ============================================================

export default async function handler(req, res) {
  // CORS (so it works from the installed PWA)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "The app isn't connected to an AI key yet. Add ANTHROPIC_API_KEY in Vercel (see DEPLOY.md)."
    });
  }

  // read body (Vercel usually parses JSON; fall back just in case)
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const question = (body && body.question ? String(body.question) : "").slice(0, 500).trim();
  if (!question) return res.status(400).json({ error: "Ask me something first!" });

  const today = new Date().toISOString().slice(0, 10);

  const system =
    "You are Sydney Maxing, a sharp local concierge for a uni student spending Jan–Jun 2027 in Sydney, Australia. " +
    "Today is " + today + ". Always use web search for anything time-sensitive: events, concerts, festivals, " +
    "restaurant openings, flight ideas. Be concise and upbeat. " +
    "Format: 2–5 short bullet points. For each, give the name, the date if there is one, and a real link " +
    "as a markdown link [name](https://...). Prefer official event / venue / booking pages. " +
    "If something needs tickets, say so. Keep it under ~150 words. Don't invent links — only include URLs you " +
    "actually found via search.";

  const payload = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: system,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
    messages: [{ role: "user", content: question }]
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || "AI request failed.";
      return res.status(502).json({ error: msg });
    }

    // collect all text blocks from the response
    const answer = (data.content || [])
      .filter(function (b) { return b.type === "text"; })
      .map(function (b) { return b.text; })
      .join("\n")
      .trim();

    return res.status(200).json({ answer: answer || "I couldn't find anything on that — try rephrasing." });
  } catch (e) {
    return res.status(500).json({ error: "Network error reaching the AI. Try again." });
  }
}
