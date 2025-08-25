const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;

  const frasesOwner = [
    '🛡️ *Protección Suprema Activada*\n@{user} es el alfa, el omega y el padre del comando. Intocable.',
    '👑 *Error de Sistema*\nIntentaste escanear al Creador. Abortando misión.',
    '🚫 Este usuario tiene inmunidad total ante el gayómetro.\nNo se toca al jefe.',
    '🔒 Modo Dios activado para @{user}. Mejor no intentes otra vez.',
    '⚠️ Escanear al Owner está prohibido por ley universal. Respeta jerarquías.'
  ];

  const stickersOwner = [
    'https://cdn.russellxz.click/9087aa1c.webp',
    'https://cdn.russellxz.click/85a16aa5.webp',
    'https://cdn.russellxz.click/270edf17.webp',
    'https://cdn.russellxz.click/afd908e6.webp'
  ];

  const audioURL = 'https://cdn.russellxz.click/96beb11b.mp3';

  let mentionedJid;
  try {
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message?.contextInfo?.mentionedJid?.length) {
      mentionedJid = msg.message.contextInfo.mentionedJid[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      mentionedJid = msg.message.extendedTextMessage.contextInfo.participant;
    } else if (msg.message?.contextInfo?.participant) {
      mentionedJid = msg.message.contextInfo.participant;
    }
  } catch {
    mentionedJid = null;
  }

  if (!mentionedJid) {
    return await conn.sendMessage(chatId, {
      text: '🔍 *Etiqueta o responde a alguien para escanear su porcentaje gay.*',
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero);
    const sticker = stickersOwner[Math.floor(Math.random() * stickersOwner.length)];

    await conn.sendMessage(chatId, {
      text: frase,
      mentions: [mentionedJid]
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      sticker: { url: sticker }
    }, { quoted: msg });

    return;
  }

  const porcentaje = Math.floor(Math.random() * 101);

  const frasesFinales = [
    '𐀔 Lo tuyo, lo tuyo es que eres gay.',
    '𐀔 Y eso no lo arregla ni rezando.',
    '𐀔 Ya ni el closet te quiere dentro.',
    '𐀔 No lo niegues, se te nota desde el saludo.',
    '𐀔 Eres más gay que el filtro de corazones.',
    '𐀔 Confirmado por la NASA y tu ex.',
    '𐀔 Te escaneamos... y explotó el gayómetro.',
    '𐀔 Modo diva activado sin retorno.',
    '𐀔 Si fueras más gay, serías una bandera con patas.',
    '𐀔 Esto ya no es sospecha, es evidencia científica.',
    // Puedes agregar más frases aquí para mayor variedad
  ];

  const frasesCierre = [
    '➢ 𝑳𝒐𝒔 𝒔𝒊𝒆𝒏𝒕𝒊𝒇𝒊𝒄𝒐𝒔 𝒍𝒐 𝒄𝒐𝒏𝒇𝒊𝒓𝒎𝒂𝒏.',
    '➢ 𝑬𝒍 𝒖𝒏𝒊𝒗𝒆𝒓𝒔𝒐 𝒏𝒐 𝒔𝒆 𝒆𝒒𝒖𝒊𝒗𝒐𝒄𝒂.',
    '➢ 𝑫𝒂𝒕𝒐𝒔 𝒗𝒆𝒓𝒊𝒇𝒊𝒄𝒂𝒅𝒐𝒔 𝒑𝒐𝒓 𝒍𝒂 𝒄𝒐𝒎𝒖𝒏𝒊𝒅𝒂𝒅.',
    '➢ 𝑬𝒔𝒕𝒐 𝒆𝒔 𝒄𝒊𝒆𝒏𝒄𝒊𝒂, 𝒏𝒐 𝒐𝒑𝒊𝒏𝒊𝒐́𝒏.',
    '➢ 𝑹𝒆𝒈𝒊𝒔𝒕𝒓𝒐 𝒐𝒇𝒊𝒄𝒊𝒂𝒍 𝒆𝒏 𝒆𝒍 𝒂𝒓𝒄𝒉𝒊𝒗𝒐 𝒅𝒆𝒍 𝒂𝒓𝒄𝒐𝒊𝒓𝒊𝒔.',
    // Puedes agregar más cierres aquí si quieres
  ];

  const remate = frasesFinales[Math.floor(Math.random() * frasesFinales.length)];
  const cierre = frasesCierre[Math.floor(Math.random() * frasesCierre.length)];

  const resultado =
`💫 *ESCÁNER GAY*

*🔥 𝙻𝙾𝚂 𝙲𝙰́𝙻𝙲𝚄𝙻𝙾𝚂 𝙷𝙰𝙽 𝙰𝚁𝙾𝙹𝙰𝙳𝙾 𝚀𝚄𝙴* @${numero} *𝙴𝚂 ${porcentaje}%* *𝙶𝙰𝚈 🏳️‍🌈*
> ${remate}

${cierre}`;

  await conn.sendMessage(chatId, {
    text: resultado,
    mentions: [mentionedJid]
  }, { quoted: msg });

  if (audioURL) {
    await conn.sendMessage(chatId, {
      audio: { url: audioURL },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: msg });
  }
};

handler.command = ['gay'];
handler.tags = ['diversión'];
handler.help = ['gay @usuario o responde'];
handler.register = true;
handler.group = true;

module.exports = handler;