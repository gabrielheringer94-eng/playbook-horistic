# Ativar e-mails dos tickets — Supabase Edge Function + Resend

O código do playbook já está pronto e chama a Edge Function. Faltam 3 passos que só você consegue fazer (exigem login nas suas contas). Leva ~10 minutos.

---

## Passo 1 — Criar conta no Resend e pegar a API Key

1. Acesse **resend.com** → crie conta gratuita (100 e-mails/dia, sem cartão)
2. No menu, vá em **API Keys** → **Create API Key**
3. Nome: `horistic-tickets` · Permission: **Sending access**
4. Copie a chave gerada (começa com `re_...`) — guarde, ela só aparece uma vez

> **Remetente:** para testar imediatamente, o código já usa `onboarding@resend.dev`, que funciona sem verificar domínio. Quando quiser e-mails saindo de `ticket@horistic.com.br`, adicione e verifique o domínio horistic.com.br em **Domains** no Resend e troque a linha `FROM` no `index.ts`.

---

## Passo 2 — Fazer deploy da Edge Function

Precisa do Supabase CLI. No terminal do seu Mac:

```bash
# instalar o CLI (uma vez)
brew install supabase/tap/supabase

# logar
supabase login

# ir para uma pasta de trabalho e linkar o projeto
supabase link --project-ref feydpbqdsekolowcxska

# criar a função
supabase functions new ticket-email
```

Isso cria a pasta `supabase/functions/ticket-email/`. **Substitua** o conteúdo do arquivo `index.ts` gerado pelo arquivo `index.ts` que está em `edge-function-ticket-email/index.ts` (o que eu te entreguei).

Depois:

```bash
# guardar a API key do Resend como secret
supabase secrets set RESEND_API_KEY=re_suachaveaqui

# publicar (o --no-verify-jwt deixa o playbook chamar sem token de usuário)
supabase functions deploy ticket-email --no-verify-jwt
```

---

## Passo 3 — Testar o envio real

Com a função no ar, rode este teste no terminal (troque o e-mail de destino pelo SEU e-mail para receber):

```bash
curl -X POST \
  "https://feydpbqdsekolowcxska.supabase.co/functions/v1/ticket-email" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "novo",
    "ticket": {
      "titulo": "Teste de e-mail",
      "descricao": "Validando o disparo",
      "quadrante": 0,
      "dono": "Gabriel",
      "dono_email": "SEU-EMAIL@gmail.com",
      "autor": "Leonardo",
      "autor_email": "SEU-EMAIL@gmail.com"
    }
  }'
```

Se receber o e-mail, está tudo funcionando. Os disparos automáticos do playbook (novo ticket → dono; iniciar/concluir → autor) usarão exatamente essa função.

---

## Como o fluxo funciona depois de ativo

| Ação no playbook | Quem recebe e-mail | Assunto |
|---|---|---|
| Vendedor abre ticket | **Dono** (Caio/Fernando/Victor/Gabriel) | `[Ticket] Novo chamado: ...` |
| Dono clica "▶ Iniciar trabalho" | **Autor** (quem abriu) | `[Ticket] Seu chamado foi iniciado: ...` |
| Dono clica "✓ Concluir" | **Autor** (quem abriu) | `[Ticket] Seu chamado foi concluído: ...` |

---

## E-mails dos donos

No arquivo `playbook_horistic.html`, os e-mails estão como placeholder. Me envie os reais que eu troco, ou edite direto a constante `TK_OWNERS`:

```javascript
const TK_OWNERS = [
  {name:'Caio',    email:'caio@...',    color:'#1C62C8'},
  {name:'Fernando',email:'fernando@...',color:'#FF8300'},
  {name:'Victor',  email:'victor@...',  color:'#1A7F4B'},
  {name:'Gabriel', email:'gabriel@...', color:'#7C3AED'}
];
```
