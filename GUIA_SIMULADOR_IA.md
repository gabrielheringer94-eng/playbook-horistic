# Ativar o Simulador de IA — proxy `anthropic-chat`

O simulador de call e as dicas usam a API da Anthropic. O HTML agora chama uma
Edge Function (`anthropic-chat`) em vez de bater direto na API — assim a
`ANTHROPIC_API_KEY` fica no servidor e **não** vaza no HTML público do GitHub Pages.

Enquanto a função não estiver no ar, o simulador continua respondendo
"Hmm, pode repetir?" (fallback). Depois do deploy abaixo, funciona.

---

## 1. Obter a API key da Anthropic

Console da Anthropic → **API Keys** → cria uma key (`sk-ant-...`). Guarde.

## 2. Subir a Edge Function

```bash
# (se ainda não fez) instalar CLI e vincular o projeto
brew install supabase/tap/supabase
supabase login
supabase link --project-ref feydpbqdsekolowcxska

# copie edge-function-anthropic-chat/index.ts para
#   supabase/functions/anthropic-chat/index.ts

# guardar a chave (server-side)
supabase secrets set ANTHROPIC_API_KEY="sk-ant-xxxxxxxx"

# deploy (a função é chamada do browser com a anon key)
supabase functions deploy anthropic-chat --no-verify-jwt
```

## 3. Testar com curl

Troque `SUA_ANON_KEY` pela mesma `TK_SUPA_KEY` do playbook.

```bash
curl -i -X POST \
  "https://feydpbqdsekolowcxska.supabase.co/functions/v1/anthropic-chat" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 100,
    "messages": [{"role":"user","content":"Diga apenas: ok, funcionando."}]
  }'
```

Esperado: JSON com `content[0].text`. Se vier `{"error":"ANTHROPIC_API_KEY não configurada"}`,
faltou o `secrets set`. Se vier `401`, use `--no-verify-jwt` no deploy.

Depois, abra o playbook → **Modo treino → Simulador com IA** e faça uma call.

---

## Notas

- A função tem **allowlist de modelos** e **cap de `max_tokens` (1024)** — se alguém
  descobrir a URL + anon key, não consegue usar a chave para pedidos arbitrários grandes.
- Modelo atual: `claude-sonnet-4-6` (válido e estável). Para atualizar p/ o Sonnet mais
  novo (`claude-sonnet-5`), troque as 3 ocorrências no HTML **e** adicione o id à allowlist
  da função — mas atenção: no Sonnet 5 o "adaptive thinking" liga por padrão e consome
  parte do `max_tokens`, então convém subir o `max_tokens` das chamadas de chat ou mandar
  `thinking: {"type":"disabled"}`. Por isso mantive em 4.6 por enquanto.
