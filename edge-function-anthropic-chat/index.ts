// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION · anthropic-chat
// Proxy do simulador de IA do playbook. Mantém a ANTHROPIC_API_KEY
// no servidor (o HTML é público no GitHub Pages — a chave NÃO pode
// ficar no client).
//
// Deploy:  supabase functions deploy anthropic-chat --no-verify-jwt
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// O client manda { model, max_tokens, system?, messages } e recebe de
// volta a resposta crua da API da Anthropic (data.content[0].text).
// ═══════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

// modelos que o simulador pode usar (evita que a chave seja usada p/ qualquer coisa)
const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-6",
  "claude-sonnet-5",
  "claude-haiku-4-5",
  "claude-opus-4-8",
]);
const MAX_TOKENS_CAP = 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY não configurada" }, 500);

  let body: {
    model?: string;
    max_tokens?: number;
    system?: string;
    messages?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "body inválido" }, 400);
  }

  const model = ALLOWED_MODELS.has(String(body.model)) ? body.model : "claude-sonnet-4-6";
  const maxTokens = Math.min(Number(body.max_tokens) || 300, MAX_TOKENS_CAP);
  if (!Array.isArray(body.messages)) return json({ error: "messages ausente" }, 400);

  const payload: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages: body.messages,
  };
  if (body.system) payload.system = body.system;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // repassa a resposta crua (sucesso ou erro) para o client
  const data = await r.json().catch(() => ({ error: "resposta inválida da Anthropic" }));
  return json(data, r.ok ? 200 : r.status);
});
