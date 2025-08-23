const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { getConfig } = requireFromRoot("db");

// Cache global de admins por chat
const adminCache = {};
const DIGITS = (s = "") => String(s || "").replace(/\D/g, "");

function lidParser(participants = []) {
  try {
    return participants.map(v => ({
      id: (typeof v?.id === "string" && v.id.endsWith("@lid") && v.jid)
        ? v.jid
        : v.id,
      admin: v?.admin ?? null,
      raw: v
    }));
  } catch {
    return participants || [];
  }
}

function resolveRealFromMeta(meta, anyJid) {
  const out = { realJid: null, lidJid: null, number: null };
  const raw  = Array.isArray(meta?.participants) ? meta.participants : [];
  const norm = lidParser(raw);

  if (typeof anyJid === "string" && anyJid.endsWith("@s.whatsapp.net")) {
    out.realJid = anyJid;
    for (let i = 0; i < raw.length; i++) {
      if (norm[i]?.id === out.realJid && typeof raw[i]?.id === "string" && raw[i].id.endsWith("@lid")) {
        out.lidJid = raw[i].id;
        break;
      }
    }
  } else if (typeof anyJid === "string" && anyJid.endsWith("@lid")) {
    out.lidJid = anyJid;
    const idx = raw.findIndex(p => p?.id === anyJid);
    if (idx >= 0) {
      const w = raw[idx];
      if (typeof w?.jid === "string" && w.jid.endsWith("@s.whatsapp.net")) out.realJid = w.jid;
      else if (typeof norm[idx]?.id === "string" && norm[idx].id.endsWith("@s.whatsapp.net")) out.realJid = norm[idx].id;
    }
  }

  out.number = DIGITS(out.realJid || "");
  return out;
}

