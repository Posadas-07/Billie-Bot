const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  try {
    if (!chatId.endsWith("@g.us")) {
      return conn.sendMessage(chatId, {
        text: "❌ *Este comando solo funciona en grupos.*"
      }, { quoted: msg });
    }

    if (!text) {
      return conn.sendMessage(chatId, {
        text: "⚠️ *Debes indicar una categoría para el top.*\nEjemplo: *.top gay*"
      }, { quoted: msg });
    }

    await conn.sendMessage(chatId, {
      react: { text: "🏆", key: msg.key }
    });

    const metadata = await conn.groupMetadata(chatId);
    let participants = metadata.participants.map(p => p.id);

    if (participants.length < 2) {
      return conn.sendMessage(chatId, {
        text: "⚠️ *Se necesitan al menos 2 personas en el grupo para generar un top.*"
      }, { quoted: msg });
    }

    // Mezclar aleatoriamente y tomar hasta 10 participantes
    participants = participants.sort(() => Math.random() - 0.5);
    const topUsers = participants.slice(0, Math.min(10, participants.length));

    // Selección de emojis según categoría
    let emojis = ["💖", "🔥", "🏆", "🌟", "✨"];
    if (text.toLowerCase().includes("gay")) emojis = ["🏳️‍🌈", "🌈", "💖", "💞", "🏆"];
    else if (text.toLowerCase().includes("feos")) emojis = ["💀", "🤡", "🙈", "😅", "💔"];
    else if (text.toLowerCase().includes("gates")) emojis = ["💰", "👓", "🏆", "💼", "✨"];

    const emojiHeader = emojis.sort(() => 0.5 - Math.random()).slice(0, 2).join("");

    // Nuevo diseño de caja 🎨
    let mensaje = `╔══✪〘 𝗧𝗢𝗣 "${text}" ${emojiHeader} 〙✪══╗\n`;
    topUsers.forEach((user, i) => {
      mensaje += `║ ${i + 1}. @${user.split("@")[0]}\n`;
    });
    mensaje += `╚═══════════════════════╝\n\n> \`\`\`📊 Estudio 100% verificado por la NASA\`\`\``;

    await conn.sendMessage(chatId, {
      text: mensaje,
      mentions: topUsers
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en .top:", err);
    await conn.sendMessage(chatId, {
      text: "❌ *Ocurrió un error al generar el top.*"
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
  }
};

handler.command = ["top"];
module.exports = handler;