# Instalar a fábrica de Reels (guia para o agente)

> **Para quem chegou agora:** abra o Claude Code numa pasta vazia e cole:
> *"Instala o https://github.com/bascowave/reels-bascowave seguindo o INSTALAR.md e roda `npm run checar` no final."*

Este arquivo é para o **Claude Code (ou outro agente)** seguir. Faça na ordem, mostre ao usuário o que vai instalar
antes de cada passo e, no fim, rode `npm run checar` até não sobrar nenhum ❌.

## Regras para o agente
- **Chaves de API nunca no chat.** Não peça para o usuário colar chave na conversa e não mostre chave na tela.
  Crie o `.env.local` (copiando `.env.local.example`) e diga ao usuário para colar a chave **no arquivo**, ou use
  `npx -y @elevenlabs/cli@latest onboard init`, que grava a chave sozinho.
- Não instale nada que não esteja aqui sem perguntar. Pergunte antes de cada `winget`/`brew`.
- Opcional é opcional: Fish, Gemini, Groq e Lemo Opuscar podem ficar para depois.
- Comandos abaixo são para **Windows (PowerShell ou Git Bash)**. No Mac, use os equivalentes com `brew`
  (`brew install node python ffmpeg uv yt-dlp git gh`) e `ferramentas/.sound-effects/bin/pip` no passo 3.

## Passos

**1. Programas** (pule os que já existem; `npm run checar` mostra quais faltam)
```bash
winget install OpenJS.NodeJS.LTS Python.Python.3.12 Gyan.FFmpeg astral-sh.uv yt-dlp.yt-dlp Git.Git GitHub.cli
```
Precisa também do Google Chrome (o render usa) e do Claude Code. Depois de instalar, **feche e reabra o terminal**.

**2. Projeto**
```bash
git clone https://github.com/bascowave/reels-bascowave.git
cd reels-bascowave
npm install
```

**3. Ambiente Python dos efeitos sonoros**
```bash
python -m venv ferramentas/.sound-effects
ferramentas/.sound-effects/Scripts/pip install librosa soundfile numpy scipy matplotlib
```

**4. Skills do Claude Code** (vão para `~/.claude/skills`; a `reel-bascowave` já vem no projeto)
```bash
git clone --depth 1 https://github.com/Felpborges/claude-video ~/.claude/skills/claude-video
npx skills add Barty-Bart/motion-graphics -g -a claude-code --skill sound-effects
npx skills add bradautomates/claude-video -g -a claude-code --skill watch
```
Opcional (estilos da Lemo Opuscar):
```bash
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

**5. Chave do ElevenLabs** (narração; obrigatória)
```bash
npx -y @elevenlabs/cli@latest onboard init
```
Se preferir à mão: `cp .env.local.example .env.local` e o usuário cola `ELEVENLABS_API_KEY=` **no arquivo**.
Opcionais no mesmo arquivo: `FISH_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`.

**6. Conferir**
```bash
npm run checar
```
Corrija cada ❌ com o comando que aparece embaixo dele e rode de novo. ⚠️ é opcional.
Quando terminar com "✅ Tudo pronto", diga ao usuário: *abra uma conversa nova nesta pasta e peça "Faz um Reel sobre X"*.

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| `ffmpeg`/`node` "não encontrado" logo depois do winget | terminal antigo sem o PATH novo | fechar e reabrir o terminal |
| `python3` abre a Microsoft Store | atalho do Windows | usar `python` (sem o 3) |
| render falha com "/tmp" no Git Bash | o Git Bash não tem `/tmp` no disco certo | `mkdir -p /d/tmp` (o `montar.sh` já faz) |
| ambiente dos efeitos "sem librosa" | pip rodou fora do venv | usar `ferramentas/.sound-effects/Scripts/pip` |
| narração dá erro 401 | chave vazia ou com espaço no `.env.local` | conferir a linha `ELEVENLABS_API_KEY=` no arquivo |
