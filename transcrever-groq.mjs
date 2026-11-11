// Timestamps independentes do TTS: transcreve áudio com Groq Whisper e grava
// falaN.json no mesmo formato dos provedores de narração ({ texto, palavras: [{palavra,inicio,fim}] }).
// Assim qualquer áudio (ElevenLabs/Fish/Gemini/gravado) ganha timestamps por palavra.
//
// Uso: npm run transcrever -- <pasta-ou-arquivo> [flags]
//   --model whisper-large-v3 | whisper-large-v3-turbo   (default: whisper-large-v3)
//   --lang pt                                            (default: pt; "auto" detecta)
//   --prompt "contexto"                                  (máx. 224 tokens)
//   --out <pasta>                                        (default: mesma pasta do áudio)
//   --sobrescrever                                       (default: faz backup falaN.tts.json)
//   --dry-run                                            (mostra plano/custo sem chamar a API)
//   --list                                               (modelos, preços e limites)
//
// Chave: GROQ_API_KEY no .env.local. Endpoint: https://api.groq.com/openai/v1/audio/transcriptions
// GROQ_BASE_URL pode sobrescrever a base (testes/proxy).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { basename, extname, join, resolve } from "path";
import { execFileSync } from "child_process";
import { tmpdir } from "os";

const MODELOS = {
  "whisper-large-v3": {
    nome: "Whisper Large V3",
    precoHora: 0.111,
    wer: "10,3%",
    traducao: true,
    nota: "mais preciso; ideal para legenda por palavra",
  },
  "whisper-large-v3-turbo": {
    nome: "Whisper Large V3 Turbo",
    precoHora: 0.04,
    wer: "12%",
    traducao: false,
    nota: "mais barato e rapido; bom para rascunho",
  },
};

const LIMITES = [
  "20 RPM | 2.000 RPD | 7.200 segundos de audio por hora (2 h/h) | 28.800 por dia (8 h/dia)",
  "arquivo: 25 MB no free tier (100 MB no dev tier); minimo cobrado: 10 s por requisicao",
  "formatos: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm (outros sao convertidos para flac 16 kHz)",
].join("\n  ");

const args = process.argv.slice(2);
const flags = {
  list: false,
  dryRun: false,
  model: null,
  lang: null,
  prompt: null,
  out: null,
  sobrescrever: false,
};
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--list" || a === "--modelos") flags.list = true;
  else if (a === "--dry-run" || a === "-n") flags.dryRun = true;
  else if (a === "--sobrescrever") flags.sobrescrever = true;
  else if (a === "--model") flags.model = args[++i] || null;
  else if (a === "--lang" || a === "--language") flags.lang = args[++i] || null;
  else if (a === "--prompt") flags.prompt = args[++i] || null;
  else if (a === "--out") flags.out = args[++i] || null;
  else pos.push(a);
}

function imprimirLista() {
  console.log("== Groq Whisper (speech-to-text) ==");
  for (const [id, m] of Object.entries(MODELOS)) {
    console.log("  - " + id + " | " + m.nome);
    console.log("      preco: $" + m.precoHora.toFixed(3) + "/hora | WER: " + m.wer + " | traducao: " + (m.traducao ? "sim" : "nao"));
    console.log("      " + m.nota);
  }
  console.log("  limites:");
  console.log("  " + LIMITES);
  console.log("  endpoint: https://api.groq.com/openai/v1/audio/transcriptions");
  console.log("  timestamps: response_format=verbose_json + timestamp_granularities[]=word,segment");
  console.log("  refs: https://console.groq.com/docs/speech-to-text | https://console.groq.com/docs/rate-limits");
}

if (flags.list) {
  imprimirLista();
  process.exit(0);
}

const alvo = pos[0];
if (!alvo) {
  console.error("uso: npm run transcrever -- <pasta-ou-arquivo> [--model id] [--lang pt] [--dry-run] [--list]");
  console.error("  modelos: whisper-large-v3 (default), whisper-large-v3-turbo");
  console.error("  le fala*.mp3|wav|opus|m4a|flac|ogg|webm e grava falaN.json com palavras e tempos");
  process.exit(1);
}

const model = flags.model || process.env.GROQ_MODEL || "whisper-large-v3";
const modelo = MODELOS[model];
if (!modelo) {
  console.error("modelo desconhecido: " + model);
  console.error("use --list para ver os modelos disponiveis.");
  process.exit(1);
}
const lang = flags.lang || process.env.GROQ_LANG || "pt";
const prompt = flags.prompt || process.env.GROQ_PROMPT || null;
const apiKey = process.env.GROQ_API_KEY;
const baseUrl = (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/+$/, "");

const EXT_AUDIO = [".mp3", ".wav", ".opus", ".m4a", ".flac", ".ogg", ".webm", ".mp4", ".mpeg", ".mpga", ".pcm"];
const EXT_ACEITAS = new Set([".flac", ".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".ogg", ".wav", ".webm"]);

function listarAudios(caminho) {
  const st = statSync(caminho);
  if (st.isFile()) return [resolve(caminho)];
  const nomes = readdirSync(caminho).filter((n) => n.startsWith("fala") && EXT_AUDIO.includes(extname(n).toLowerCase()));
  nomes.sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10);
    const nb = parseInt(b.replace(/\D/g, ""), 10);
    return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
  });
  return nomes.map((n) => resolve(join(caminho, n)));
}