const handler = async (conn) => {
  conn.ev.on("group-participants.update", async (update) => {
    try {
      const chatId = update.id;
      const isGroup = chatId.endsWith("@g.us");
      if (!isGroup) return;

      // Cache inicial admins
      if (!adminCache[chatId]) {
        const oldMeta = await conn.groupMetadata(chatId);
        adminCache[chatId] = new Set(
          oldMeta.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id)
        );
      }

      const welcomeActive = await getConfig(chatId, "welcome");
      const byeActive = await getConfig(chatId, "despedidas");
      const antiArabe = await getConfig(chatId, "antiarabe");

      const setwelcomePath = path.resolve("setwelcome.json");
      const personalizados = fs.existsSync(setwelcomePath)
        ? JSON.parse(fs.readFileSync(setwelcomePath, "utf-8"))[chatId] || {}
        : {};

      const bienvenidaPersonalizada = personalizados?.bienvenida;
      const despedidaPersonalizada = personalizados?.despedida;

      const arabes = [
        "20","212","213","216","218","222","224","230","234","235","237","238","249",
        "250","251","252","253","254","255","257","258","260","263","269","960","961",
        "962","963","964","965","966","967","968","970","971","972","973","974","975",
        "976","980","981","992","994","995","998"
      ];

      const metadata = await conn.groupMetadata(chatId);

      // 🔒 SISTEMA DE PROTECCIÓN DE ADMINS
      const botId     = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const configPath = path.resolve('setwelcome.json');
      const data      = fs.existsSync(configPath)
        ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        : {};
      const whiteList = data.lista || [];
      data[chatId] = data[chatId] || {};
      data[chatId].blacklistAdmins = data[chatId].blacklistAdmins || {};
      const blacklist = data[chatId].blacklistAdmins;

      if (update.action === 'demote' && update.participants?.length) {
        const actor  = update.author;
        const target = update.participants[0];
        if (!whiteList.includes(actor) && actor && target && actor !== target && actor !== botId) {
          const now = Date.now();
          blacklist[actor] = now + 24 * 60 * 60 * 1000;
          fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
          await conn.groupParticipantsUpdate(chatId, [actor], 'demote').catch(() => {});
          await conn.sendMessage(chatId, {
            text: `
🚨 *VIOLACIÓN DE POLÍTICA DE ADMINISTRACIÓN*
⚠️ El admin @${actor.split('@')[0]} quitó permisos de admin a @${target.split('@')[0]}.
🕒 Su rol ha sido revocado por *24 horas*.
🔰 Usa *\/addlista @usuario* para eximir.
🧯 Usa *\/restpro @${actor.split('@')[0]}* para restaurar.
`.trim(),
            mentions: [actor, target]
          });
        }
      }

      if (update.action === 'remove' && update.participants?.length) {
        const actor  = update.author;
        const target = update.participants[0];
        if (!whiteList.includes(actor) && actor && target && actor !== target && actor !== botId) {
          const oldAdmins = adminCache[chatId] || new Set();
          if (oldAdmins.has(target)) {
            const now = Date.now();
            blacklist[actor] = now + 24 * 60 * 60 * 1000;
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
            await conn.groupParticipantsUpdate(chatId, [actor], 'demote').catch(() => {});
            await conn.sendMessage(chatId, {
              text: `
🚨 *ADMINISTRADOR EXPULSADO*
❌ El admin @${actor.split('@')[0]} eliminó a @${target.split('@')[0]} del grupo.
🕒 Su rol ha sido revocado por *24 horas*.
🔰 Usa *\/addlista @usuario* para eximir.
`.trim(),
              mentions: [actor, target]
            });
          }
        }
      }

      for (const id of update.participants || []) {
        const pInfo = metadata.participants.find(p => p.id === id);
        const isNowAdmin = pInfo?.admin === 'admin' || pInfo?.admin === 'superadmin';
        const until = blacklist[id];
        if (isNowAdmin && until && Date.now() < until && !whiteList.includes(id)) {
          await conn.groupParticipantsUpdate(chatId, [id], 'demote').catch(() => {});
          await conn.sendMessage(chatId, {
            text: `
🚫 @${id.split('@')[0]} está castigado.
⏳ No podrá ser admin hasta que pasen 24 horas.
🔰 Usa *\/addlista @${id.split('@')[0]}* para eximir.
`.trim(),
            mentions: [id]
          });
        }
      }

      if (update.action === "promote" && update.participants?.length) {
        const actor = update.author;
        const target = update.participants[0];
        if (actor && target) {
          const texto = `
╭──『 👑 *NUEVO ADMIN* 』─◆
│ 👤 Usuario: @${target.split("@")[0]}
│ ✅ Ascendido por: @${actor.split("@")[0]}
╰────────────────────◆`.trim();
          await conn.sendMessage(chatId, { text: texto, mentions: [actor, target] });
        }
      }

      // ===============================
      // 🔰 BIENVENIDA / DESPEDIDA CON EXTERNALADREPLY
      // ===============================

      const frasesWelcome = [
        "𝖣𝗂𝗌𝖿𝗋𝗎𝗍𝖺 𝗍𝗎 𝖾𝗌𝗍𝖺𝖽𝗂́𝖺. 𝖠𝗁𝗈𝗋𝖺 𝗌𝗈𝗆𝗈𝗌 {miembros} 𝗆𝗂𝖾𝗆𝖻𝗋𝗈𝗌.",
        "𝖫𝖾𝖾 𝗅𝖺𝗌 𝗋𝖾𝗀𝗅𝖺𝗌. 𝖫𝗎𝖾𝗀𝗈 𝗂𝗀𝗇𝗈́𝗋𝖺𝗅𝖺𝗌 𝖼𝗈𝗆𝗈 𝗍𝗈𝖽𝗈𝗌.",
        "𝖧𝖺𝗌 𝖾𝗇𝗍𝗋𝖺𝖽𝗈 𝖺𝗅 𝗀𝗋𝗎𝗉𝗈 𝗆𝖺́𝗌 𝗋𝖺𝗇𝖽𝗈𝗆 𝖽𝖾𝗅 𝗎𝗇𝗂𝗏𝖾𝗋𝗌𝗈.",
        "+𝟣 𝖺𝗅 𝗆𝖺𝗇𝗂𝖼𝗈𝗆𝗂𝗈. 𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈.",
        "𝖰𝗎𝖾 𝖾𝗆𝗉𝗂𝖾𝖼𝖾 𝖾𝗅 𝖼𝖺𝗈𝗌... ¡𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺𝗅 𝗀𝗋𝗎𝗉𝗈!"
      ];

      const frasesBye = [
        "𝖴𝗇 𝖺𝗅𝗆𝖺 𝗆𝖾𝗇𝗈𝗌. 𝖠𝗁𝗈𝗋𝖺 𝗊𝗎𝖾𝖽𝖺𝗆𝗈𝗌 {miembros}.",
        "𝖭𝗈𝗌 𝖺𝖻𝖺𝗇𝖽𝗈𝗇𝖺 𝗈𝗍𝗋𝗈 𝗌𝗈𝗅𝖽𝖺𝗱𝗈 𝖼𝖺í𝖽𝗈.",
        "𝖲𝖾 𝖿𝗎𝖾... 𝗇𝗂 𝗇𝗈𝗍𝖺𝗆𝗈𝗌 𝗊𝗎𝖾 𝖾𝗌𝗍𝖺𝖻𝖺."
      ];

      async function generarImagenSimple(profilePicUrl, esDespedida, fondoPersonalizado, textoExtra = '') {
        const canvas = createCanvas(750, 440);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(fondoPersonalizado);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        try {
          const pfp = await loadImage(profilePicUrl);
          const centerX = 360;
          const avatarSize = 200;
          const borderSize = 10;
          const totalSize = avatarSize + borderSize * 2;
          const avatarY = 85;

          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, avatarY + totalSize / 2, totalSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, avatarY + totalSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(pfp, centerX - avatarSize / 2, avatarY + borderSize, avatarSize, avatarSize);
          ctx.restore();
        } catch {}

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(esDespedida ? '𝗛𝗔𝗦𝗧𝗔 𝗣𝗥𝗢𝗡𝗧𝗢' : '¡𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢!', 365, 360);

        if (textoExtra) {
          ctx.fillStyle = '#D3D3D3';
          ctx.font = '24px Sans-serif';
          ctx.fillText(textoExtra, 360, 400);
        }

        return canvas.toBuffer();
      }

      for (const participant of update.participants) {
        const { realJid, number } = resolveRealFromMeta(metadata, participant);
        const mentionId = realJid || participant;
        const mention = `@${number || participant.split("@")[0]}`;

        let perfilURL = "https://cdn.russellxz.click/61198e23.jpeg";
        try { perfilURL = await conn.profilePictureUrl(participant, "image"); } catch {}

        const totalMiembros = metadata.participants.length;
        const nombreGrupo = metadata.subject || "Grupo";

        // 🚫 Anti árabe check
        const isArabic = (antiArabe == 1) && number && arabes.some(cc => number.startsWith(cc));
        if (update.action === "add" && isArabic) {
          const info = metadata.participants.find(p => p.id === participant);
          const isAdmin = info?.admin === "admin" || info?.admin === "superadmin";
          const isOwner = global.isOwner && (global.isOwner(number) || global.isOwner(mentionId));
          if (!isAdmin && !isOwner) {
            await conn.sendMessage(chatId, {
              text: `🚫 ${mention} tiene un prefijo prohibido y será eliminado.`,
              mentions: [mentionId]
            });
            try { await conn.groupParticipantsUpdate(chatId, [participant], "remove"); } catch {}
            continue;
          }
        }

        // ✅ Bienvenida
        if (update.action === "add" && welcomeActive == 1) {
          const fondoBienvenida = 'https://cdn.russellxz.click/d617bf4c.jpeg';
          const frase = frasesWelcome[Math.floor(Math.random() * frasesWelcome.length)];
          const textoExtra = frase.replace(/{miembros}/gi, totalMiembros);
          const imgBuffer = await generarImagenSimple(perfilURL, false, fondoBienvenida, textoExtra);

          const textoFinal = bienvenidaPersonalizada
            ? bienvenidaPersonalizada.replace(/@user|{usuario}/gi, mention).replace(/{grupo}/gi, nombreGrupo)
            : `*ゲ◜༅៹ 𝖡𝖨𝖤𝖭𝖵𝖤𝖭𝖨𝖣𝖮 :* ${mention}\n*ゲ◜༅៹ 𝖦𝖱𝖴𝖯𝖮 :* ${nombreGrupo}`;

          await conn.sendMessage(chatId, {
            image: imgBuffer,
            caption: textoFinal,
            mentions: [mentionId],
            contextInfo: {
              externalAdReply: {
                title: "Bienvenida",
                body: nombreGrupo,
                sourceUrl: "https://github.com/",
                thumbnailUrl: perfilURL
              }
            }
          });
        }

        // ❌ Despedida
        if (update.action === "remove" && byeActive == 1) {
          const fondoDespedida = 'https://cdn.russellxz.click/06f6b67b.jpeg';
          const frase = frasesBye[Math.floor(Math.random() * frasesBye.length)];
          const textoExtra = frase.replace(/{miembros}/gi, totalMiembros);
          const imgBuffer = await generarImagenSimple(perfilURL, true, fondoDespedida, textoExtra);

          const textoFinal = despedidaPersonalizada
            ? despedidaPersonalizada.replace(/@user|{usuario}/gi, mention).replace(/{grupo}/gi, nombreGrupo)
            : `*ゲ◜༅៹ 𝖲𝖤 𝖥𝖴𝖤 :* ${mention}\n*ゲ◜༅៹ 𝖦𝖱𝖴𝖯𝖮 :* ${nombreGrupo}`;

          await conn.sendMessage(chatId, {
            image: imgBuffer,
            caption: textoFinal,
            mentions: [mentionId],
            contextInfo: {
              externalAdReply: {
                title: "Despedida",
                body: nombreGrupo,
                sourceUrl: "https://github.com/",
                thumbnailUrl: perfilURL
              }
            }
          });
        }
      }

      // actualizar cache admins
      const newMeta = await conn.groupMetadata(chatId);
      adminCache[chatId] = new Set(
        newMeta.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id)
      );

    } catch (err) {
      console.error("❌ Error en lógica de grupo:", err);
    }
  });
};

handler.run = handler;
module.exports = handler;