const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const textRaw = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ''
  ).trim();

  const match = textRaw.match(/^[!./#]?\s*([a-zA-Z]+)/);
  const comando = match ? match[1].toLowerCase() : null;

  const comandosValidos = [
    'puta', 'puto', 'peruano', 'peruana',
    'negro', 'negra', 'manca', 'manco',
    'fea', 'feo', 'enano', 'enana',
    'cachudo', 'cachuda', 'pajero', 'pajera',
    'rata', 'adoptado', 'adoptada'
  ];

  if (!comando || !comandosValidos.includes(comando)) return;

  let mentionedJid = null;
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
      text: `❗ *Uso incorrecto del comando.*\n\nDebes *etiquetar* a alguien o *responder su mensaje* para escanear.\n\n*Ejemplos válidos:*\n> .${comando} @usuario\n> .${comando} (respondiendo al mensaje de alguien)`,
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  const frasesOwner = [
    '🛡️ *Defensas activadas*\n@{user} no puede ser escaneado. Nivel: Dios supremo.',
    '👑 *Acceso denegado*\nIntentaste medir al Creador. Fallo crítico del sistema.',
    '🚫 Usuario intocable detectado.\n@{user} está fuera del alcance del escáner.',
    '🔒 Seguridad legendaria activa. @{user} está en modo inmortal.',
    '⚠️ El universo impide escanear al Owner.\nNi lo intentes otra vez.'
  ];

  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero);
    return await conn.sendMessage(chatId, {
      text: frase,
      mentions: [mentionedJid]
    }, { quoted: msg });
  }

  const frasesPorComando = {
    puta: ['𐀔 Naciste para cobrar sin amor.', '𐀔 Ni en la esquina perdonas.', '𐀔 Tu vida es un Only sin cuenta.', '𐀔 El suelo te extraña cuando no estás encima.'],
    puto: ['𐀔 Te sientas más que los muebles del INSS.', '𐀔 No te respetan ni en el FIFA.', '𐀔 Eres leyenda urbana en la zona roja.', '𐀔 Te tiembla hasta el WiFi de tantos bajones.'],
    peruano: ['𐀔 Tu conexión es más inestable que tu economía.', '𐀔 Si fueras internet, serías Bitel.', '𐀔 Cada vez que hablas, un ceviche llora.', '𐀔 Ni Machu Picchu te reconoce como local.'],
    peruana: ['𐀔 Tus audios deberían ir a patrimonio cultural.', '𐀔 Cada sticker tuyo vale un sol.', '𐀔 Eres el motivo de cada bug en el grupo.', '𐀔 Tu voz activa terremotos.'],
    negro: ['𐀔 Eres más oscuro que mis ganas de vivir.', '𐀔 Ni la linterna del bot te encuentra.', '𐀔 Te camuflas en la sombra de la sombra.', '𐀔 Apareces en fotos con filtro negativo.'],
    negra: ['𐀔 Apagas focos con solo pasar cerca.', '𐀔 Tu silueta asusta hasta en modo día.', '𐀔 El eclipse te pidió que te apartaras.', '𐀔 Brillas por tu opacidad.'],
    manca: ['𐀔 Fallas más que mi ex en fidelidad.', '𐀔 No le das ni a una piñata amarrada.', '𐀔 Tu KD es un insulto a la puntería.', '𐀔 Disparas dudas, no balas.'],
    manco: ['𐀔 Eres la razón por la que existen los bots.', '𐀔 Tus manos deberían venir con parche.', '𐀔 Te matan antes de cargar la partida.', '𐀔 Tu precisión ofende a los ciegos.'],
    fea: ['𐀔 El espejo te evita.', '𐀔 Fuiste rechazada hasta por el filtro de belleza.', '𐀔 Eres el motivo por el que existe el modo oscuro.', '𐀔 Tu cara rompe más que los estados del bot.'],
    feo: ['𐀔 Cuando naciste, el doctor se disculpó.', '𐀔 Eres el susto antes de dormir.', '𐀔 Ni el WiFi te quiere conectar.', '𐀔 Fuiste borrado del diccionario de estética.'],
    enana: ['𐀔 Necesitas escalera hasta para los audios largos.', '𐀔 En el VS ni te ven llegar.', '𐀔 Te confunden con un sticker.', '𐀔 Eres mini pero molesta en tamaño real.'],
    enano: ['𐀔 Saltas y aún así no das miedo.', '𐀔 Eres la versión demo de un jugador.', '𐀔 Te cargan más que a una laptop vieja.', '𐀔 Si fueras más bajo, serías emoji.'],
    cachudo: ['𐀔 Tu frente ya no cabe en las selfies.', '𐀔 Eres el rey del cornómetro.', '𐀔 Te engañan hasta en los sueños.', '𐀔 La infidelidad te sigue como la sombra.'],
    cachuda: ['𐀔 Tu pareja tiene más vueltas que un trompo.', '𐀔 Te ponen los cuernos hasta en Roblox.', '𐀔 Ni tu suegra lo oculta ya.', '𐀔 El grupo entero lo sabía menos tú.'],
    pajero: ['𐀔 Tus datos se gastan en soledad.', '𐀔 Eres el MVP del incognito.', '𐀔 Ya saludas con la mano izquierda.', '𐀔 Tu historial da miedo al FBI.'],
    pajera: ['𐀔 Tu vibrador necesita vacaciones.', '𐀔 Netflix y tú misma.', '𐀔 Nadie te quiere, pero tú te amas.', '𐀔 Te sabes todos los scripts de Brazzers.'],
    rata: ['𐀔 No prestas ni los buenos días.', '𐀔 Te escondes cuando es tu turno de pagar.', '𐀔 Eres la causa de la inflación.', '𐀔 Más codo que luchador sin brazo.'],
    adoptado: ['𐀔 Eres el DLC de la familia.', '𐀔 Ni el perro te reconoce.', '𐀔 Llegaste sin tutorial.', '𐀔 Eres un parche emocional.'],
    adoptada: ['𐀔 Tus raíces son misterio nacional.', '𐀔 Fuiste agregada como sticker a la familia.', '𐀔 Ni la abuela te menciona en las fotos.', '𐀔 Tu existencia fue sorpresa para todos.']
  };

  const cierres = [
    '➢ 𝒱𝒶𝓁𝒾𝒹𝒶𝒸𝒾𝑜́𝓃 𝒸ℴ𝓈𝓂𝒾𝒸𝒶 𝓇ℯ𝒶𝓁𝒾𝓏𝒶𝒹𝒶.',
    '➢ 𝓓𝒂𝓽𝓸𝓈 𝒸𝓇𝓊𝓏𝒶𝒹ℴ𝓈 𝒸ℴ𝓃 𝓁𝒶 𝒟𝒾𝓋𝒾𝓃𝒾𝒹𝒶𝒹.',
    '➢ 𝓘𝓷𝓯𝓸𝓻𝓶𝓮 𝓪𝓾𝓽𝓮𝓷𝓽𝓲𝓬𝓪𝓭𝓸 𝓮𝓷 𝓁𝒶 𝓃𝒶𝓋𝑒 𝓂𝒶𝒹𝓇ℯ.',
    '➢ 𝓡𝒆𝓼𝓾𝓁𝓽𝒂𝓭𝓸 𝓯𝒊𝒋𝒐 𝒆𝒏 𝒍𝒐𝒔 𝒂𝒓𝒄𝒉𝒊𝒗𝒐𝒔 𝒆𝒕𝒆𝒓𝒏𝒐𝒔.',
    '➢ 𝓔𝓼𝓬𝓪𝓷𝓮𝓸 𝓬𝓸𝓷 𝓬𝓮𝓻𝓽𝓲𝓯𝓲𝓬𝓪𝓭𝓸 𝓭𝓲𝓿𝓲𝓷𝓸.'
  ];

  const remate = frasesPorComando[comando][Math.floor(Math.random() * frasesPorComando[comando].length)];
  const cierre = cierres[Math.floor(Math.random() * cierres.length)];
  const porcentaje = Math.floor(Math.random() * 101);

  const textoFinal = `💫 *ANÁLISIS COMPLETO DEL ESCÁNER*\n\n*📡 RESULTADO:* @${numero} *es* 『 ${porcentaje}% 』 ${comando.toUpperCase()} 🌐\n\n> ${remate}\n\n${cierre}`;

  await conn.sendMessage(chatId, {
    text: textoFinal,
    mentions: [mentionedJid]
  }, { quoted: msg });
};

handler.command = [
  'puta', 'puto', 'peruano', 'peruana',
  'negro', 'negra', 'manca', 'manco',
  'fea', 'feo', 'enano', 'enana',
  'cachudo', 'cachuda', 'pajero', 'pajera',
  'rata', 'adoptado', 'adoptada'
];

handler.tags = ['diversión'];
handler.help = handler.command.map(c => `${c} @usuario o responde`);
handler.group = true;
handler.register = true;

module.exports = handler;