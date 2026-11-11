// Narração com Gemini 3.8 Flash TTS (API Interactions, unary).
// Uso: npm run narrar:gemini -- <falas.txt> <pasta-de-saída> [voice] [flags]
//   --list            mostra modelos/vozes/limites do Gemini
//   --vozes           consulta a API de vozes (requer GEMINI_API_KEY)
//   --model <id>      força modelo (default: gemini-3.8-flash-tts)
//   --voice <id>      força voz (default: escolha inteligente = Kore para narração)
//   --style "<texto>" style metadata por turno
//   --dry-run         mostra o que seria feito, sem chamar a API
// O agente NÃO precisa que o usuário defina GEMINI_MODEL/GEMINI_VOICE/GEMINI_STYLE no .env:
// a escolha é feita aqui (com aviso) e as flags sobrepõem qualquer variável.
// Saída: falaN.wav + falaN.json ({ texto, palavras, provider, timing: "approximate" }).
// ATENÇÃO: Gemini TTS não retorna timestamps por palavra; tempos aproximados por caracteres.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  VOZES_GEMINI,
  VOZES_GEMINI_PT,
  escolherVozGemini,
  infoModelo,
  imprimirCatalogoGemini,
  vozGemini,
  descreverVoz,
} from "./tts-modelos.mjs";

const args = process.argv.slice(2);
const flags = { list: false, vozes: false, dryRun: false, model: null, voice: null, style: null };
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--list" || a === "--modelos") flags.list = true;
  else if (a === "--vozes") flags.vozes = true;
  else if (a === "--dry-run" || a === "-n") flags.dryRun = true;
  else if (a === "--model") flags.model = args[++i] || null;
  else if (a === "--voice" || a === "--voz") flags.voice = args[++i] || null;
  else if (a === "--style" || a === "--estilo") flags.style = args[++i] || null;
  else pos.push(a);
}

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (flags.list) {
  imprimirCatalogoGemini();
  process.exit(0);
}

async function listarVozes(lang) {
  const pt = lang && String(lang).toLowerCase().startsWith("pt");
  if (pt) {
    console.log("[gemini] opções pt-BR NATIVAS (Voice Library) — escolha pelo uso:");
    for (const v of VOZES_GEMINI_PT) console.log("  - " + v.id + descreverVoz(v));
    console.log("[gemini] use --voice <id>. Sem flag, o padrão é Kore (en-US, pode ter sotaque).");
    return;
  }
  console.log("[gemini] vozes prebuilt (en-US) — o Gemini fala português, mas pode carregar sotaque:");
  for (const v of VOZES_GEMINI) console.log("  - " + v.id + descreverVoz(v));
  console.log("[gemini] para sotaque brasileiro nativo rode: --vozes pt-BR");
  if (!apiKey) return;
  if (!lang) {
    console.log("[gemini] (a Voice Library completa tem 100+ vozes; use --vozes pt-BR para ver as brasileiras)");
    return;
  }
  const url = "https://generativelanguage.googleapis.com/v1beta/voices?page_size=100&language_code=" + encodeURIComponent(lang);
  const res = await fetch(url, { headers: { "x-goog-api-key": apiKey } });
  if (!res.ok) {
    console.log("[gemini] HTTP " + res.status + " " + (await res.text()).slice(0, 300));
    return;
  }
  const json = await res.json();
  const vozes = json.voices || [];
  console.log("[gemini] " + vozes.length + " vozes retornadas pela API para " + lang + ":");
  for (const v of vozes) {
    const id = v.id || v.name || v.voice_id || "?";
    const curada = vozGemini(id);
    if (curada) console.log("  - " + id + descreverVoz(curada));
    else {
      const nome = v.display_name || v.displayName || "";
      const gen = v.gender || "";
      const desc = v.description || "";
      console.log("  - " + id + " | " + nome + " | " + gen + " | " + desc);
    }
  }
}

if (flags.vozes) {
  await listarVozes(pos[0] || null);
  process.exit(0);
}

const [arquivo, saida, vozPos] = pos;
if (!arquivo || !saida) {
  console.error("uso: npm run narrar:gemini -- <falas.txt> <pasta-de-saída> [voice] [--model id] [--style texto] [--dry-run] [--list] [--vozes]");
  console.error("  modelos: gemini-3.8-flash-tts (default), gemini-3.8-flash-lite-tts, ...");
  console.error("  vozes: Kore (default p/ narração), Charon, Puck, Sulafat... ver --list.");
  console.error("  ver TTS.md e a skill tts-escolha para escolher.");
  process.exit(1);
}

