// index.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const ytdl = require('ytdl-core');
const { runtime } = require('./src/lib/functions');
require('./config.js');

async function startQueenJenifer() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !global.SESSION_ID,
    auth: state,
    version
  });

  client.ev.on('creds.update', saveCreds);

  client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr && !global.SESSION_ID) qrcode.generate(qr, { small: true });
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startQueenJenifer();
    } else if (connection === 'open') {
      console.log(chalk.green('👑 Queen Jenifer MD connectée ! ✨'));
    }
  });

  client.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!body.startsWith(global.prefix)) return;

    const args = body.slice(global.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // MENU PRINCIPAL ULTRA STYLÉ (Meta AI vibe + vocal + buttons + deploy file)
    if (['menu', 'alive', 'queen'].includes(command)) {
      // Note vocale royale
      await client.sendMessage(from, {
        audio: { url: global.welcomeVoice },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      }, { quoted: msg });

      // Image + caption Meta style
      await client.sendMessage(from, {
        image: { url: global.menuThumb },
        caption: `
╭━━━❰ 👑 𝐐𝐔𝐄𝐄𝐍 𝐉𝐄𝐍𝐈𝐅𝐄𝐑 𝐌𝐃 👑 ❱━━━╮
┃ ✨ *Imagine with Queen Jenifer* ✨
┃ 
┃ 💕 Salut mon trésor, ta reine est là !
┃ ⏳ Uptime : ${runtime(process.uptime())}
┃ 👤 Owner : ${global.ownerName}
┃ 🔗 Prefix : ${global.prefix}
┃ 
┃ Choisis ton royaume ci-dessous 💅
╰━━━━━━━━━━━━━━━━━━╯
        `.trim()
      }, { quoted: msg });

      // Buttons stylés
      const buttons = [
        [{ buttonId: '.downloadmenu', buttonText: { displayText: '📥 Download Menu' }, type: 1 }],
        [{ buttonId: '.groupemenu', buttonText: { displayText: '👥 Group Menu' }, type: 1 }],
        [{ buttonId: '.funmenu', buttonText: { displayText: '🎮 Fun Menu' }, type: 1 }],
        [{ buttonId: '.system-menu', buttonText: { displayText: '🧠 System Menu' }, type: 1 }],
        [{ buttonId: '.queenmenu', buttonText: { displayText: '👑 Queen Menu' }, type: 1 }]
      ];

      await client.sendMessage(from, {
        text: '✦ Que désires-tu, mon sujet ? ✦',
        buttons,
        footer: 'Queen Jenifer MD 👑'
      }, { quoted: msg });

      // Pièce jointe deploy guide
      await client.sendMessage(from, {
        document: { url: 'https://files.catbox.moe/sfn5o5.md' }, // ou upload sur catbox
        fileName: 'deploy queen.md',
        mimetype: 'text/markdown'
      }, { quoted: msg });
    }

    // Exemples sous-menus (ajoute les autres pareil)
    if (command === 'downloadmenu') {
      await client.sendMessage(from, {
        image: { url: global.downloadThumb },
        caption: `
📥 *DOWNLOAD MENU* 📥

✦ .tiktok <lien> → Vidéo sans watermark
✦ .ytmp4 <lien> → Vidéo YouTube HD
✦ .ytmp3 <lien> → Audio YouTube MP3
✦ .song <titre> → Recherche & download chanson

© Queen Jenifer MD 👑
        `.trim()
      }, { quoted: msg });
    }

    // Ping & Alive
    if (command === 'ping') {
      const latency = Date.now() - msg.messageTimestamp * 1000;
      await client.sendMessage(from, { text: `💨 *Latence : ${latency}ms*\n🕐 *Uptime : ${runtime(process.uptime())}*\n\n_Toujours la plus rapide 😉_` }, { quoted: msg });
    }

    // Exemple commande tiktok (inspiré des meilleurs, avec API gratuite fiable)
    if (command === 'tiktok' || command === 'tt') {
      if (!args[0]) return client.sendMessage(from, { text: global.mess.wait });
      try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${args[0]}`); // API gratuite stable 2026
        const data = res.data;
        await client.sendMessage(from, { video: { url: data.video.noWatermark }, caption: '✦ TikTok sans watermark 👑' }, { quoted: msg });
      } catch { await client.sendMessage(from, { text: global.mess.error }); }
    }

    // Ajoute les autres commandes (ytmp4, sticker, anti-link, etc.) de la même façon – je te les donne en next message si tu veux plus !
  });
}

startQueenJenifer();