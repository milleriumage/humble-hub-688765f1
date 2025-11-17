# Deploy Completo no Railway 🚀

Para habilitar **todos os recursos** (login + salas + tempo real), use Railway que suporta WebSockets persistentes.

## ⚡ Deploy Automático (Recomendado)

O projeto já tem `railway.toml` configurado! Basta:

1. Acesse [railway.app](https://railway.app)
2. Clique em **"Start a New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seu GitHub
5. Selecione o repositório do projeto
6. **Railway vai detectar automaticamente a configuração!**

## 🔧 Deploy Manual (Se Necessário)

Se preferir configurar manualmente:

### Settings → Build & Deploy

**IMPORTANTE:** Deixe **Root Directory em branco** (o railway.toml já gerencia isso)

```bash
# Build Command (opcional, já está no railway.toml)
cd backend && npm install

# Start Command (opcional, já está no railway.toml)
cd backend && npm start
```

### Settings → Variables

```bash
# Adicione apenas se quiser desabilitar tempo real (não recomendado)
# DISABLE_IMQ=false  
# (Ou deixe em branco para habilitar tudo)
```

### Settings → Networking

- Railway vai gerar automaticamente uma URL pública
- Exemplo: `https://seu-projeto-production.up.railway.app`

## Passo 4: Deploy Automático

1. Railway faz o deploy automaticamente após a configuração
2. Aguarde ~2-3 minutos para o build completar
3. Copie a URL gerada em **Settings → Domains**

## Passo 5: Configurar Frontend

No app Lovable, vá em **Settings** e configure:

```
Backend URL: https://seu-projeto-production.up.railway.app
```

Ou via console do navegador (F12):

```javascript
localStorage.setItem('BACKEND_URL', 'https://seu-projeto-production.up.railway.app');
location.reload();
```

## ✅ Verificar Funcionamento

1. Abra o app
2. Vá em **Bots** → Faça login
3. Vá em **Rooms** → Buscar salas
4. **Entre em uma sala** - deve funcionar agora!
5. **Envie mensagens** - tempo real habilitado!

Nos logs do backend você verá:
```
[Bot bot-1] Successfully logged in as SeuUsuario
[Bot bot-1] IMQ connected - real-time features enabled ✅
```

## 🔄 Deploy Automático

Railway faz deploy automático a cada push no GitHub:

```bash
git push origin main
# Railway detecta e faz redeploy automaticamente
```

## 💰 Custos

- **$5 grátis/mês** para experimentar
- **~$5-10/mês** para uso normal
- Mais barato que manter servidor próprio

## 🆚 Comparação

| Feature | Vercel | Railway |
|---------|--------|---------|
| Login | ✅ | ✅ |
| Buscar salas | ✅ | ✅ |
| Entrar em salas | ❌ | ✅ |
| Tempo real | ❌ | ✅ |
| WebSockets | ❌ | ✅ |
| Custo | Grátis | $5/mês |

## 🐛 Troubleshooting

### Deploy falha

```bash
# Verifique os logs em Railway Dashboard → Deployments
# Erro comum: npm install falha
# Solução: Verificar package.json no backend/
```

### Backend não responde

```bash
# Verifique se a porta está correta
# Railway usa PORT automático via variável de ambiente
# O server.js já está configurado: process.env.PORT || 3001
```

### Login funciona mas salas não

```bash
# Verifique logs do Railway
# Procure por: "IMQ connected - real-time features enabled"
# Se não aparecer, verifique se DISABLE_IMQ não está true
```

## 📚 Links Úteis

- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Pricing](https://railway.app/pricing)

## 🎯 Próximos Passos

Após deploy no Railway:
1. ✅ Login funciona
2. ✅ Salas funcionam
3. ✅ Tempo real habilitado
4. Configure a IA do bot em **Settings** → AI Personality
5. Entre em salas e veja o bot responder!
