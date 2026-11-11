// Narração com Fish Audio S2.1 Pro (free tier) + timestamps por segmento.
// Uso: npm run narrar:fish -- <falas.txt> <pasta-de-saída> [reference_id] [flags]
//   --list            mostra modelos/limites do Fish
//   --vozes           lista vozes públicas (filtro pt) via API (requer FISH_API_KEY)
//   --model <id>      força modelo (default: s2.1-pro-free)
//   --voice <id>      reference_id da voz (default: voz padrão da conta)
//   --dry-run         mostra o que seria feito, sem chamar a API
// A escolha é feita aqui com aviso; o usuário só precisa da FISH_API_KEY no .env.local.
// Saída: falaN.mp3 + falaN.json ({ texto, palavras, provider, timing: "segment" }).
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { infoModelo, imprimirCatalogoFish, VOZES_FISH, vozFish, descreverVoz } from "./tts-modelos.mjs";

const args = process.argv.slice(2);
const flags = { list: false, vozes: false, dryRun: false, model: null, voice: null };
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--list" || a === "--modelos") flags.list = true;
  else if (a === "--vozes") flags.vozes = true;
  else if (a === "--dry-run" || a === "-n") flags.dryRun = true;
  else if (a === "--model") flags.model = args[++i] || null;
  else if (a === "--voice" || a === "--voz" || a === "--reference") flags.voice = args[++i] || null;
  else pos.push(a);
}

const apiKey = process.env.FISH_API_KEY;

if (flags.list) {
  imprimirCatalogoFish();
  process.exit(0);
}

async function listarVozes(busca) {
  console.log("[fish] vozes curadas de narração pt-BR (melhor ponto de partida):");
  for (const v of VOZES_FISH) console.log("  - " + v.id + " | " + v.nome + descreverVoz(v));
  if (!busca) {
    console.log("[fish] para buscar outras: --vozes <termo> (ex.: --vozes narrador)");
    console.log("[fish] atenção: vozes de terceiros; confira direitos antes de usar em marca.");
    return;
  }
  if (!apiKey) {
    console.log("[fish] FISH_API_KEY ausente; defina no .env.local para consultar a Voice Library.");
    return;
  }
  console.log("[fish] buscando por título: " + busca);
  const url = "https://api.fish.audio/model?page_size=20&page_number=1&language=pt&sort_by=score&title=" + encodeURIComponent(busca);
  const res = await fetch(url, { headers: { Authorization: "Bearer " + apiKey } });
  if (!res.ok) {
    console.log("[fish] HTTP " + res.status + " " + (await res.text()).slice(0, 300));
    return;
  }
  const json = await res.json();
  const itens = json.items || [];
  console.log("[fish] " + itens.length + " vozes públicas (pt, por score):");
  for (const v of itens) {
    const id = v._id || "?";
    const curada = vozFish(id);
    if (curada) console.log("  - " + id + " | " + curada.nome + descreverVoz(curada));
    else {
      const titulo = v.title || "";
      const langs = Array.isArray(v.languages) ? v.languages.join(",") : "";
      const likes = v.like_count != null ? v.like_count : "";
      console.log("  - " + id + " | " + titulo + " | idiomas: " + langs + " | likes: " + likes + " | " + (v.description || "").slice(0, 120));
    }
  }
}

if (flags.vozes) {
  await listarVozes(pos[0] || null);
  process.exit(0);
}

const [arquivo, saida, vozPos] = pos;
if (!arquivo || !saida) {
  console.error("uso: npm run narrar:fish -- <falas.txt> <pasta-de-saída> [reference_id] [--model id] [--dry-run] [--list] [--vozes]");
  console.error("  modelos: s2.1-pro-free (default), s2.1-pro, s2-pro, drama-3, s1.");
  console.error("  vozes: reference_id da Voice Library (fish.audio/voices) ou --vozes.");
  console.error("  ver TTS.md e a skill tts-escolha para escolher.");
  process.exit(1);
}

