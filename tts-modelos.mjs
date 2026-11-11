// Catálogo de TTS do projeto Reels @bascowave.
// Fonte de verdade para os scripts narrar*.mjs e para a skill tts-escolha.
// Uso: node tts-modelos.mjs [--list]

export const MODELOS = {
  elevenlabs: [
    {
      id: "eleven_v4",
      nome: "Eleven v4",
      custo: "pago (créditos)",
      preco: "varia por plano; free tier ~10k créditos/mês (~6-10 min)",
      gratuito: false,
      temporario: false,
      timestamps: "palavra (convertWithTimestamps)",
      idiomas: "70+; pt-BR excelente (voz Paulo)",
      qualidade: "alta, sotaque brasileiro estável com stability 0.7",
      nota: "Modelo fixo no narrar.mjs. Créditos pagos: sempre informar caracteres e esperar o sim.",
      refs: "https://elevenlabs.io/pricing",
    },
  ],
  fish: [
    {
      id: "s2.1-pro-free",
      nome: "S2.1 Pro Free",
      custo: "grátis (Fair Use)",
      preco: "$0",
      gratuito: true,
      temporario: "sim — free até 30/11/2026 (pode ser estendido com aviso)",
      timestamps: "segmento (start/end por trecho via stream/with-timestamp)",
      idiomas: "83",
      qualidade: "SOTA, ~90 ms TTFA, mesmo modelo da versão paga",
      nota: "Sem SLA, sem garantia de latência; dados podem ser usados para treino; uso comercial restrito para > $1M ARR.",
      refs: "https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits",
    },
    {
      id: "s2.1-pro",
      nome: "S2.1 Pro",
      custo: "pago",
      preco: "$15 / 1M UTF-8 bytes",
      gratuito: false,
      temporario: false,
      timestamps: "segmento",
      idiomas: "83",
      qualidade: "SOTA com SLA no plano pago",
      nota: "Use quando precisar de SLA, latência garantida e sem retenção de dados.",
      refs: "https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits",
    },
    {
      id: "s2-pro",
      nome: "S2 Pro",
      custo: "pago",
      preco: "$15 / 1M UTF-8 bytes",
      gratuito: false,
      temporario: false,
      timestamps: "segmento",
      idiomas: "83",
      qualidade: "geração anterior; S2.1 Pro venceu 61% em teste cego",
      nota: "Prefira s2.1-pro salvo compatibilidade específica.",
      refs: "https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits",
    },
    {
      id: "drama-3",
      nome: "Drama 3",
      custo: "pago",
      preco: "$50 / 1M UTF-8 bytes (promo $10/M até 30/11/2026)",
      gratuito: false,
      temporario: false,
      timestamps: "segmento",
      idiomas: "83",
      qualidade: "mais emotivo, para diálogo/dramatização",
      nota: "Caro; use só quando a emoção for o ponto central.",
      refs: "https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits",
    },
    {
      id: "s1",
      nome: "S1 (deprecado)",
      custo: "pago",
      preco: "$15 / 1M UTF-8 bytes",
      gratuito: false,
      temporario: false,
      timestamps: "segmento",
      idiomas: "13",
      qualidade: "legado",
      nota: "Será retirado em 31/12/2026; requests passam a ser servidos por s2.1-pro e cobrados como tal.",
      refs: "https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits",
    },
  ],
  gemini: [
    {
      id: "gemini-3.8-flash-tts",
      nome: "Gemini 3.8 Flash TTS",
      custo: "free tier AI Studio (limitado) ou pago no Cloud TTS",
      preco: "Cloud: $0,50/1M tokens de entrada + $9/1M tokens de áudio (até 31/12/2026; dobra em 2027)",
      gratuito: "limitado",
      temporario: "não — free tier permanente, mas restrito (3 RPM / 10k TPM / 10 RPD)",
      timestamps: "não — sem timestamps por palavra; o script aproxima por caracteres",
      idiomas: "130+",
      qualidade: "alta, expressivo (style + tags), multi-speaker (2 vozes), voice design",
      nota: "Cloud TTS não tem free tier para Gemini-TTS. Saída WAV 24 kHz mono.",
      refs: "https://aistudio.google.com/docs/speech-generation",
    },
    {
      id: "gemini-3.8-flash-lite-tts",
      nome: "Gemini 3.8 Flash-Lite TTS",
      custo: "free tier AI Studio (limitado) ou pago no Cloud TTS",
      preco: "Cloud: $0,50/1M entrada + $6/1M áudio (até 31/12/2026)",
      gratuito: "limitado",
      temporario: "não — free tier permanente, mas restrito",
      timestamps: "não",
      idiomas: "100+",
      qualidade: "rápido e barato; bom para volume",
      nota: "Substituto recomendado do 3.1 flash-tts-preview.",
      refs: "https://aistudio.google.com/docs/models/gemini-3.8-flash-lite-tts",
    },
    {
      id: "gemini-3.1-flash-tts-preview",
      nome: "Gemini 3.1 Flash TTS (Preview)",
      custo: "pago no Cloud TTS",
      preco: "$1/1M entrada + $20/1M áudio",
      gratuito: false,
      temporario: false,
      timestamps: "não",
      idiomas: "100+",
      qualidade: "geração anterior",
      nota: "Migrar para gemini-3.8-flash-lite-tts.",
      refs: "https://cloud.google.com/text-to-speech/pricing",
    },
    {
      id: "gemini-2.5-pro-preview-tts",
      nome: "Gemini 2.5 Pro Preview TTS",
      custo: "pago",
      preco: "$1/1M entrada + $20/1M áudio",
      gratuito: false,
      temporario: false,
      timestamps: "não",
      idiomas: "24+",
      qualidade: "legado",
      nota: "Só por compatibilidade.",
      refs: "https://cloud.google.com/text-to-speech/pricing",
    },
  ],
};

