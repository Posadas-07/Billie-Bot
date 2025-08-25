const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const pref = (Array.isArray(global.prefixes) && global.prefixes[0]) || ".";

  try { await conn.sendMessage2(chatId, { react: { text: "✨", key: msg.key } }, msg); } catch {}

  try {
    const filePath = path.resolve("./setmenu.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const texto  = typeof data?.texto === "string" ? data.texto : "";
      const imagen = typeof data?.imagen === "string" && data.imagen.length ? data.imagen : null;

      if (texto.trim().length || imagen) {
        if (imagen) {
          const buffer = Buffer.from(imagen, "base64");
          await conn.sendMessage2(chatId, {
            image: buffer,
            caption: texto && texto.length ? texto : undefined
          }, msg);
          return;
        } else {
          await conn.sendMessage2(chatId, { text: texto }, msg);
          return;
        }
      }
    }
  } catch (e) {
    console.error("[menu] Error leyendo setmenu.json:", e);
  }

  const caption = `𝗗𝗔𝗡𝗩𝗘𝗥𝗦 𝗜𝗔 𝗕𝗢𝗧

𖠁𝙈𝙀𝙉𝙐 𝙂𝙀𝙉𝙀𝙍𝘼𝙇𖠁
𖠁𝗣𝗿𝗲𝗳𝗶𝗷𝗼 𝗔𝗰𝘁𝘂𝗮𝗹: 『 ${pref} 』
𖠁𝗨𝘀𝗮 𝗲𝗻 𝗰𝗮𝗱𝗮 𝗰𝗼𝗺𝗮𝗻𝗱𝗼

╭───➻𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 🍩 
│
│➼ ${pref}ping
│➼ ${pref}speedtest
│➼ ${pref}creador
│➼ ${pref}info
╰─────◆

╭───➻𝗠𝗘𝗡𝗨́𝗦 📜
│
│➼ ${pref}menugrupo
│➼ ${pref}menuaudio
│➼ ${pref}menuowner
│➼ ${pref}menufree
╰─────◆

╭───➻𝗣𝗔𝗥𝗔 𝗡𝗘𝗚𝗢𝗖𝗜𝗢𝗦 💸
│
│➼ ${pref}setstock / stock
│➼ ${pref}setnetflix / netflix
│➼ ${pref}setpago / pago
│➼ ${pref}setcombos / combos
│➼ ${pref}setpeliculas / peliculas
│๛ ${pref}settramites / tramites
│➼ ${pref}setcanvas / canvas
│➼ ${pref}setreglas / reglas
│➼ ${pref}sorteo
│➼ ${pref}setsoporte / soporte
│➼ ${pref}setpromo / promo
│➼ ${pref}addfactura
│➼ ${pref}delfactura
│➼ ${pref}facpaga
│➼ ${pref}verfac
╰─────◆

╭───➻𝗦𝗜𝗦𝗧𝗘𝗠𝗔 𝗗𝗘 𝗟𝗔 𝗜𝗔 📲
│
│➼ ${pref}gemini
│➼ ${pref}chatgpt
│➼ ${pref}dalle
│➼ ${pref}visión
│➼ ${pref}visión2
│➼ ${pref}chat on/off
│➼ ${pref}luminai
╰─────◆

╭───➻𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 💻
│
│➼ ${pref}play / play1 / play2 / play3
│➼ ${pref}ytmp3 / ytmp4 / ytmp3doc / ytmp4doc
│➼ ${pref}tiktok / fb / ig / spotify
│➼ ${pref}kiss / topkiss
│➼ ${pref}slap / topslap
│➼ ${pref}mediafire / apk
╰─────◆

╭───➻𝗕𝗨𝗦𝗖𝗔𝗗𝗢𝗥𝗘𝗦 🔭
│
│➼ ${pref}pixai
│➼ ${pref}tiktoksearch
│➼ ${pref}yts
│➼ ${pref}tiktokstalk
╰─────◆

╭───➻𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗜𝗗𝗢𝗥𝗘𝗦 🌬️
│
│➼ ${pref}tomp3
│➼ ${pref}toaudio
│➼ ${pref}hd
│➼ ${pref}tts
│➼ ${pref}tovideo / toimg
│➼ ${pref}gifvideo / ff / ff2
╰─────◆

╭───➻𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦 🐝
│
│➼ ${pref}s / qc / qc2 / texto
│➼ ${pref}mixemoji / aniemoji
│➼ ${pref}addco / delco
╰─────◆

╭───➻𝗛𝗘𝗥𝗥𝗔𝗠𝗜𝗘𝗡𝗧𝗔𝗦 🛠️
│➼ ${pref}ver / perfil / get / xxx
│➼ ${pref}tourl / whatmusic
╰─────◆

╭───➻𝗠𝗜𝗡𝗜 𝗝𝗨𝗘𝗚𝗢𝗦 🎮👾
│➼ ${pref}top 
│➼ ${pref}verdad 
│➼ ${pref}reto
│➼ ${pref}personalidad
│➼ ${pref}parejas
│➼ ${pref}ship
│➼ ${pref}kiss 
│➼ ${pref}ropkiss
│➼ ${pref}slap
│➼ ${pref}topslap
│➼ ${pref}puto
│➼ ${pref}puta
│➼ ${pref}manco
│➼ ${pref}manca
│➼ ${pref}negro
│➼ ${pref}neegra
│➼ ${pref}negro
│➼ ${pref}cachudo
│➼ ${pref}cachuda
│➼ ${pref}pajero
│➼ ${pref}pajera
│➼ ${pref}adoptado
│➼ ${pref}adoptada
│➼ ${pref}peruano 
│➼ ${pref}peruana
│➼ ${pref}feo
│➼ ${pref}fea
│➼ ${pref}gay
╰─────◆
`.trim();

await conn.sendMessage2(chatId, {
    image: { url: "https://cdn.russellxz.click/ddd024a4.jpeg" },
    caption
}, msg);
};

handler.command = ["menu"];
handler.help = ["menu"];
handler.tags = ["menu"];

module.exports = handler;