const modelId = flags.model || process.env.FISH_MODEL || "s2.1-pro-free";
const modelo = infoModelo("fish", modelId);
const voz = flags.voice || vozPos || process.env.FISH_VOICE || null;
const formato = (process.env.FISH_FORMAT || "mp3").toLowerCase();

const falas = readFileSync(arquivo, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const caracteres = falas.reduce((s, f) => s + f.length, 0);
const bytes = Buffer.byteLength(falas.join("\n"), "utf8");

console.log("[fish] modelo: " + modelId + (modelo ? " (" + modelo.nome + ")" : " (não catalogado)"));
if (modelo) {
  console.log("[fish] custo: " + modelo.custo + " | preço: " + modelo.preco + " | temporário: " + modelo.temporario);
  console.log("[fish] timestamps: " + modelo.timestamps + " | idiomas: " + modelo.idiomas);
}
console.log("[fish] voz: " + (voz ? voz : "(padrão da conta — descubra vozes com --vozes)"));
console.log("[fish] formato: " + formato + " | falas: " + falas.length + " | caracteres: " + caracteres + " | bytes UTF-8: " + bytes);
console.log("[fish] ATENÇÃO: free tier temporário (até 30/11/2026), sem SLA e dados podem ser usados para treino.");

if (flags.dryRun) {
  console.log("[fish] --dry-run: nada foi chamado na API.");
  process.exit(0);
}

if (!apiKey) {
  console.error("[fish] FISH_API_KEY não definida no .env.local.");
  console.error("[fish] crie a chave em https://fish.audio/app/developers/get-started/");
  process.exit(1);
}

mkdirSync(saida, { recursive: true });

for (const [i, texto] of falas.entries()) {
  const corpo = { text: texto, format: formato };
  if (voz) corpo.reference_id = voz;

  const res = await fetch("https://api.fish.audio/v1/tts/stream/with-timestamp", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", model: modelId },
    body: JSON.stringify(corpo),
  });

  if (!res.ok) {
    console.error("fala" + i + ": HTTP " + res.status + " " + (await res.text()).slice(0, 800));
    process.exit(1);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const audioChunks = [];
  const alignmentByChunk = new Map();

  const handleEvent = (ev) => {
    if (ev.audio_base64) audioChunks.push(Buffer.from(ev.audio_base64, "base64"));
    if (ev.alignment != null) {
      alignmentByChunk.set(ev.chunk_seq, {
        content: ev.content,
        offset: ev.chunk_audio_offset_sec || 0,
        alignment: ev.alignment,
      });
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const dataLines = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());
      for (const dl of dataLines) {
        if (!dl) continue;
        try { handleEvent(JSON.parse(dl)); } catch { /* ignora linha não-JSON */ }
      }
    }
  }
  if (buffer.trim()) {
    const dataLines = buffer.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());
    for (const dl of dataLines) {
      if (!dl) continue;
      try { handleEvent(JSON.parse(dl)); } catch { /* ignora */ }
    }
  }

  const audio = Buffer.concat(audioChunks);
  const ext = formato === "mp3" ? "mp3" : formato;
  writeFileSync(join(saida, "fala" + i + "." + ext), audio);

  const palavras = [];
  const sorted = [...alignmentByChunk.entries()].sort((a, b) => a[0] - b[0]);
  for (const [, item] of sorted) {
    const offset = item.offset;
    const segments = (item.alignment && item.alignment.segments) || [];
    for (const seg of segments) {
      palavras.push({
        palavra: seg.text,
        inicio: (seg.start || 0) + offset,
        fim: (seg.end || 0) + offset,
      });
    }
  }

  writeFileSync(
    join(saida, "fala" + i + ".json"),
    JSON.stringify({ texto, palavras, provider: "fish-audio", model: modelId, voice: voz, timing: "segment" }, null, 1),
  );
  console.log("fala" + i + ": " + palavras.length + " segmentos, " + audio.length + " bytes (" + modelId + ")");
}