// Vozes do Gemini 3.8 TTS.
// As 30 prebuilt são en-US: falam português, mas podem carregar sotaque.
// Para sotaque brasileiro nativo use as pt-br-* (Voice Library).
export const VOZES_GEMINI = [
  { id: "Zephyr", estilo: "Bright", descricao: "Brilhante e leve, tom jovem e claro.", uso: "abertura animada, apresentação" },
  { id: "Puck", estilo: "Upbeat", descricao: "Alegre e enérgica, ritmo para cima.", uso: "gancho, promoção, CTA" },
  { id: "Charon", estilo: "Informative", descricao: "Informativa e estável, tom baixo.", uso: "explicativo técnico, documentário" },
  { id: "Kore", estilo: "Firm", descricao: "Firme e direta, presença de narração.", uso: "narração principal (padrão do script)" },
  { id: "Fenrir", estilo: "Excitable", descricao: "Empolgada e intensa.", uso: "gancho agressivo, anúncio" },
  { id: "Leda", estilo: "Youthful", descricao: "Jovem e leve.", uso: "público jovem, redes sociais" },
  { id: "Orus", estilo: "Firm", descricao: "Firme e confiante.", uso: "narração confiante, institucional" },
  { id: "Aoede", estilo: "Breezy", genero: "feminina", descricao: "Leve e descontraída, pitch médio.", uso: "lifestyle, vlog" },
  { id: "Callirrhoe", estilo: "Easy-going", genero: "feminina", descricao: "Relaxada e casual.", uso: "conversa amigável, tutorial leve" },
  { id: "Autonoe", estilo: "Bright", genero: "feminina", descricao: "Brilhante, positiva e entusiasmada.", uso: "promoções, novidades de produto" },
  { id: "Enceladus", estilo: "Breathy", descricao: "Sussurrada e íntima.", uso: "suspense, segredo, revelação" },
  { id: "Iapetus", estilo: "Clear", descricao: "Clara e nítida.", uso: "pronúncia técnica, termos difíceis" },
  { id: "Umbriel", estilo: "Easy-going", descricao: "Neutra e tranquila.", uso: "narração neutra, longa duração" },
  { id: "Algieba", estilo: "Smooth", genero: "masculina", descricao: "Suave e polida, pitch baixo.", uso: "corporativo, explainer refinado" },
  { id: "Despina", estilo: "Smooth", genero: "feminina", descricao: "Suave e madura, pitch médio.", uso: "anúncio de marketing, e-learning" },
  { id: "Erinome", estilo: "Clear", descricao: "Clara e direta.", uso: "didático, passo a passo" },
  { id: "Algenib", estilo: "Gravelly", genero: "masculina", descricao: "Grave, áspera e impactante.", uso: "narração dramática, autoridade" },
  { id: "Rasalgethi", estilo: "Informative", descricao: "Informativa e calma.", uso: "notícia, análise" },
  { id: "Laomedeia", estilo: "Upbeat", descricao: "Animada e para cima.", uso: "promoção, CTA" },
  { id: "Achernar", estilo: "Soft", genero: "feminina", descricao: "Suave e acolhedora, pitch alto.", uso: "storytelling pessoal, fechamento" },
  { id: "Alnilam", estilo: "Firm", genero: "masculina", descricao: "Firme, direta e comandante.", uso: "instruções autoritativas, anúncios" },
  { id: "Schedar", estilo: "Even", descricao: "Uniforme e equilibrada.", uso: "narração longa, sem cansar" },
  { id: "Gacrux", estilo: "Mature", descricao: "Madura e experiente.", uso: "autoridade, conselho" },
  { id: "Pulcherrima", estilo: "Forward", descricao: "Projetada para frente.", uso: "chamada para ação, abertura" },
  { id: "Achird", estilo: "Friendly", genero: "masculina", descricao: "Amigável e acolhedora.", uso: "walkthrough casual, vlog" },
  { id: "Zubenelgenubi", estilo: "Casual", descricao: "Casual e descontraída.", uso: "conversa, bastidores" },
  { id: "Vindemiatrix", estilo: "Gentle", descricao: "Gentil e delicada.", uso: "temas sensíveis, fechamento" },
  { id: "Sadachbia", estilo: "Lively", descricao: "Viva e animada.", uso: "dinamismo, listas rápidas" },
  { id: "Sadaltager", estilo: "Knowledgeable", descricao: "Conhecedora, professoral.", uso: "aula, expert, explicação" },
  { id: "Sulafat", estilo: "Warm", descricao: "Calorosa e envolvente.", uso: "conexão emocional, encerramento" },
];

