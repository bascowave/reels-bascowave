# Reels @bascowave: editor de vídeo com IA

Fábrica de Reels explicativos em **motion graphics**, feita com o **Claude Code**. Ninguém grava vídeo: você passa um
assunto (ou o link de uma documentação/artigo) e o Claude entrega o Reel pronto em **1080×1920, 30 fps**, com:

- roteiro conferido na fonte;
- cenas animadas na identidade **@bascowave** (logo de onda azul, fonte Sora);
- palavras que acendem no tempo exato da fala;
- narração em português (ElevenLabs, voz brasileira **Paulo**);
- efeitos sonoros encaixados no frame certo e volume medido.

> **Modelo usado:** Claude **Opus 5.5** com esforço (effort) **Low**, no Claude Code (app desktop, aba Code).

---

## Como funciona (o fluxo)

```
assunto/link ─► 1. pesquisa na fonte ─► 2. roteiro ─► 3. cards parados (você aprova)
            ─► 4. narração ElevenLabs (você aprova o custo) ─► 5. montagem automática
            ─► 6. conferência (quadros, ritmo, volume) ─► Vídeos prontos/AAAA-MM-DD_tema_bascowave.mp4
```

Tudo isso está empacotado na skill **`reel-bascowave`** (`.claude/skills/reel-bascowave/`). Você não precisa
decorar comandos: abra o Claude Code nesta pasta e peça em português.

### Os três formatos

| Formato | Estrutura | Texto na tela |
|---|---|---|
| **7 pontos** | gancho → "são 7" → 01…07 → pergunta → resumo | frase inteira no topo, palavras acendendo; contador 01/07 |
| **3 ferramentas** | gancho → contagem 3-2-1 → (destrava 01 → demo) ×3 → resumo | uma palavra por vez embaixo; cartões que destravam; "DESBLOQUEADO 1/3" |
| **Editorial claro** | gancho → "4 truques" → (capítulo "truque n de 4" → explicação) ×4 → dica → resumo | fundo de papel, linha em serifa itálica + palavra-chave com marca-texto azul |

Alterne entre eles para o perfil não ficar repetitivo.

---

## O que instalar

### 1. Programas (Windows: `winget`; Mac: `brew`)

