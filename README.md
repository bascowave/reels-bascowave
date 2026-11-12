<p align="center">
  <img src="marca/logo.png" alt="@bascowave" width="120">
</p>

<h1 align="center">@bascowave · fábrica de Reels com IA</h1>

<p align="center">
  <b>Você manda um assunto. A IA entrega o Reel pronto.</b><br>
  Sem câmera, sem gravar voz, sem abrir editor de vídeo.
</p>

<p align="center">
  <img alt="1080×1920 · 30 fps" src="https://img.shields.io/badge/Reel-1080%C3%971920%20%C2%B7%2030%20fps-34B5DF?style=for-the-badge">
  <img alt="Claude Opus 5.5 Low" src="https://img.shields.io/badge/Claude-Opus%205.5%20%C2%B7%20Low-111114?style=for-the-badge">
  <img alt="voz Paulo" src="https://img.shields.io/badge/voz-Paulo%20(ElevenLabs)-34B5DF?style=for-the-badge">
  <img alt="agentes" src="https://img.shields.io/badge/agentes-OpenBot%20ready-3ecf6e?style=for-the-badge">
</p>

<p align="center">
  🌊 <a href="https://bascowave.github.io"><b>Ver a landing page → bascowave.github.io</b></a>
</p>

---

## A ideia

O **@bascowave** fala de IA e ferramentas para quem trabalha com tecnologia. Eu não gravo vídeo: escolho o assunto (ou
mando o link de uma documentação, de uma notícia, de um post) e a IA faz o resto:

1. **lê a fonte** e confere cada fato;
2. escreve o **roteiro** (eu aprovo);
3. desenha as cenas em **motion graphics** e me mostra o **storyboard** de cada tela (eu aprovo);
4. narra com a **voz do Paulo** (ElevenLabs, em português);
5. compõe a **trilha**, encaixa os **efeitos sonoros**, mixa e **confere** quadro a quadro;
6. entrega o MP4 em `Vídeos prontos/`.

Tudo roda no meu computador, com o **Claude Code** (modelo **Claude Opus 5.5**, esforço **Low**) — ou com uma
**equipe de agentes no OpenBot** seguindo o mesmo manual.

## O que já saiu daqui

| Data | Reel | Formato · motor |
|---|---|---|
| 2026-11-10 | Hooks do Claude Code | 7 pontos · HyperFrames |
| 2026-11-10 | Claude no automático | 3 ferramentas · HyperFrames |
| 2026-11-10 | 4 truques de memória do Claude | Editorial claro · HyperFrames |
| 2026-11-10 | PHP2Shell: falha crítica no PHP | Caption News · Lemo Opuscar |
| 2026-11-11 | OpenBot: sua equipe de agentes | Living Screencast · Lemo Opuscar |

## Os visuais

