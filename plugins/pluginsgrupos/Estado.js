// plugins/estado.js
const fetch = require("node-fetch"); // npm i node-fetch@2
const { getConfig } = requireFromRoot("db");

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

const handler = async (msg, { conn }) => {
  const chatId    = msg.key.remoteJid;
  const isGroup   = chatId.endsWith("@g.us");
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNo  = DIGITS(senderJid);
  const isFromMe  = !!msg.key.fromMe;

  // Verifica owner
  let owners = [];
  try { owners = global.owner || []; } catch { owners = []; }
  const isOwner = Array.isArray(owners) && owners.some(([id]) => id === senderNo);

  // Verifica admin en grupos
  if (isGroup && !isOwner && !isFromMe) {
    try {
      const meta = await conn.groupMetadata(chatId);
      const participante = meta.participants.find(p => p.id === senderJid);
      const isAdmin = ["admin", "superadmin"].includes(participante?.admin);
      if (!isAdmin) {
        return conn.sendMessage(chatId, {
          text: "🚫 *Solo administradores, el owner o el bot pueden usar este comando.*"
        }, { quoted: msg });
      }
    } catch {
      return;
    }
  }

  // Leer configs del grupo desde DB
  const allConfigs = await getConfig(chatId) || {};
  const opcionesConfig = Object.keys(allConfigs);

  if (opcionesConfig.length === 0) {
    return conn.sendMessage(chatId, {
      text: "⚠️ No hay opciones configuradas en este grupo."
    }, { quoted: msg });
  }

  // Soporte: estado / estado on / estado off
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const args = body.trim().split(/\s+/);
  const filtro = (args[1] || "").toLowerCase();

  let opcionesMostrar = opcionesConfig;
  if (filtro === "on") {
    opcionesMostrar = opcionesConfig.filter(op => allConfigs[op]);
  } else if (filtro === "off") {
    opcionesMostrar = opcionesConfig.filter(op => !allConfigs[op]);
  }

  if (opcionesMostrar.length === 0) {
    return conn.sendMessage(chatId, {
      text: filtro === "on"
        ? "⚠️ No hay opciones activas en este grupo."
        : filtro === "off"
        ? "⚠️ No hay opciones desactivadas en este grupo."
        : "⚠️ Nada que mostrar."
    }, { quoted: msg });
  }

  // Construcción del texto
  let texto = `*⚙️ ESTADO DE CONFIGURACIÓN*\n`;
  texto += `> ✅ = activado\n> ❌ = desactivado\n\n`;
  texto += "┏━━[ *CONFIGURACIÓN ⚙️* ]\n";
  opcionesMostrar.forEach(opcion => {
    const activo = !!allConfigs[opcion];
    texto += `┃» ${activo ? "✅" : "❌"} ${opcion}\n`;
  });
  texto += "┗━━━━━━━━━━━━━━━≫";

  // vCard decorativo
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "estado"
    },
    message: {
      locationMessage: {
        name: "ESTADO",
        jpegThumbnail: await (await fetch("https://iili.io/FkKn4cX.th.jpg")).buffer(),
        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Estado;;;\nFN:Estado\nORG:Bot\nEND:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  };

  await conn.sendMessage(chatId, { react: { text: "📊", key: msg.key } });
  await conn.sendMessage(chatId, { text: texto }, { quoted: fkontak });
};

handler.command = ["estado"];
handler.tags = ["info"];
handler.help = ["estado", "estado on", "estado off"];

module.exports = handler;