# WhatsApp Bot 🤖 (Persistent Session)

A WhatsApp bot using Baileys with **persistent login**.

## Features
- !ping → replies with pong
- !song <url> → downloads YouTube audio (compressed)
- !video <url> → downloads YouTube video (360p)
- Persistent login (no QR scan every restart)

## 🚀 Deploy to Render
1. Fork this repo to your GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New + → Blueprint**.
4. Connect your repo (uses `render.yaml`).
5. Add required environment variables:
   - OPENAI_API_KEY
   - OWNER_JID
   - BOT_PREFIX
6. Deploy 🚀
7. First deploy → scan QR in logs.
8. ✅ After that, session stays saved on disk.

# whatsapp-bot-persistent
# whatsapp-bot-persistent
