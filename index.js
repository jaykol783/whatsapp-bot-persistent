import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import dotenv from 'dotenv'
import fs from 'fs'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

dotenv.config()

async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('/tmp/session') // persistent disk
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || !m.key.remoteJid) return

    const jid = m.key.remoteJid
    const body = m.message.conversation || m.message.extendedTextMessage?.text || ''

    if (!body.startsWith(process.env.BOT_PREFIX || '!')) return
    const [cmd, ...args] = body.slice(1).trim().split(/ +/)

    if (cmd === 'ping') {
      await sock.sendMessage(jid, { text: 'pong 🏓' })
    }

    if (cmd === 'song' && args[0]) {
      try {
        const url = args[0]
        if (!ytdl.validateURL(url)) {
          return sock.sendMessage(jid, { text: '❌ Invalid YouTube URL' })
        }
        const info = await ytdl.getInfo(url)
        const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '')
        const filePath = `/tmp/${title}.mp3`

        const stream = ytdl(url, { filter: 'audioonly', quality: 'lowestaudio' })
        ffmpeg(stream)
          .setFfmpegPath(ffmpegPath)
          .audioBitrate(64)
          .save(filePath)
          .on('end', async () => {
            await sock.sendMessage(jid, { audio: { url: filePath }, mimetype: 'audio/mpeg' })
            fs.unlinkSync(filePath)
          })
      } catch (e) {
        console.error(e)
        sock.sendMessage(jid, { text: '❌ Failed to download song' })
      }
    }

    if (cmd === 'video' && args[0]) {
      try {
        const url = args[0]
        if (!ytdl.validateURL(url)) {
          return sock.sendMessage(jid, { text: '❌ Invalid YouTube URL' })
        }
        const info = await ytdl.getInfo(url)
        const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '')
        const filePath = `/tmp/${title}.mp4`

        const stream = ytdl(url, { quality: '18' }) // 360p
        ffmpeg(stream)
          .setFfmpegPath(ffmpegPath)
          .videoCodec('libx264')
          .size('?x360')
          .save(filePath)
          .on('end', async () => {
            await sock.sendMessage(jid, { video: { url: filePath }, caption: title })
            fs.unlinkSync(filePath)
          })
      } catch (e) {
        console.error(e)
        sock.sendMessage(jid, { text: '❌ Failed to download video' })
      }
    }
  })
}

connectBot()