Cinco estilos para o perfil não ficar repetitivo — três nossos, na identidade @bascowave, e dois da biblioteca
[Lemo Opuscar](https://lemomo-ai.github.io/lemo-opuscar/), fiéis ao estilo, com a @bascowave só como assinatura.

| Estilo | Quando usar | Cara |
|---|---|---|
| **7 pontos** | explicar um recurso | frase no topo com palavras acendendo no tempo da fala; contador 01/07 |
| **3 ferramentas** | três comandos ou apps | contagem 3-2-1, cartões que destravam, "DESBLOQUEADO 1/3" |
| **Editorial claro** | dicas, tom de revista | fundo de papel, serifa itálica, marca-texto azul |
| **Caption News** | notícia (falha, lançamento) | página oficial em close, números grandes, legenda de telejornal |
| **Living Screencast** | mostrar um app funcionando | interface redesenhada, cursor = você, mascote de pixels = o app |

Quer outro? A Lemo tem 68 estilos, e o **banco de estilos** (`Referências/banco-de-estilos/`) guarda 84 efeitos
tirados de Reels de outros criadores, cada um com prompt.

## As regras da casa

- 💸 **Crédito é dinheiro.** A narração só é gerada depois que eu vejo quantos caracteres vai gastar e digo "sim".
- ✅ **Duas aprovações sempre:** roteiro e storyboard em HTML (imagem, texto, fala e efeitos de cada cena).
- 🔎 **Nada inventado.** Todo fato do Reel está na fonte lida.
- 🌊 **Identidade própria.** Copiamos o método das referências, nunca marca, texto ou cores de outro criador.
- 🎞️ **Imagem com sentido.** Nada de filmagem genérica: a imagem mostra o assunto.
- ✂️ **Ajuste cirúrgico.** Mudou uma cena? Renderiza só ela e emenda no vídeo pronto.
- 🔊 **Som medido:** −16 LUFS, pico abaixo de −4 dBFS, nenhum trecho parado mais de 1 s.

---

## Para bots e agentes 🤖

Se você é um agente (Claude Code, OpenBot ou outro) e vai produzir um Reel neste repositório, comece aqui.

**Leia, nesta ordem, antes de qualquer comando:**

1. [`CLAUDE.md`](CLAUDE.md) — regras do projeto e onde salvar cada arquivo (vale sobre tudo).
2. [`.claude/skills/reel-bascowave/MANUAL-OPENBOT.md`](.claude/skills/reel-bascowave/MANUAL-OPENBOT.md) — o manual
   completo: equipe, fluxo, comandos de cada etapa, conferência, ajuste parcial, problemas conhecidos.
3. [`.claude/skills/reel-bascowave/SKILL.md`](.claude/skills/reel-bascowave/SKILL.md) — detalhes dos três formatos
   próprios (motor HyperFrames).

**Contrato em uma tela:**

| | |
|---|---|
| Raiz | a pasta onde você clonou o repositório (com espaço ou acento: sempre entre aspas) |
| Shell | Git Bash no Windows |
| Pasta de cada Reel | `reels/AAAA-MM-DD_<tema>/` |
| Saída final | `Vídeos prontos/AAAA-MM-DD_<tema>_bascowave.mp4` + cópia `-leve.mp4` para celular |
| Rascunhos | fora do projeto (pasta temporária), nunca na raiz |
| Pare e pergunte ao dono | depois do roteiro · depois do storyboard (com o nº de caracteres) · antes de regerar qualquer fala · diante de qualquer problema novo |
| Nunca | imprimir/copiar chaves (`.env.local`, `~/.config/watch/.env`) · narrar sem "sim" · inventar fato · refazer o vídeo inteiro por um ajuste · `git push` sem pedido |
| Você não ouve áudio | sempre liste as palavras de risco de pronúncia para o dono conferir |

**Equipe sugerida no OpenBot** (instruções prontas para colar no manual, seção 3):

```
Diretor (fala com o dono, pede as aprovações)
 ├─ Pesquisador  → FONTES.md
 ├─ Roteirista   → ROTEIRO.md, falas.txt
 ├─ Animador     → cenas / página, storyboard.html
 └─ Montador     → narração, render, trilha, efeitos, mix, conferência, entrega
```

**Os comandos que mais importam:**

```bash
# narração — SÓ depois do "sim" (voz Paulo, estabilidade 0.7)
STABILITY=0.7 npm run narrar -- reels/<pasta>/falas.txt reels/<pasta>/voz-el Qrdut83w0Cr152Yb4Xn3

# motor HyperFrames (formatos próprios): sincroniza, renderiza, efeitos, mixa, confere e entrega
bash .claude/skills/reel-bascowave/scripts/montar.sh reels/<pasta> <tema>-bascowave

# motor Lemo (Caption News, Living Screencast…): quadros, vídeo e eventos
cd ~/lemo-opuscar && node core/render/video.mjs "<pasta absoluta>" --fps 30 --size 1080x1920 --out "<pasta>/out/video.mp4"

# conferência
python ~/.claude/skills/claude-video/scripts/ritmo.py reels/<pasta>/out/<tema>_bascowave.mp4
```

Os exemplos completos de cada motor ficam só no computador da produção (a pasta `reels/` não sobe para o
GitHub): `reels/2026-11-10_php2shell/` (Caption News) e `reels/2026-11-11_openbot/` (Living Screencast).

---

## Instalação (passo a passo)

> Atalho: abra o Claude Code numa pasta vazia, cole o link deste repositório e diga *"instala esse projeto
> seguindo o README"*. Ele faz os passos abaixo e pergunta antes de instalar cada programa.

**1. Programas** (Windows, no PowerShell; detalhes na tabela abaixo)

```bash
winget install OpenJS.NodeJS.LTS Python.Python.3.12 Gyan.FFmpeg astral-sh.uv yt-dlp.yt-dlp Git.Git GitHub.cli
```

Instale também o **Claude Code** ([claude.com/claude-code](https://claude.com/claude-code)) e feche/reabra o terminal.

**2. Baixar o projeto**

```bash
git clone https://github.com/bascowave/reels-bascowave.git
cd reels-bascowave
npm install
```

**3. Ambiente dos efeitos sonoros**

```bash
python -m venv ferramentas/.sound-effects
ferramentas/.sound-effects/Scripts/pip install librosa soundfile numpy scipy matplotlib
```

**4. Skills do Claude Code** (ficam em `~/.claude/skills`; a `reel-bascowave` já vem no projeto)

```bash
git clone --depth 1 https://github.com/Felpborges/claude-video ~/.claude/skills/claude-video
bash ~/.claude/skills/claude-video/scripts/checar.sh
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
npx skills add Barty-Bart/motion-graphics -g -a claude-code --skill sound-effects
npx skills add bradautomates/claude-video -g -a claude-code --skill watch
```

Na primeira vez que pedir um Reel no estilo da Lemo, ela baixa a biblioteca em `~/lemo-opuscar` sozinha.

**5. Chave do ElevenLabs** (cria o `.env.local`; nunca cole a chave no chat)

```bash
npx -y @elevenlabs/cli@latest onboard init
```

Opcional: chave grátis do Groq em `~/.config/watch/.env` (`GROQ_API_KEY=`) para a skill `watch`.

**6. Testar:** abra a pasta no Claude Code, abra uma conversa nova e peça *"Faz um Reel sobre X"*.
Se ele mostrar o roteiro para aprovar, está tudo certo.

### Atualizar 🔄

Quando sair versão nova (veja em [Releases](https://github.com/bascowave/reels-bascowave/releases)), rode na pasta do projeto:

```bash
git pull
npm install
```

Se você fez **fork**, clique antes em **Sync fork** na página do seu fork.
Quer ser avisado? Clique em **Watch → Custom → Releases** no topo do repositório.

---

## Para humanos: o que cada peça faz

### Programas

| Programa | Para quê | Windows |
|---|---|---|
| **Claude Code** | o editor (app Claude desktop → aba Code, ou CLI) | [claude.com/claude-code](https://claude.com/claude-code) |
| **Node.js** 22+ | HyperFrames, Lemo e SDK do ElevenLabs | `winget install OpenJS.NodeJS.LTS` |
| **Python** 3.11+ | sincronia, trilha, efeitos | `winget install Python.Python.3.12` |
| **ffmpeg** 7+ | cortar, emendar, mixar, medir | `winget install Gyan.FFmpeg` |
| **uv** | ambientes Python das skills | `winget install astral-sh.uv` |
| **yt-dlp** | baixar referências | `winget install yt-dlp.yt-dlp` |
| **git** + **gh** | versionar | `winget install Git.Git GitHub.cli` |
| **OpenBot** (opcional) | rodar a equipe de agentes | [openbot.run](https://openbot.run) |

### Skills do Claude Code (`~/.claude/skills`)

| Skill | Para quê |
|---|---|
| **claude-video** | HyperFrames (`render.sh`, `frames.sh`) e a checagem de ritmo (`ritmo.py`) |
| **lemo-opuscar** | estilos da Lemo; a biblioteca fica em `~/lemo-opuscar` |
| **sound-effects** | efeitos CC0 e medição de volume (`npx skills add Barty-Bart/motion-graphics -g -a claude-code --skill sound-effects`) |
| **watch** | "assistir" vídeos de referência (`npx skills add bradautomates/claude-video -g -a claude-code --skill watch`) |
| **reel-bascowave** | o processo inteiro — já vem neste repositório, em `.claude/skills/` |

### Dependências do projeto

```bash
npm install                                    # SDK do ElevenLabs
python -m venv ferramentas/.sound-effects      # ambiente dos efeitos
ferramentas/.sound-effects/Scripts/pip install librosa soundfile numpy scipy matplotlib
```

### Contas e chaves (nunca no chat, nunca no git)

| Serviço | Plano | Onde fica a chave |
|---|---|---|
| **ElevenLabs** | Starter (vozes brasileiras) | `.env.local` — criada por `npx -y @elevenlabs/cli@latest onboard init` |
| **Groq** | grátis | `~/.config/watch/.env` (`GROQ_API_KEY=`) |

### Usar

Abra a pasta no Claude Code (Opus 5.5, esforço Low) e peça em português:

> *"Faz um Reel sobre os subagentes do Claude Code, formato 3 ferramentas."*
> *"Transforma essa notícia em Reel: https://…"*

Ele mostra o roteiro, depois o storyboard e o custo da narração. Você aprova, ele entrega em `Vídeos prontos/`.

## Estrutura

```
.
├── CLAUDE.md                      regras do projeto (agentes leem primeiro)
├── narrar.mjs                     narração ElevenLabs com tempo de cada palavra
├── .claude/skills/reel-bascowave/
│   ├── SKILL.md                   processo e formatos próprios
│   ├── MANUAL-OPENBOT.md          manual para equipe de agentes
│   ├── modelo/ modelo-ferramentas/ modelo-editorial/
│   └── scripts/                   montar.sh, sincronizar.py, storyboard.py…
├── reels/AAAA-MM-DD_<tema>/       cada Reel (só no computador, não sobe)
├── marca/                         logo @bascowave
├── ferramentas/                   sons CC0 + ambiente Python
├── Referências/                   referências e banco de estilos   (fora do git)
├── Vídeos prontos/                MP4 finais                       (fora do git)
└── arquivo/                       projetos antigos                 (fora do git)
```

Vídeos, áudios, quadros de filmagem e chaves ficam só no computador (`.gitignore`).

## Contribuir 🤝

Ideias, correções e formatos novos são bem-vindos! Abra uma [Issue](https://github.com/bascowave/reels-bascowave/issues/new/choose)
ou mande um Pull Request; leia antes o [CONTRIBUTING.md](CONTRIBUTING.md). Código sob [licença MIT](LICENSE)
(o logo e a identidade @bascowave ficam de fora).

### Quem já contribuiu 💙

| | Quem | O que trouxe |
|---|---|---|
| <img src="https://github.com/gabedsam01.png" width="48" alt="gabedsam01"> | **Gabriel Sampaio de Souza** ([@gabedsam01](https://github.com/gabedsam01)) | Narração alternativa com Fish Audio e Gemini TTS, catálogo de vozes, `--dry-run` de custo e timestamps por palavra com Groq Whisper ([#1](https://github.com/bascowave/reels-bascowave/pull/1), [#2](https://github.com/bascowave/reels-bascowave/pull/2)) |

## Créditos

- [Claude Code](https://claude.com/claude-code) · modelo **Claude Opus 5.5**, esforço Low.
- Render: [HyperFrames](https://hyperframes.heygen.com) + GSAP · [Lemo Opuscar](https://github.com/lemomo-ai/lemo-opuscar).
- Voz: [ElevenLabs](https://elevenlabs.io) (Paulo).
- Som: kit CC0 da [sound-effects](https://github.com/Barty-Bart/motion-graphics), [Openverse](https://openverse.org) (CC0), trilhas compostas em código.
- Referências: [watch](https://github.com/bradautomates/claude-video) + Groq Whisper.
- Agentes: [OpenBot](https://openbot.run).

<p align="center"><sub>feito por <b>@bascowave</b> 🌊</sub></p>