// Vozes nativas pt-BR da Voice Library do Gemini (rotuladas pela API com persona/tom).
export const VOZES_GEMINI_PT = [
  { id: "pt-br-advisor-3", genero: "feminina", idade: 45, descricao: "Confiante e clara; presença de narração profissional.", uso: "narração principal, explicações" },
  { id: "pt-br-advisor-5", genero: "feminina", idade: 48, descricao: "Confiante e clara, contexto de podcast.", uso: "educativo, conversa com o público" },
  { id: "pt-br-advisor-8", genero: "feminina", idade: 43, descricao: "Confiante e clara, contexto corporativo.", uso: "institucional, apresentação" },
  { id: "pt-br-advisor-1", genero: "feminina", idade: 41, descricao: "Calorosa e envolvente.", uso: "acolhedor, storytelling" },
  { id: "pt-br-advisor-7", genero: "feminina", idade: 30, descricao: "Calorosa e envolvente, jovem.", uso: "social media, gancho" },
  { id: "pt-br-advisor-12", genero: "feminina", idade: 31, descricao: "Calorosa e envolvente, tom criativo.", uso: "criativo, narrativa" },
  { id: "pt-br-advisor-9", genero: "masculina", idade: 45, descricao: "Objetiva, direta e útil.", uso: "tutorial, passo a passo" },
  { id: "pt-br-advisor-4", genero: "masculina", idade: 49, descricao: "Papo reto e curioso.", uso: "podcast, entrevista" },
  { id: "pt-br-advisor-11", genero: "masculina", idade: 39, descricao: "Descontraída, encorajadora e tranquila.", uso: "casual, dica rápida" },
  { id: "pt-br-advisor-6", genero: "masculina", idade: 48, descricao: "Cristalina e animada.", uso: "anúncio energético, promoção" },
  { id: "pt-br-advisor-2", genero: "masculina", idade: 34, descricao: "Relaxada e leve.", uso: "conversa leve, bastidores" },
  { id: "pt-br-advisor-10", genero: "masculina", idade: 35, descricao: "Acolhedora, transmite calma.", uso: "empático, tema sensível" },
  { id: "pt-br-assistant-11", genero: "masculina", idade: 33, descricao: "Grave, aveludada e sem pressa.", uso: "narração grave, suspense" },
  { id: "pt-br-assistant-5", genero: "feminina", idade: 31, descricao: "Clara, pitch médio e amigável.", uso: "explicação clara, educação" },
  { id: "pt-br-assistant-12", genero: "feminina", idade: 44, descricao: "Objetiva, direta e útil.", uso: "didático, instruções" },
];