| Programa | Versão | Para quê | Windows |
|---|---|---|---|
| **Claude Code** | atual | o editor (app Claude desktop → aba Code, ou CLI) | [claude.com/claude-code](https://claude.com/claude-code) |
| **Node.js** | 22+ | HyperFrames (render) e SDK do ElevenLabs | `winget install OpenJS.NodeJS.LTS` |
| **Python** | 3.11+ | scripts de sincronia, efeitos e Earshot | `winget install Python.Python.3.12` |
| **ffmpeg** (com ffprobe) | 6+ | cortar, juntar, medir e exportar | `winget install Gyan.FFmpeg` |
| **uv** | atual | instala o Earshot | `winget install astral-sh.uv` |
| **yt-dlp** | atual | baixa Reels de referência | `winget install yt-dlp.yt-dlp` |
| **git** + **gh** | atual | versionar e publicar | `winget install Git.Git GitHub.cli` |

### 2. Skills do Claude Code (instalar no nível do usuário, `~/.claude/skills`)

| Skill | Para quê | Como instalar |
|---|---|---|
| **claude-video** | scripts do HyperFrames (`render.sh`, `frames.sh`, `ritmo.py`) | conforme o instalador da skill (`bash instalar.sh`) |
| **sound-effects** | encaixa os efeitos e mede o volume | `npx skills add Barty-Bart/motion-graphics -g -a claude-code --skill sound-effects` |
| **watch** | "assiste" a um Reel de referência (quadros + transcrição) | `npx skills add bradautomates/claude-video -g -a claude-code --skill watch` |
| **reel-bascowave** | o processo inteiro (já vem neste repositório) | nada a fazer: está em `.claude/skills/` |

Opcionais do mesmo kit (já testados aqui): `video-use` (corte de vídeo gravado), `get-brolls` (b-roll),
`object-separation` (recorte sem tela verde), `remotion-motion-graphics`.

### 3. Earshot (sons gerados em código, local e grátis)

```bash
uv tool install "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot"
```

Usamos só `earshot sfx` (banco de sons pronto), que **não** precisa dos modelos de 1,1 GB. Para os comandos que
"escutam" (`describe`, `critique`), rode `earshot doctor --fetch`.

### 4. Dependências deste projeto

```bash
npm install                                   # SDK do ElevenLabs (e Remotion)
python -m venv ferramentas/.sound-effects     # ambiente dos efeitos
ferramentas/.sound-effects/Scripts/pip install librosa soundfile numpy scipy matplotlib
```

A biblioteca de sons CC0 já vem em `ferramentas/sfx/` (copiada da skill sound-effects).

### 5. Contas e chaves (nunca cole chave no chat nem suba no git)

| Serviço | Plano | Para quê | Como configurar |
|---|---|---|---|
| **ElevenLabs** | **Starter** (as vozes brasileiras da Voice Library não funcionam no grátis) | narração | `npx -y @elevenlabs/cli@latest onboard init` → grava a chave em `.env.local` |
| **Groq** | grátis | transcrição da skill watch | colar `GROQ_API_KEY=` em `~/.config/watch/.env` |
| **Openverse** | grátis, sem chave | sons CC0 novos a cada Reel | nada |

---

## Como usar

1. Abra a pasta do projeto no Claude Code e selecione **Opus 5.5**, esforço **Low**.
2. Peça, por exemplo:
   - *"Faz um Reel sobre os subagentes do Claude Code, formato 3 ferramentas."*
   - *"Transforma este artigo em Reel: https://…"*
3. O Claude mostra o **roteiro** e depois os **cards parados**. Aprove ou peça ajustes.
4. Ele diz **quantos caracteres** a narração vai gastar. Só narra depois do seu "sim".
5. A montagem roda sozinha e o vídeo aparece em **`Vídeos prontos/`**.
6. Ouça de fone as palavras de risco que ele listar (termos em inglês, "Claude") e peça para regerar só a fala
   que soar estranha.

### Comandos por baixo (se quiser rodar à mão)

```bash
# narração (voz Paulo, stability 0.7)
STABILITY=0.7 npm run narrar -- reels/<pasta>/voz/falas.txt reels/<pasta>/voz-el Qrdut83w0Cr152Yb4Xn3

# sincroniza, renderiza, efeitos, mixa, confere e copia para Vídeos prontos
bash .claude/skills/reel-bascowave/scripts/montar.sh reels/<pasta> <tema>_bascowave
#   OPENVERSE=impact  bash …   → troca a batida dos selos por um som CC0 novo do Openverse

# prévia no navegador (abrir http://localhost:8791/<pasta>/proj/index.html?play)
python -m http.server 8791 --directory reels
```

---

## Estrutura de pastas

| Pasta | O que guarda |
|---|---|
| `reels/AAAA-MM-DD_<tema>/` | trabalho de cada Reel: `proj/` (HTML das cenas), `voz/` (falas), `voz-el/` (narração), `som/`, `out/` |
| `Vídeos prontos/` | só os MP4 finais (fora do git) |
| `marca/` | logo @bascowave |
| `Referências/` | Reels de referência baixados (fora do git: são de outros criadores) |
| `ferramentas/` | sons CC0 e ambiente Python dos efeitos |
| `.claude/skills/reel-bascowave/` | a skill: `SKILL.md`, `modelo/`, `modelo-ferramentas/`, `scripts/` |
| `arquivo/` | projetos antigos (fora do git) |
| `narrar.mjs` | script de narração com o SDK do ElevenLabs |

---

## Regras da casa

- **Identidade própria.** Os formatos vieram de referências de outros criadores; copiamos o **método**, nunca
  marca, texto, cores ou mascote deles.
- **Créditos custam dinheiro.** Nada de amostras ou testes de voz sem avisar o custo antes.
- **Conteúdo conferido na fonte.** Cada afirmação do Reel tem que estar na documentação usada.
- **Som:** pop original nas palavras que acendem; whoosh de onda (Earshot) nas trocas de cena. Só sons CC0
  ou gerados por nós; a origem de cada um fica em `som/out/CREDITS.txt`.
- **Volume:** −16 LUFS, pico abaixo de −4 dBFS, medido no MP4 final.

## Créditos

- Feito com [Claude Code](https://claude.com/claude-code), modelo **Claude Opus 5.5** (esforço Low).
- Render: [HyperFrames](https://hyperframes.heygen.com) + GSAP. Narração: [ElevenLabs](https://elevenlabs.io).
- Efeitos: skill [sound-effects](https://github.com/Barty-Bart/motion-graphics) (CC0),
  [Earshot](https://github.com/Leonxlnx/earshot) (MIT), [Openverse](https://openverse.org) (CC0).
- Referência: [watch](https://github.com/bradautomates/claude-video) + Groq Whisper.
