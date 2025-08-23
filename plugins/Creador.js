const fetch = require("node-fetch");
const axios = require("axios");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Reacción inicial
  await conn.sendMessage(chatId, { react: { text: "👑", key: msg.key } });

  const numCreador = "50493374445";
  const ownerJid = `${numCreador}@s.whatsapp.net`;
  const canal = "[https://𝖯𝗈𝗐𝖾𝗋𝖾𝖽](https://𝖯𝗈𝗐𝖾𝗋𝖾𝖽) 𝖻𝗒 𝖢𝗁𝗈𝗅𝗂𝗍𝗈.𝗑𝗒𝗓/furina_ai"; // Enlace de canal

  // Obtener nombre del creador
  let name = "𝖢𝗁𝗈𝗅𝗂𝗍𝗈.𝗑𝗒𝗓";
  try {
    name = (await conn.getName(ownerJid)) || name;
  } catch {}

  // Crear vCard
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${name}
TITLE:
TEL;waid=${numCreador}:${numCreador}
X-WA-BIZ-DESCRIPTION:𝖠𝖽𝗊𝗎𝗂𝖾𝗋𝖾 𝗈 𝗋𝖾𝗇𝗎𝖾𝗏𝖺 𝗍𝗎 𝗆𝖾𝗆𝖻𝗋𝖾𝗌𝗂𝖺 𝖼𝗈𝗇 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 𝖠𝖨
X-WA-BIZ-NAME:${name}
END:VCARD`;

  const list = [{ displayName: name, vcard }];

  // Obtener thumbnail genérico para externalAdReply
  const thumbUrl = "https://cdn.russellxz.click/0551b71f.jpeg";
  const thumb = await (await axios.get(thumbUrl, { responseType: "arraybuffer" })).data;

const fkontak = {
  key: {
    participants: "13135550002@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "Halo"
  },
  message: {
    productMessage: {
      product: {
        productId: "YOUR_RETAILER_ID",
        title: "𝖢𝗁𝗈𝗅𝗂𝗍𝗈 - 𝗑𝗒𝗓 𝖢𝗈𝗇𝗍𝖺𝖼𝗍𝗈 🌱",
        description: null,
        retailerId: "YOUR_RETAILER_ID",
        productImage: {
          jpegThumbnail: await (await fetch("https://iili.io/FbBA4uR.th.jpg")).buffer()
        }
      },
      businessOwnerJid: "13135550002@s.whatsapp.net",
      contextInfo: {
        forwardable: true
      }
    }
  },
  participant: "13135550002@s.whatsapp.net"
};

  // Enviar contacto con preview citando fkontak
  await conn.sendMessage(
    chatId,
    {
      contacts: { displayName: `${list.length} Contacto`, contacts: list },
      contextInfo: {
        externalAdReply: {
          title: "𝖧𝗈𝗅𝖺 𝖲𝗈𝗒 𝖢𝗁𝗈𝗅𝗂𝗍𝗈, 𝖢𝗋𝖾𝖺𝗍𝗈𝗋 𝗈𝖿 𝗌𝗆𝖺𝗋𝗍 𝖻𝗈𝗍𝗌",
          body: "𝖪𝗂𝗅𝗅𝗎𝖺-𝖡𝗈𝗍 𝖨𝖠 ₓ˚. ୭ ˚○◦˚",
          mediaType: 1,
          previewType: 0,
          mediaUrl: canal,
          sourceUrl: canal,
          thumbnail: thumb,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: fkontak } // 📌 Aquí citamos la vCard decorativa
  );
};

handler.command = ["owner", "creator", "creador", "dueño", "renovar"];
module.exports = handler;