const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // Asegúrate de tener esto instalado

const handler = async (msg, { conn, command }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

    if (!isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
      }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*"
    }, { quoted: msg });
  }

  const activosPath = path.resolve("./activos.json");
  if (!fs.existsSync(activosPath)) {
    return conn.sendMessage(chatId, {
      text: "❌ Archivo de configuraciones no encontrado."
    }, { quoted: msg });
  }

  const activosRaw = fs.readFileSync(activosPath, "utf-8");
  const activos = JSON.parse(activosRaw);

  function esConfigurable(opcion) {
    const val = activos[opcion];
    return typeof val === "boolean" || (typeof val === "object" && val !== null);
  }

  function estaActivo(opcion) {
    const valor = activos[opcion];
    if (typeof valor === "boolean") return valor === true;
    if (typeof valor === "object") return valor[chatId] === true;
    return false;
  }

  const opcionesConfig = Object.keys(activos).filter(esConfigurable);

  if (opcionesConfig.length === 0) {
    return conn.sendMessage(chatId, {
      text: "⚠️ No hay opciones configurables en este grupo."
    }, { quoted: msg });
  }

  let opcionesMostrar = opcionesConfig;
  if (command === "on") {
    opcionesMostrar = opcionesConfig.filter(op => estaActivo(op));
  } else if (command === "off") {
    opcionesMostrar = opcionesConfig.filter(op => !estaActivo(op));
  }

  if (opcionesMostrar.length === 0) {
    return conn.sendMessage(chatId, {
      text: command === "on"
        ? "⚠️ No hay opciones activas en este grupo."
        : "⚠️ No hay opciones desactivadas en este grupo."
    }, { quoted: msg });
  }

  // Genera el texto
  let texto = `*⚙️ 𝖭𝗈 𝗅𝖾 𝖾𝗇𝗍𝗂𝖾𝗇𝖽𝖾𝗌 𝖺 𝖾𝗌𝗍𝖾 𝗌𝗂𝗌𝗍𝖾𝗆𝖺 ?*\n`;
  texto += `> 𝖡𝗂𝖾𝗇 𝖺𝗊𝗎𝗂́ 𝗍𝖾 𝖾𝗑𝗉𝗅𝗂𝖼𝗈 𝖼𝗈𝗆𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 𝖼𝗈𝗋𝗋𝖾𝖼𝗍𝖺𝗆𝖾𝗇𝗍𝖾 𝗅𝖺 「 ✅ 」𝗌𝗂𝗀𝗇𝗂𝖿𝗂𝖼𝖺 𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈 𝗒 𝗅𝖺 「 ❌ 」𝗌𝗂𝗀𝗇𝗂𝖿𝗂𝖼𝖺 𝖽𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈.\n\n`;
  texto += `*𝖤𝗃𝖾𝗆𝗉𝗅𝗈 :* \n`;
  texto += "`𝖶𝖾𝗅𝖼𝗈𝗆𝖾 𝗈𝗇`\ ✅\n";
  texto += "`𝖶𝖾𝗅𝖼𝗈𝗆𝖾 𝗈𝖿𝖿`\ ❌\n";

  texto += "┏━━[ *𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸𝙾𝙽 ⚙️* ]\n";
  opcionesMostrar.forEach(opcion => {
    const activo = estaActivo(opcion);
    texto += `┃» 𝖤𝗌𝗍𝖺𝖽𝗈 • ${activo ? "✅" : "❌"} ${opcion}\n`;
  });
  texto += "┗━━━━━━━━━━━━━━━≫";

  // Cargar el vCard decorativo
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "𝖤𝖲𝖳𝖠𝖣𝖮",
        jpegThumbnail: await (await fetch('https://iili.io/FkKn4cX.th.jpg')).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Unlimited;;;\n" +
          "FN:Unlimited\n" +
          "ORG:Unlimited\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Unlimited\n" +
          "X-WA-BIZ-DESCRIPTION:ofc\n" +
          "X-WA-BIZ-NAME:Unlimited\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  };

  await conn.sendMessage(chatId, { react: { text: "📊", key: msg.key } });
  await conn.sendMessage(chatId, { text: texto }, { quoted: fkontak });
};

handler.command = ["estado"];
handler.tags = ["info"];
handler.help = ["estado"];

module.exports = handler;