function duracao(p) {
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], { encoding: "utf8" });
    return parseFloat(out.trim()) || 0;
  } catch {
    return 0;
  }
}

function prepararUpload(p) {
  const ext = extname(p).toLowerCase();
  const size = statSync(p).size;
  if (EXT_ACEITAS.has(ext) && size <= 25 * 1024 * 1024) return { arquivo: p, temporario: false };
  const tmp = join(tmpdir(), "groq-" + basename(p, ext) + "-" + Date.now() + ".flac");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", p, "-ar", "16000", "-ac", "1", "-c:a", "flac", tmp]);
  return { arquivo: tmp, temporario: true };
}

function mimeDe(ext) {
  const map = { ".mp3": "audio/mpeg", ".wav": "audio/wav", ".flac": "audio/flac", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".webm": "audio/webm", ".opus": "audio/opus" };
  return map[ext] || "application/octet-stream";
}

const audios = listarAudios(alvo);
if (audios.length === 0) {
  console.error("nenhum audio fala* encontrado em " + alvo);
  process.exit(1);
}

const outDir = flags.out ? resolve(flags.out) : (statSync(alvo).isDirectory() ? resolve(alvo) : resolve(join(alvo, "..")));
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

console.log("[groq] modelo: " + model + " ($" + modelo.precoHora.toFixed(3) + "/hora, WER " + modelo.wer + ")");
console.log("[groq] idioma: " + lang + " | granularidade: palavra + segmento");
console.log("[groq] arquivos: " + audios.length + " | saida: " + outDir);
if (lang === "auto") console.log("[groq] aviso: 'auto' omite language; informar pt melhora precisao.");

let totalSeg = 0;
const plano = [];
for (const p of audios) {
  const d = duracao(p);
  totalSeg += Math.max(d, 10);
  plano.push({ p, d });
}
const custo = (totalSeg / 3600) * modelo.precoHora;
console.log("[groq] duracao total (minimo 10 s por arquivo): " + totalSeg.toFixed(1) + " s | custo estimado: $" + custo.toFixed(4));

if (flags.dryRun) {
  for (const item of plano) console.log("  - " + basename(item.p) + " (" + item.d.toFixed(2) + " s)");
  console.log("[groq] --dry-run: nada foi chamado na API.");
  process.exit(0);
}

if (!apiKey) {
  console.error("[groq] GROQ_API_KEY nao definida no .env.local.");
  console.error("[groq] crie a chave em https://console.groq.com/keys");
  process.exit(1);
}

let erros = 0;
for (const item of plano) {
  const p = item.p;
  const nome = basename(p);
  const base = basename(p, extname(p));
  const { arquivo, temporario } = prepararUpload(p);
  try {
    const buf = readFileSync(arquivo);
    const form = new FormData();
    form.append("file", new Blob([buf], { type: mimeDe(extname(arquivo).toLowerCase()) }), basename(arquivo));
    form.append("model", model);
    form.append("response_format", "verbose_json");
    form.append("temperature", "0");
    form.append("timestamp_granularities[]", "word");
    form.append("timestamp_granularities[]", "segment");
    if (lang && lang !== "auto") form.append("language", lang);
    if (prompt) form.append("prompt", prompt);

    const res = await fetch(baseUrl + "/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey },
      body: form,
    });

    if (!res.ok) {
      const corpo = (await res.text()).slice(0, 600);
      console.error("[groq] " + nome + ": HTTP " + res.status + " " + corpo);
      if (res.status === 401) console.error("[groq] chave invalida/expirada.");
      if (res.status === 429) console.error("[groq] limite atingido: espere o retry-after e tente de novo.");
      if (res.status === 413) console.error("[groq] arquivo grande: converta para flac 16 kHz mono.");
      erros++;
      continue;
    }

    const j = await res.json();
    const palavras = (j.words || [])
      .map((w) => ({ palavra: String(w.word || "").trim(), inicio: Number(w.start), fim: Number(w.end) }))
      .filter((w) => w.palavra);
    const segmentos = (j.segments || []).map((s) => ({ texto: s.text || "", inicio: Number(s.start), fim: Number(s.end) }));
    const texto = (j.text || palavras.map((w) => w.palavra).join(" ")).trim();
    const duracaoReal = j.duration || item.d || 0;

    const jsonPath = join(outDir, base + ".json");
    if (existsSync(jsonPath) && !flags.sobrescrever) {
      writeFileSync(join(outDir, base + ".tts.json"), readFileSync(jsonPath));
      console.log("[groq] backup: " + base + ".tts.json");
    }
    writeFileSync(
      jsonPath,
      JSON.stringify(
        {
          texto,
          palavras,
          provider: "groq",
          model,
          voice: null,
          idioma: j.language || (lang === "auto" ? null : lang),
          timing: "word",
          duracao: duracaoReal,
          segmentos,
        },
        null,
        1,
      ),
    );
    console.log("[groq] " + base + ": " + palavras.length + " palavras, " + duracaoReal.toFixed(2) + " s, idioma " + (j.language || lang));
  } finally {
    if (temporario) {
      try { unlinkSync(arquivo); } catch { /* ignora */ }
    }
  }
}

if (erros > 0) {
  console.error("[groq] " + erros + " arquivo(s) falharam.");
  process.exit(1);
}
console.log("[groq] concluido: " + plano.length + " arquivo(s) com timestamps por palavra.");
