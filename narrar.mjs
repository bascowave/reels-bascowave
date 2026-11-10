// Narração com ElevenLabs: gera um áudio por fala e o tempo de início de cada palavra.
// Uso: npm run narrar -- <falas.txt> <pasta-de-saída> [voice_id]
// falas.txt: uma fala por linha. A chave vem de ELEVENLABS_API_KEY (.env.local), nunca do código.
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const [arquivo, saida, voz = "JBFqnCBsd6RMkjVDRZzb"] = process.argv.slice(2); // George (pré-pronta)
if (!arquivo || !saida) {
  console.error("uso: npm run narrar -- <falas.txt> <pasta-de-saída> [voice_id]");
  process.exit(1);
}

const client = new ElevenLabsClient();
const falas = readFileSync(arquivo, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
mkdirSync(saida, { recursive: true });

for (const [i, texto] of falas.entries()) {
  const r = await client.textToSpeech.convertWithTimestamps(voz, {
    text: texto,
    modelId: "eleven_v4",
    languageCode: "pt",
    outputFormat: "mp3_44100_128",
    // STABILITY=0.7 deixa a voz mais constante (menos variação de sotaque)
    ...(process.env.STABILITY ? { voiceSettings: { stability: +process.env.STABILITY, similarityBoost: 0.75 } } : {}),
  });
  writeFileSync(join(saida, `fala${i}.mp3`), Buffer.from(r.audioBase64, "base64"));

  // junta caracteres em palavras: início = primeiro caractere da palavra
  const a = r.alignment;
  const palavras = [];
  let atual = null;
  a.characters.forEach((ch, k) => {
    if (/\s/.test(ch)) { atual = null; return; }
    if (!atual) { atual = { palavra: "", inicio: a.characterStartTimesSeconds[k] }; palavras.push(atual); }
    atual.palavra += ch;
    atual.fim = a.characterEndTimesSeconds[k];
  });
  writeFileSync(join(saida, `fala${i}.json`), JSON.stringify({ texto, palavras }, null, 1));
  console.log(`fala${i}: ${palavras.length} palavras, ${palavras.at(-1)?.fim?.toFixed(2)} s`);
}
