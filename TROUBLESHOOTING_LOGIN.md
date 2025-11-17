# Troubleshooting: Login do IMVU

## ⚠️ IMPORTANTE: Limitação do Vercel

O backend Vercel **NÃO suporta WebSockets persistentes**. Isso significa:
- ✅ Login e comandos básicos funcionam
- ❌ Updates em tempo real via WebSocket não funcionam
- 📝 Você verá a mensagem: "Real-time updates via WebSocket not available on Vercel deployment"

Para WebSockets, você precisaria usar outro hosting (Railway, Render, etc).

---

## Erro: "Login failed. Please check credentials"

Este erro geralmente NÃO é um problema com suas credenciais. Siga este checklist:

### ✅ Passo 1: Verificar Backend URL

1. Abra o app no navegador
2. Pressione **F12** para abrir o console
3. Vá em **Settings** (menu lateral)
4. Verifique se a "Backend URL" está configurada
5. Deve ser algo como: `https://humble-hub-96357c81.vercel.app`

**Se estiver vazio ou errado:**
- Cole a URL correta do seu backend Vercel
- Clique em "Save and Reload"

### ✅ Passo 2: Verificar se Backend está Rodando

1. Abra a URL do backend no navegador (ex: `https://humble-hub-96357c81.vercel.app/health`)
2. Você deve ver: `{"status":"ok","timestamp":"..."}`
3. Se não ver isso, o backend não está rodando

**Para fazer o deploy do backend:**
```bash
cd backend
vercel
```

### ✅ Passo 3: Ver Logs Detalhados

1. Com o console aberto (F12), tente fazer login novamente
2. Procure por mensagens como:

```
[leovida000] Connecting to backend: https://...
[leovida000] Attempting to login via backend...
[leovida000] Backend response status: 200
```

**O que cada log significa:**

- `Backend URL not configured!` → Vá em Settings e configure
- `Failed to connect to backend` → Backend não está rodando
- `Backend response status: 401` → Credenciais IMVU inválidas
- `Backend response status: 500` → Erro no backend (veja logs do Vercel)

### ✅ Passo 4: Testar Backend Manualmente

Teste o backend com curl (substitua USERNAME e PASSWORD):

```bash
curl -X POST https://humble-hub-96357c81.vercel.app/login \
  -H "Content-Type: application/json" \
  -d '{"username":"SEU_USERNAME","password":"SUA_SENHA"}'
```

**Respostas esperadas:**

✅ Sucesso:
```json
{"success":true,"bot":{"id":"...","username":"..."}}
```

❌ Credenciais inválidas:
```json
{"success":false,"error":"Invalid credentials"}
```

❌ Backend não responde:
```
Connection refused
```

### ✅ Passo 5: Verificar Logs do Vercel

Se o backend responde mas o login falha:

1. Vá em [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto
3. Vá em "Logs"
4. Procure por erros relacionados ao IMVU

### Erros Comuns

#### "Backend URL not configured"
**Solução:** Vá em Settings → Backend Configuration → Cole a URL → Save and Reload

#### "Network error. Is the backend running?"
**Solução:** Faça o deploy do backend no Vercel (`cd backend && vercel`)

#### "Backend response status: 401"
**Solução:** Suas credenciais IMVU estão incorretas. Tente logar no site do IMVU primeiro.

#### "CORS error" no console
**Solução:** Verifique se o backend tem `app.use(cors())` no código

### Verificação Final

Execute no console do navegador (F12):

```javascript
// Ver URL configurada
console.log('Backend URL:', localStorage.getItem('BACKEND_URL'));

// Testar conexão
fetch(localStorage.getItem('BACKEND_URL') + '/health')
  .then(r => r.json())
  .then(d => console.log('Backend health:', d))
  .catch(e => console.error('Backend error:', e));
```

Se tudo estiver configurado, você verá:
```
Backend URL: https://humble-hub-96357c81.vercel.app
Backend health: {status: "ok", timestamp: "..."}
```

---

## Ainda com problemas?

1. Verifique se suas credenciais funcionam no site do IMVU: https://secure.imvu.com/login/
2. Certifique-se de que o backend Vercel está no plano correto (gratuito funciona)
3. Verifique se não há firewall bloqueando a conexão
4. Tente com outro navegador (Chrome/Firefox)
5. Limpe o cache do navegador e tente novamente
