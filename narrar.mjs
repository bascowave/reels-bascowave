// Narração com ElevenLabs: gera um áudio por fala e o tempo de início de cada palavra.
// Uso: npm run narrar -- <falas.txt> <pasta-de-saída> [voice_id] [flags]
//   --list        mostra modelos/vozes/limites conhecidos
//   --dry-run     mostra o custo (caracteres) sem chamar a API
//   --voice <id>  força voice_id (padrão: Paulo Qrdut83w0Cr152Yb4Xn3, voz da marca)
// falas.txt: uma fala por linha. A chave vem de ELEVENLABS_API_KEY (.env.local).
// ATENÇÃO: créditos são pagos — sempre informar caracteres e esperar o sim antes de narrar/regenerar.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  VOZES_ELEVENLABS,
  VOZES_ELEVENLABS_BIBLIOTECA_PT,
  imprimirCatalogoElevenlabs,
  vozEleven,
  descreverVoz,
} from "./tts-modelos.mjs";

const args = process.argv.slice(2);
const flags = { list: false, vozes: false, dryRun: false, voice: null };
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--list" || a === "--modelos") flags.list = true;
  else if (a === "--vozes") flags.vozes = true;
  else if (a === "--dry-run" || a === "-n") flags.dryRun = true;
  else if (a === "--voice" || a === "--voz") flags.voice = args[++i] || null;
  else pos.push(a);
}

if (flags.list) {
  imprimirCatalogoElevenlabs();
  process.exit(0);
}

if (flags.vozes) {
  const chave = process.env.ELEVENLABS_API_KEY;
  console.log("[elevenlabs] vozes da sua conta:");
  if (!chave) {
    console.log("  (sem ELEVENLABS_API_KEY no .env.local — não é possível listar a conta)");
  } else {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": chave } });
    if (!res.ok) {
      console.log("  HTTP " + res.status + " " + (await res.text()).slice(0, 300));
    } else {
      const json = await res.json();
      const vozes = json.voices || [];
      for (const v of vozes) {
        const curada = vozEleven(v.voice_id);
        if (curada) console.log("  - " + v.voice_id + " | " + v.name + descreverVoz(curada));
        else {
          const labels = v.labels || {};
          console.log("  - " + v.voice_id + " | " + v.name + " | " + [labels.gender, labels.accent, labels.language, labels.use_case].filter(Boolean).join(", "));
        }
      }
      console.log("[elevenlabs] " + vozes.length + " vozes na conta.");
    }
  }
  console.log("[elevenlabs] biblioteca compartilhada pt-BR (adicione à conta antes de usar):");
  for (const v of VOZES_ELEVENLABS_BIBLIOTECA_PT) console.log("  - " + v.nome + " — " + v.descricao + " | usar em: " + v.uso);
  process.exit(0);
}

const [arquivo, saida, vozArg] = pos;
if (!arquivo || !saida) {
  console.error("uso: npm run narrar -- <falas.txt> <pasta-de-saída> [voice_id] [--dry-run] [--list]");
  console.error("  voz padrão: Paulo (pt-BR) Qrdut83w0Cr152Yb4Xn3 | outra voz só com aprovação do usuário");
  console.error("  ver TTS.md e a skill tts-escolha para escolher.");
  process.exit(1);
}

const voz = flags.voice || vozArg || "Qrdut83w0Cr152Yb4Xn3"; // Paulo, voz da marca
const vozInfo = VOZES_ELEVENLABS.find((v) => v.id === voz);
const estabilidade = process.env.STABILITY ? +process.env.STABILITY : null;

const falas = readFileSync(arquivo, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const caracteres = falas.reduce((s, f) => s + f.length, 0);

console.log("[elevenlabs] modelo: eleven_v4 (pago, créditos)");
console.log("[elevenlabs] voz: " + voz + (vozInfo ? " (" + vozInfo.nome + " — " + vozInfo.idioma + ")" : ""));
console.log("[elevenlabs] stability: " + (estabilidade != null ? estabilidade : "(padrão da conta)"));
console.log("[elevenlabs] falas: " + falas.length + " | caracteres: " + caracteres);
console.log("[elevenlabs] ATENÇÃO: créditos pagos. Este lote vai gastar " + caracteres + " caracteres.");

if (flags.dryRun) {
  console.log("[elevenlabs] --dry-run: nada foi chamado na API.");
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("[elevenlabs] ELEVENLABS_API_KEY não definida no .env.local.");
  console.error("[elevenlabs] crie a chave em https://elevenlabs.io/app/settings/api-keys");
  process.exit(1);
}

const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
const client = new ElevenLabsClient({ apiKey });
mkdirSync(saida, { recursive: true });

for (const [i, texto] of falas.entries()) {
  const r = await client.textToSpeech.convertWithTimestamps(voz, {
    text: texto,
    modelId: "eleven_v4",
    languageCode: "pt",
    outputFormat: "mp3_44100_128",
    ...(estabilidade != null ? { voiceSettings: { stability: estabilidade, similarityBoost: 0.75 } } : {}),
  });
  writeFileSync(join(saida, "fala" + i + ".mp3"), Buffer.from(r.audioBase64, "base64"));

  const a = r.alignment;
  const palavras = [];
  let atual = null;
  a.characters.forEach((ch, k) => {
    if (/\s/.test(ch)) { atual = null; return; }
    if (!atual) { atual = { palavra: "", inicio: a.characterStartTimesSeconds[k] }; palavras.push(atual); }
    atual.palavra += ch;
    atual.fim = a.characterEndTimesSeconds[k];
  });
  writeFileSync(join(saida, "fala" + i + ".json"), JSON.stringify({ texto, palavras, provider: "elevenlabs", model: "eleven_v4", voice: voz, timing: "word" }, null, 1));
  console.log("fala" + i + ": " + palavras.length + " palavras, " + (palavras.at(-1)?.fim?.toFixed(2) || "?") + " s");
}
