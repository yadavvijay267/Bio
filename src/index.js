/* Bio (Vijay267 portfolio) worker: serves the static site and proxies the
 * chat widget's AI requests to Gemini.
 *
 * POST /api/gemini  { prompt, model } -> Gemini generateContent
 *   Uses the GEMINI_API_KEY secret (set in the Cloudflare dashboard or via
 *   `wrangler secret put GEMINI_API_KEY`). The key never reaches the browser.
 *   If the secret is not set, returns 503 { error: "server_key_missing" } and
 *   the chat widget falls back to its built-in FAQ replies.
 * GET /api/gemini -> { ready: true/false } (no Gemini call; readiness check).
 * All other requests are served from the static assets.
 */

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/gemini") {
      if (request.method === "POST") return handleGemini(request, env);
      /* GET = readiness check (no Gemini call). */
      if (request.method === "GET") {
        return json({ ready: !!env.GEMINI_API_KEY }, 200);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleGemini(request, env) {
  const key = env.GEMINI_API_KEY;
  if (!key) {
    return json({ error: "server_key_missing",
      message: "No server Gemini key configured yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad_request", message: "Expected a JSON body." }, 400);
  }
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt.trim()) {
    return json({ error: "bad_request", message: "prompt is required." }, 400);
  }
  const model = typeof body.model === "string" && body.model.trim()
    ? body.model.trim()
    : DEFAULT_MODEL;

  const geminiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent?key=" + encodeURIComponent(key);

  let res;
  try {
    res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
  } catch (e) {
    return json({ error: "upstream_failed", message: "Could not reach Gemini." }, 502);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const status = res.status === 400 || res.status === 403 ? res.status : 502;
    return json({
      error: "gemini_error",
      message: (data && data.error && data.error.message) || ("Gemini returned " + res.status),
    }, status);
  }

  const text = data && data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts.map((p) => p.text || "").join("");
  if (!text || !text.trim()) {
    return json({ error: "empty_response", message: "Gemini returned an empty response." }, 502);
  }
  return json({ text: text.trim() }, 200);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "Content-Type": "application/json" },
  });
}
