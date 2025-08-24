// plugins/delwelcome.js
const fs = require("fs");
const path = require("path");

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

/** Normaliza: si un participante viene como @lid y tiene .jid (real), usa ese real */
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
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNo  = DIGITS(senderJid);
  const isFromMe  = !!msg.key.fromMe;

  if (!isGroup) {
    await conn.sendMessage(chatId, { text: "❌ Este comando solo se puede usar en grupos." }, { quoted: msg });
    return;
  }

  // Permisos: admin/owner/bot
  const isAdmin = await isAdminByNumber(conn, chatId, senderNo);

  // Owners (owner.json o global.owner)
  const ownerPath = path.resolve("owner.json");
  const owners = fs.existsSync(ownerPath)
    ? JSON.parse(fs.readFileSync(ownerPath, "utf-8"))
    : (global.owner || []);
  const isOwner = Array.isArray(owners) && owners.some(([id]) => id === senderNo);

  if (!isAdmin && !isOwner && !isFromMe) {
    await conn.sendMessage(chatId, { text: "🚫 Solo los administradores u owners pueden borrar la bienvenida personalizada." }, { quoted: msg });
    return;
  }

  // Borra la bienvenida del JSON
  const filePath = path.resolve("setwelcome.json");
  if (!fs.existsSync(filePath)) {
    await conn.sendMessage(chatId, { text: "⚠️ No hay mensaje de bienvenida personalizado para borrar." }, { quoted: msg });
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data[chatId] || !data[chatId].bienvenida) {
    await conn.sendMessage(chatId, { text: "⚠️ No hay mensaje de bienvenida personalizado para borrar." }, { quoted: msg });
    return;
  }

  delete data[chatId].bienvenida;

  // Si no quedan más configuraciones en el chat, elimina la clave del chat
  if (Object.keys(data[chatId]).length === 0) delete data[chatId];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, { text: "✅ Mensaje de bienvenida personalizado borrado. Ahora se usará la plantilla predeterminada." }, { quoted: msg });
  await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } }).catch(() => {});
};

handler.command = ["delwelcome", "deletewelcome"];
module.exports = handler;