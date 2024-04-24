const { EmbedBuilder } = require("discord.js");
const translate = require("@iamtraction/google-translate");

module.exports = async (client, message) => {
  return;
  if (message.author.bot || !message.content.trim()) return;

  try {
    const res = await translate(message.content, { to: "en" });

    // If the language is English, do nothing
    if (res.from.language.iso === "en") return;

    // Translate the message to English
    const translation = res.text; // The translated text

    // Send the embed with the translation
    const embed = createTranslationEmbed(
      message,
      translation,
      res.from.language.iso
    );
    await message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error translating message:", error);
  }
};

function createTranslationEmbed(message, translatedText, originalLanguageCode) {
  return;
  const languageName = getLanguageName(originalLanguageCode);
  return new EmbedBuilder()
    .setColor(0x1d82b6)
    .setTitle("🌐 Message Translation")
    .setDescription(`\`\`\`${translatedText}\`\`\``)
    .setFooter({ text: `Translated from: ${languageName}` })
    .setTimestamp();
}

function getLanguageName(isoCode) {
  return;
  const languages = {
    // ISO 639-1 to language name mapping
    auto: "Automatic",
    af: "Afrikaans",
    sq: "Albanian",
    am: "Amharic",
    ar: "Arabic",
    hy: "Armenian",
    az: "Azerbaijani",
    eu: "Basque",
    be: "Belarusian",
    bn: "Bengali",
    bs: "Bosnian",
    bg: "Bulgarian",
    ca: "Catalan",
    ceb: "Cebuano",
    ny: "Chichewa",
    "zh-cn": "Chinese Simplified",
    "zh-tw": "Chinese Traditional",
    co: "Corsican",
    hr: "Croatian",
    cs: "Czech",
    da: "Danish",
    nl: "Dutch",
    en: "English",
    eo: "Esperanto",
    et: "Estonian",
    tl: "Filipino",
    fi: "Finnish",
    fr: "French",
    fy: "Frisian",
    gl: "Galician",
    ka: "Georgian",
    de: "German",
    el: "Greek",
    gu: "Gujarati",
    ht: "Haitian Creole",
    ha: "Hausa",
    haw: "Hawaiian",
    iw: "Hebrew",
    hi: "Hindi",
    hmn: "Hmong",
    hu: "Hungarian",
    is: "Icelandic",
    ig: "Igbo",
    id: "Indonesian",
    ga: "Irish",
    it: "Italian",
    ja: "Japanese",
    jw: "Javanese",
    kn: "Kannada",
    kk: "Kazakh",
    km: "Khmer",
    ko: "Korean",
    ku: "Kurdish (Kurmanji)",
    ky: "Kyrgyz",
    lo: "Lao",
    la: "Latin",
    lv: "Latvian",
    lt: "Lithuanian",
    lb: "Luxembourgish",
    mk: "Macedonian",
    mg: "Malagasy",
    ms: "Malay",
    ml: "Malayalam",
    mt: "Maltese",
    mi: "Maori",
    mr: "Marathi",
    mn: "Mongolian",
    my: "Myanmar (Burmese)",
    ne: "Nepali",
    no: "Norwegian",
    ps: "Pashto",
    fa: "Persian",
    pl: "Polish",
    pt: "Portuguese",
    pa: "Punjabi",
    ro: "Romanian",
    ru: "Russian",
    sm: "Samoan",
    gd: "Scots Gaelic",
    sr: "Serbian",
    st: "Sesotho",
    sn: "Shona",
    sd: "Sindhi",
    si: "Sinhala",
    sk: "Slovak",
    sl: "Slovenian",
    so: "Somali",
    es: "Spanish",
    su: "Sundanese",
    sw: "Swahili",
    sv: "Swedish",
    tg: "Tajik",
    ta: "Tamil",
    te: "Telugu",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    ur: "Urdu",
    uz: "Uzbek",
    vi: "Vietnamese",
    cy: "Welsh",
    xh: "Xhosa",
    yi: "Yiddish",
    yo: "Yoruba",
    zu: "Zulu", // ... other ISO 639-1 codes and their corresponding language names
  };

  return languages[isoCode] || isoCode;
}