// Vozes pública pt-BR do Fish Audio (narração). IDs mudam? Não: reference_id é estável.
// Atenção: são vozes de terceiros; verifique direitos/likeness antes de usar em marca.
export const VOZES_FISH = [
  { id: "df1fa6d2ae194b3ebcbae60df48fde35", nome: "Narrador Propagandas", genero: "masculina", descricao: "Profissional e confiante, timbre suave e energético.", uso: "anúncios, narração corporativa" },
  { id: "d0a1020822f64d07905bd4f4cb37fba9", nome: "NARRADOR", genero: "masculina", descricao: "Calmo e profissional, sotaque brasileiro claro, ritmo medido.", uso: "narração principal, storytelling" },
  { id: "dfe49f8dc6e145238ca87f97ab89f3a5", nome: "Narrador", genero: "masculina", descricao: "Calmo e sério, meia-idade, ritmo medido.", uso: "narração dramática, história" },
  { id: "b2f48ebaf7b644539abc7dea4cf7d28c", nome: "Melhor narrador", genero: "masculina", descricao: "Grave e profissional, narrativa clara e envolvente.", uso: "documentário, educativo" },
  { id: "e2b7e279f9ee47138bdf0b6d62356e8b", nome: "narrador oficial", genero: "masculina", descricao: "Grave, autoritária, séria e medida.", uso: "narração oficial, institucional" },
  { id: "d8178b2723e845d2a3995fe99112faa5", nome: "Narrador Persuasivo", genero: "masculina", descricao: "Calma e clara, envolvente.", uso: "educativo, conteúdo explicativo" },
  { id: "e8cad1cf86da456f9170ea8e3176646a", nome: "narrador", genero: "masculina", descricao: "Energética e profissional, dinâmica.", uso: "conteúdo dinâmico, anúncio" },
  { id: "c3fe6105acc5476cb95e10a952e8e013", nome: "NARRADOR", genero: "masculina", descricao: "Grave e calma, ritmo medido, sotaque BR claro.", uso: "social media, educativo" },
  { id: "b601c1a92e8d426c8706a8efc8bb318d", nome: "Narrador", genero: "masculina", descricao: "Jovem, amigável e conversacional.", uso: "social media, storytelling leve" },
  { id: "7adc1c4204ba4335b78ecf4ce06b9e86", nome: "Narrador", genero: "masculina", descricao: "Timbre grave.", uso: "impacto, abertura" },
];

