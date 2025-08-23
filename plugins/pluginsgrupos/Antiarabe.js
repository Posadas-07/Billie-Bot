// plugins/antiarabe.js
const fs = require("fs");
const path = require("path");
const { getConfig, setConfig, deleteConfig } = requireFromRoot("db");

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

/** Si un participante viene como @lid y tiene .jid (real), usa ese real */
function lidParser(participants = []) {
  try {
    return participants.map(v => ({
      id: (typeof v?.id === "string" && v.id.endsWith("@lid") && v.jid) ? v.jid : v.id,
      admin: v?.admin ?? null,
      raw: v
    }));
  } catch {
    return participants || [];
  }
}

/** Verifica admin por NÚMERO (funciona en LID y no-LID) */
async function isAdminByNumber(conn, chatId, number) {
  try {
    const meta = await conn.groupMetadata(chatId);
    const raw  = Array.isArray(meta?.participants) ? meta.participants : [];
    const norm = lidParser(raw);

    const adminNums = new Set();
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i], n = norm[i];
      const flag = (r?.admin === "admin" || r?.admin === "superadmin" ||
                    n?.admin === "admin" || n?.admin === "superadmin");
      if (flag) {
        [r?.id, r?.jid, n?.id].forEach(x => {
          const d = DIGITS(x || "");
          if (d) adminNums.add(d);
        });
      }
    }
    return adminNums.has(number);
  } catch {
    return false;
  }
}

const handler = async (msg, { conn }) => {
  const chatId    = msg.key.remoteJid;
  const isGroup   = chatId.endsWith("@g.us");
  const senderJid = msg.key.participant || msg.key.remoteJid; // puede ser @lid
  const senderNo  = DIGITS(senderJid);
  const isFromMe  = !!msg.key.fromMe;

  if (!isGroup) {
    await conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg });
    return;
  }

  await conn.sendMessage(chatId, { react: { text: "🛡️", key: msg.key } }).catch(() => {});

  // Permisos: admin / owner / bot
  const isAdmin = await isAdminByNumber(conn, chatId, senderNo);

  let owners = [];
  try { owners = JSON.parse(fs.readFileSync(path.resolve("owner.json"), "utf-8")); }
  catch { owners = global.owner || []; }
  const isOwner = Array.isArray(owners) && owners.some(([id]) => id === senderNo);

  if (!isAdmin && !isOwner && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: "🚫 Solo los administradores pueden activar o desactivar el antiárabe."
    }, { quoted: msg });
    return;
  }

  // on/off desde el cuerpo del mensaje
  const body   = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const estado = (body.trim().split(/\s+/)[1] || "").toLowerCase();

  if (!["on", "off"].includes(estado)) {
    await conn.sendMessage(chatId, { text: "✳️ Usa:\n\n.antiarabe on / off" }, { quoted: msg });
    return;
  }

  if (estado === "on") {
    await setConfig(chatId, "antiarabe", 1);
  } else {
    await deleteConfig(chatId, "antiarabe");
  }

  // fkontak Cholito-xyz (solo para el mensaje de confirmación al activar/desactivar)
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      productMessage: {
        product: {
          productImage: {
            mimetype: "image/jpeg",
            jpegThumbnail: await (await fetch("https://iili.io/FCJSFix.jpg")).buffer()
          },
          title: "𝖠𝖭𝖳𝖨 𝖠𝖱𝖠𝖡𝖤𝖲",
          description: ""
        },
        businessOwnerJid: "19709001746@s.whatsapp.net"
      }
    },
    participant: "0@s.whatsapp.net"
  };

  // Diseño solicitado
  const titulo = "「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」";
  const estadoTxt = estado === "on" ? "𝖠𝖼𝗍𝖾𝖺𝖽𝗈" : "𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈"; // fuente estilo
  const cuerpo =
`${titulo}

*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈:* 𝖠𝗇𝗍𝗂𝖺𝗋𝖺𝖻𝖾
*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈:* ${estado === "on" ? "𝖠𝖼𝗍𝗂𝗏𝖺𝖽𝗈" : "𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈"}
*│┊➺ 𝖯𝖺𝗋𝖺́:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* 𝖱𝖾𝗌𝗍𝗋𝗂𝗇𝗀𝖾 𝗇𝗎́𝗆𝖾𝗋𝗈 𝖺𝗋𝖺𝖻𝖾 𝖾𝗇 𝖾𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`;

  await conn.sendMessage(chatId, { text: cuerpo }, { quoted: fkontak });

  await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } }).catch(() => {});
  console.log(`🛡️ AntiÁrabe ${estado.toUpperCase()} guardado en activos.db para ${chatId}`);
};

handler.command = ["antiarabe"];
module.exports = handler;