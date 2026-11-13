// Confere se tudo que a fábrica de Reels precisa está instalado. Não instala nada e não mostra chaves.
// uso: npm run checar   (na pasta do projeto)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();
const WIN = process.platform === "win32";
let falhas = 0, avisos = 0;
const ok = (m) => console.log("✅ " + m);
const erro = (m, como) => { falhas++; console.log("❌ " + m + (como ? "\n   → " + como : "")); };
const aviso = (m, como) => { avisos++; console.log("⚠️  " + m + (como ? "\n   → " + como : "")); };
const roda = (cmd, args, shell = WIN) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell });
  return r.status === 0 ? (r.stdout || r.stderr || "").trim() : null;
};

console.log("\n== Programas ==");
const node = process.versions.node.split(".").map(Number);
node[0] >= 20 ? ok("Node " + process.versions.node) : erro("Node " + process.versions.node + " (precisa 20 ou mais)", "winget install OpenJS.NodeJS.LTS");
const py = roda(WIN ? "python" : "python3", ["--version"]);
py ? ok(py) : erro("Python não encontrado", "winget install Python.Python.3.12");
for (const [cmd, pacote] of [["ffmpeg", "Gyan.FFmpeg"], ["ffprobe", "Gyan.FFmpeg"], ["git", "Git.Git"], ["uv", "astral-sh.uv"], ["yt-dlp", "yt-dlp.yt-dlp"]]) {
  const v = roda(cmd, ["-version"]) ?? roda(cmd, ["--version"]);
  v ? ok(cmd + " " + (v.split("\n")[0].match(/\d+[\d.]*/)?.[0] ?? "")) : erro(cmd + " não encontrado", "winget install " + pacote + " (feche e reabra o terminal depois)");
}
roda("gh", ["--version"]) ? ok("GitHub CLI") : aviso("GitHub CLI não encontrado (opcional)", "winget install GitHub.cli");
const chrome = WIN
  ? ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].some(existsSync)
  : true;
chrome ? ok("Chrome/Edge (usado pelo render)") : erro("Chrome ou Edge não encontrado", "instale o Google Chrome");

console.log("\n== Projeto ==");
existsSync("node_modules/@elevenlabs/elevenlabs-js") ? ok("dependências do npm") : erro("dependências do npm faltando", "npm install");
const venvPy = WIN ? "ferramentas/.sound-effects/Scripts/python.exe" : "ferramentas/.sound-effects/bin/python";
if (!existsSync(venvPy)) erro("ambiente dos efeitos sonoros faltando", "python -m venv ferramentas/.sound-effects  e depois  ferramentas/.sound-effects/Scripts/pip install librosa soundfile numpy scipy matplotlib");
else roda(venvPy, ["-c", "import librosa, soundfile, numpy, scipy"], false) !== null ? ok("ambiente dos efeitos sonoros (librosa)") : erro("ambiente dos efeitos sem librosa", "ferramentas/.sound-effects/Scripts/pip install librosa soundfile numpy scipy matplotlib");
existsSync("ferramentas/sfx/manifest.json") ? ok("biblioteca de sons CC0") : erro("ferramentas/sfx/manifest.json faltando", "git pull (a biblioteca vem no repositório)");

console.log("\n== Skills do Claude Code ==");
const sk = (nome, arq, como, opcional) => {
  const p = join(HOME, ".claude", "skills", nome, arq);
  existsSync(p) ? ok("skill " + nome) : (opcional ? aviso : erro)("skill " + nome + " não encontrada", como);
};
sk("claude-video", "scripts/render.sh", "git clone --depth 1 https://github.com/Felpborges/claude-video ~/.claude/skills/claude-video");
sk("sound-effects", "scripts/sound_pass.py", "npx skills add Barty-Bart/motion-graphics -g -a claude-code --skill sound-effects");
sk("watch", "SKILL.md", "npx skills add bradautomates/claude-video -g -a claude-code --skill watch", true);
const lemo = [join(HOME, ".claude", "skills", "lemo-opuscar"), join(HOME, ".claude", "plugins")].some((p) => existsSync(p) && JSON.stringify(roda(WIN ? "dir" : "ls", [p]) ?? "").includes("lemo"));
lemo ? ok("Lemo Opuscar") : aviso("Lemo Opuscar não encontrada (opcional, só para os estilos da Lemo)", "claude plugin marketplace add lemomo-ai/lemo-opuscar  e  claude plugin install lemo-opuscar@lemolab");

console.log("\n== Chaves (só confere se existem; nunca mostra) ==");
const env = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
const tem = (k) => new RegExp("^\\s*" + k + "\\s*=\\s*\\S+", "m").test(env);
if (!env) erro(".env.local não existe", "npx -y @elevenlabs/cli@latest onboard init   (ou copie .env.local.example e cole a chave você mesmo; nunca no chat)");
else tem("ELEVENLABS_API_KEY") ? ok("ELEVENLABS_API_KEY") : erro("ELEVENLABS_API_KEY vazia no .env.local", "cole a chave no .env.local você mesmo (nunca no chat)");
for (const k of ["FISH_API_KEY", "GEMINI_API_KEY", "GROQ_API_KEY"]) if (env) tem(k) ? ok(k + " (opcional)") : aviso(k + " vazia (opcional)");

console.log("\n" + (falhas ? `❌ ${falhas} item(ns) faltando` : "✅ Tudo pronto: abra o Claude Code aqui e peça \"Faz um Reel sobre X\"") + (avisos ? ` · ${avisos} opcional(is)` : ""));
process.exit(falhas ? 1 : 0);