const modelId = flags.model || process.env.GEMINI_MODEL || "gemini-3.8-flash-tts";
const modelo = infoModelo("gemini", modelId);
const voz = flags.voice || vozPos || process.env.GEMINI_VOICE || escolherVozGemini({ tom: "narracao" }).id;
const vozInfo = VOZES_GEMINI.find((v) => v.id === voz);
const estilo = flags.style !== null ? flags.style : (process.env.GEMINI_STYLE || "");

const falas = readFileSync(arquivo, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const caracteres = falas.reduce((s, f) => s + f.length, 0);

console.log("[gemini] modelo: " + modelId + (modelo ? " (" + modelo.nome + ")" : " (não catalogado)"));
if (modelo) {
  console.log("[gemini] custo: " + modelo.custo + " | temporário: " + modelo.temporario);
  console.log("[gemini] timestamps: " + modelo.timestamps + " | idiomas: " + modelo.idiomas);
}
console.log("[gemini] voz: " + voz + (vozInfo ? " (" + vozInfo.estilo + " — " + vozInfo.uso + ")" : ""));
console.log("[gemini] style: " + (estilo ? JSON.stringify(estilo) : "(vazio — recomendado começar sem style)"));
console.log("[gemini] falas: " + falas.length + " | caracteres: " + caracteres);
console.log("[gemini] ATENÇÃO: sem timestamps por palavra — tempos aproximados (por caracteres). Para sincronia precisa use narrar:fish ou narrar.");
console.log("[gemini] ATENÇÃO: free tier AI Studio = 3 RPM / 10k TPM / 10 RPD (Cloud TTS é pago).");

if (flags.dryRun) {
  console.log("[gemini] --dry-run: nada foi chamado na API.");
  process.exit(0);
}

if (!apiKey) {
  console.error("[gemini] GEMINI_API_KEY (ou GOOGLE_API_KEY) não definida no .env.local.");
  console.error("[gemini] crie a chave em https://aistudio.google.com/apikey");
  process.exit(1);
}

mkdirSync(saida, { recursive: true });

function parseWavDuration(buf) {
  let i = 12;
  let sampleRate = 24000, channels = 1, bitsPerSample = 16, dataSize = 0;
  while (i < buf.length - 8) {
    const id = buf.toString("ascii", i, i + 4);
    const size = buf.readUInt32LE(i + 4);
    if (id === "fmt ") {
      channels = buf.readUInt16LE(i + 10);
      sampleRate = buf.readUInt32LE(i + 12);
      bitsPerSample = buf.readUInt16LE(i + 22);
    } else if (id === "data") {
      dataSize = size;
      break;
    }
    i += 8 + size;
    if (size % 2) i++;
  }
  const bytesPerSample = bitsPerSample / 8 || 2;
  const totalSamples = dataSize / (channels * bytesPerSample);
  return totalSamples / (sampleRate || 24000);
}

for (const [i, texto] of falas.entries()) {
  const contentItem = { type: "text", text: texto };
  if (estilo) contentItem.annotations = [{ type: "speech_metadata", style: estilo }];

  const body = {
    model: modelId,
    input: [{ type: "user_input", content: [contentItem] }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: voz }] },
  };

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("fala" + i + ": HTTP " + res.status + " " + (await res.text()).slice(0, 800));
    process.exit(1);
  }

  const json = await res.json();
  let audioB64 = null;
  if (Array.isArray(json.steps)) {
    for (const step of json.steps) {
      if (Array.isArray(step.content)) {
        for (const c of step.content) {
          if (c.type === "audio" && c.data) audioB64 = c.data;
        }
      }
    }
  }
  if (!audioB64 && json.output_audio && json.output_audio.data) audioB64 = json.output_audio.data;

  if (!audioB64) {
    console.error("fala" + i + ": sem audio na resposta");
    console.error(JSON.stringify(json).slice(0, 800));
    process.exit(1);
  }

  const audio = Buffer.from(audioB64, "base64");
  writeFileSync(join(saida, "fala" + i + ".wav"), audio);

  const duration = parseWavDuration(audio);
  const words = texto.split(/\s+/).filter(Boolean);
  const totalChars = words.reduce((s, w) => s + w.length, 0) || 1;
  const palavras = [];
  let cursor = 0;
  for (const w of words) {
    const dur = duration * (w.length / totalChars);
    palavras.push({ palavra: w, inicio: cursor, fim: cursor + dur });
    cursor += dur;
  }

  writeFileSync(
    join(saida, "fala" + i + ".json"),
    JSON.stringify({ texto, palavras, provider: "gemini", model: modelId, voice: voz, timing: "approximate", duration }, null, 1),
  );
  console.log("fala" + i + ": " + palavras.length + " palavras (aprox.), " + duration.toFixed(2) + " s, " + audio.length + " bytes (" + modelId + ")");
}
