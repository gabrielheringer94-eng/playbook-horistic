// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION · ticket-email
// Dispara e-mails de ticket via Resend
// Deploy: supabase functions deploy ticket-email --no-verify-jwt
// Secret: supabase secrets set RESEND_API_KEY=re_xxxxx
// ═══════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
// Remetente: use "onboarding@resend.dev" para testar,
// ou seu domínio verificado no Resend (ex: "ticket@horistic.com.br")
const FROM = "Tickets Horistic <onboarding@resend.dev>";

const QUAD = [
  { tag: "Urgente + Importante", sla: "4h úteis", color: "#C0392B" },
  { tag: "Importante · Não urgente", sla: "48h úteis", color: "#1C62C8" },
  { tag: "Urgente · Não importante", sla: "24h úteis", color: "#FF8300" },
  { tag: "Backlog", sla: "5 dias úteis", color: "#828E9D" },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function shell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e6e6">
      <div style="background:#141413;padding:20px 24px">
        <div style="color:#fff;font-size:15px;font-weight:700">Horistic <span style="color:#FF8300">·</span> Tickets</div>
      </div>
      <div style="padding:24px">
        <h2 style="font-size:18px;color:#141413;margin:0 0 16px">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:14px 24px;background:#f7f7f7;border-top:1px solid #e6e6e6;font-size:11px;color:#aeaeae">
        E-mail automático do sistema de tickets do Playbook Comercial Horistic.
      </div>
    </div></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();
    const { event, ticket } = body;
    // event: "novo" | "andamento" | "concluido"
    const results = [];

    if (event === "novo") {
      const q = QUAD[ticket.quadrante] ?? QUAD[3];
      const html = shell(
        `Novo ticket para você, ${ticket.dono}`,
        `<p style="font-size:14px;color:#333;line-height:1.6">
          <span style="display:inline-block;background:${q.color};color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px">${q.tag} · SLA ${q.sla}</span>
        </p>
        <table style="width:100%;font-size:14px;color:#333;line-height:1.7;margin-top:12px">
          <tr><td style="color:#828E9D;width:130px">Problema</td><td style="font-weight:600">${ticket.titulo}</td></tr>
          <tr><td style="color:#828E9D">Aberto por</td><td>${ticket.autor}</td></tr>
          <tr><td style="color:#828E9D">E-mail</td><td>${ticket.autor_email}</td></tr>
        </table>
        <div style="margin-top:16px;padding:14px;background:#f7f7f7;border-radius:9px;font-size:14px;color:#333;line-height:1.6">
          ${ticket.descricao}
        </div>`
      );
      results.push(await sendEmail(ticket.dono_email, `[Ticket] Novo chamado: ${ticket.titulo}`, html));
    }

    if (event === "andamento" || event === "concluido") {
      const label = event === "andamento" ? "foi iniciado" : "foi concluído";
      const color = event === "andamento" ? "#FF8300" : "#1A7F4B";
      const html = shell(
        `Atualização no seu ticket`,
        `<p style="font-size:14px;color:#333;line-height:1.7">Olá <b>${ticket.autor}</b>,</p>
        <p style="font-size:14px;color:#333;line-height:1.7">Seu ticket <b>${ticket.titulo}</b> <span style="color:${color};font-weight:700">${label}</span> por ${ticket.dono}.</p>`
      );
      results.push(await sendEmail(ticket.autor_email, `[Ticket] Seu chamado ${label}: ${ticket.titulo}`, html));
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