// Vozes pt-BR da biblioteca compartilhada do ElevenLabs (precisam ser adicionadas à conta).
export const VOZES_ELEVENLABS_BIBLIOTECA_PT = [
  { nome: "Antônio - Deep, Warm, Calm Storyteller", descricao: "Grave, caloroso, ritmo calmo.", uso: "documentário, narração premium" },
  { nome: "Iago - Natural, Calm", descricao: "Natural e calmo.", uso: "narração principal, tutorial" },
  { nome: "Lucas Gabriel - Calm & Clear", descricao: "Calmo e claro.", uso: "explicativo, institucional" },
  { nome: "Marcelo - Calm & Friendly", descricao: "Calmo e amigável.", uso: "social media, conversa" },
  { nome: "Jorge - Calm & Warm", descricao: "Calmo e caloroso.", uso: "storytelling, acolhedor" },
  { nome: "Teresinha - Energetic Teacher", descricao: "Energética, professora.", uso: "aula, didático" },
  { nome: "Audesio - Casual", descricao: "Casual.", uso: "bastidores, conversa" },
  { nome: "Gui - Chill", descricao: "Tranquilo.", uso: "lifestyle" },
];

export const VOZES_ELEVENLABS = [
  { id: "Qrdut83w0Cr152Yb4Xn3", nome: "Paulo", idioma: "pt-BR", genero: "masculina", descricao: "Voz brasileira aprovada da @bascowave; usar com stability 0.7.", uso: "padrão dos Reels" },
  { id: "JBFqnCBsd6RMkjVDRZzb", nome: "George", idioma: "en", genero: "masculina", descricao: "Narrador caloroso e envolvente, britânico.", uso: "narração em inglês" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", nome: "Alice", idioma: "en", genero: "feminina", descricao: "Clara e envolvente, educadora.", uso: "explicativo em inglês" },
  { id: "XrExE9yKIg1WjnnlVkGX", nome: "Matilda", idioma: "en", genero: "feminina", descricao: "Conhecedora e profissional, animada.", uso: "institucional em inglês" },
  { id: "onwK4e9ZLuTAKqWW03F9", nome: "Daniel", idioma: "en", genero: "masculina", descricao: "Locutor estável e formal, britânico.", uso: "notícia, narração formal" },
  { id: "pFZP5JQG7iQjIQuC4Bku", nome: "Lily", idioma: "en", genero: "feminina", descricao: "Aveludada e confiante, britânica.", uso: "narrativa premium" },
];

// Descubra vozes Fish em https://fish.audio/voices ou via --vozes (GET /model?language=pt).
// Descubra vozes Fish em https://fish.audio/voices ou via --vozes (GET /model?language=pt).
export const VOZES_FISH_EXEMPLO = [
  { id: "fbe02f8306fc4d3d915e9871722a39d5", nota: "exemplo da documentação oficial; NÃO é necessariamente pt-BR" },
];

export function infoModelo(provedor, id) {
  const lista = MODELOS[provedor] || [];
  return lista.find((m) => m.id === id) || null;
}

export function escolherVozGemini({ tom = "narracao" } = {}) {
  const mapa = {
    narracao: "Kore",
    explicativo: "Charon",
    energia: "Puck",
    caloroso: "Sulafat",
    claro: "Iapetus",
    autoridade: "Algenib",
  };
  const id = mapa[tom] || "Kore";
  return VOZES_GEMINI.find((v) => v.id === id) || VOZES_GEMINI[0];
}

// Heurística para o agente decidir (a skill tts-escolha detalha o raciocínio).
export function escolherProvedor({ sincroniaPalavra = true, idiomas = 1, expressivo = false, podePagar = false } = {}) {
  if (expressivo || idiomas > 83) {
    return {
      provedor: "gemini",
      modelo: "gemini-3.8-flash-tts",
      motivo: "precisa de expressividade/muitos idiomas; aceita timestamps aproximados",
      avisos: ["sem timestamps por palavra", "free tier AI Studio 10 RPD"],
    };
  }
  // padrão da casa: ElevenLabs + Paulo. As outras opções só entram quando o usuário aprovar.
  if (podePagar || sincroniaPalavra) {
    return {
      provedor: "elevenlabs",
      modelo: "eleven_v4",
      motivo: "sincronia por palavra com voz Paulo (pt-BR) e stability 0.7",
      avisos: ["créditos pagos: aprovar caracteres antes"],
    };
  }
  return {
    provedor: "fish",
    modelo: "s2.1-pro-free",
    motivo: "grátis com timestamps por segmento; melhor custo-benefício atual",
    avisos: ["free até 30/11/2026", "sem SLA", "dados podem ser usados para treino"],
  };
}

export function vozGemini(id) {
  return VOZES_GEMINI.find((v) => v.id === id) || VOZES_GEMINI_PT.find((v) => v.id === id) || null;
}

export function vozFish(id) {
  return VOZES_FISH.find((v) => v.id === id) || null;
}

export function vozEleven(id) {
  return VOZES_ELEVENLABS.find((v) => v.id === id) || null;
}

export function descreverVoz(v) {
  if (!v) return "";
  const partes = [];
  if (v.genero) partes.push(v.genero);
  if (v.idade) partes.push(v.idade + " anos");
  if (v.estilo) partes.push("estilo " + v.estilo);
  const cabeca = partes.length ? " (" + partes.join(", ") + ")" : "";
  const corpo = v.descricao ? " — " + v.descricao : "";
  const alvo = v.uso ? " | usar em: " + v.uso : "";
  return cabeca + corpo + alvo;
}

function linhaModelo(provedor, m) {
  console.log("  - " + m.id + " | " + m.nome);
  console.log("      custo: " + m.custo + (m.preco ? " (" + m.preco + ")" : ""));
  console.log("      temporário: " + m.temporario);
  console.log("      timestamps: " + m.timestamps + " | idiomas: " + m.idiomas);
  console.log("      qualidade: " + m.qualidade);
  if (m.nota) console.log("      nota: " + m.nota);
  if (m.refs) console.log("      ref: " + m.refs);
}

export function imprimirCatalogo(provedor) {
  const alvos = provedor ? [provedor] : Object.keys(MODELOS);
  const titulos = { elevenlabs: "ElevenLabs (pago)", fish: "Fish Audio", gemini: "Gemini TTS" };
  for (const p of alvos) {
    console.log("== " + (titulos[p] || p) + " ==");
    for (const m of MODELOS[p] || []) linhaModelo(p, m);
    console.log("");
  }
  if (!provedor || provedor === "gemini") {
    console.log("== Vozes Gemini 3.8 prebuilt (en-US; falam pt com possível sotaque) ==");
    for (const v of VOZES_GEMINI) console.log("  - " + v.id + " (" + v.estilo + "): " + v.descricao + " | usar em: " + v.uso);
    console.log("");
    console.log("== Vozes Gemini pt-BR nativas (Voice Library) ==");
    for (const v of VOZES_GEMINI_PT) console.log("  - " + v.id + " (" + v.genero + ", " + v.idade + " anos): " + v.descricao + " | usar em: " + v.uso);
    console.log("");
  }
  if (!provedor || provedor === "elevenlabs") {
    console.log("== Vozes ElevenLabs conhecidas ==");
    for (const v of VOZES_ELEVENLABS) console.log("  - " + v.id + " | " + v.nome + " (" + v.idioma + "): " + v.nota);
    console.log("");
  }
  if (!provedor || provedor === "fish") {
    console.log("== Fish Audio: vozes pt-BR de narração (curadas) ==");
    for (const v of VOZES_FISH) console.log("  - " + v.id + " | " + v.nome + " (" + v.genero + "): " + v.descricao + " | usar em: " + v.uso);
    console.log("  Descubra mais: npm run narrar:fish -- --vozes [termo]");
    console.log("  Atenção: vozes de terceiros; confira direitos antes de usar em marca.");
    console.log("");
  }
}

export function imprimirCatalogoGemini() { imprimirCatalogo("gemini"); }
export function imprimirCatalogoFish() { imprimirCatalogo("fish"); }
export function imprimirCatalogoElevenlabs() { imprimirCatalogo("elevenlabs"); }

const executadoDireto = process.argv[1] && process.argv[1].endsWith("tts-modelos.mjs");
if (executadoDireto) {
  imprimirCatalogo();
}
