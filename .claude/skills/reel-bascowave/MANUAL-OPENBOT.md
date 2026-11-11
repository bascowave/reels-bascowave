# Manual de produção de Reels @bascowave — para agentes do OpenBot

Este manual ensina uma equipe de agentes do OpenBot a produzir um Reel da @bascowave do começo ao fim, do mesmo jeito
que o Claude Code faz hoje. Ele é a fonte de verdade para os agentes: leia inteiro antes do primeiro Reel e volte a ele
sempre que tiver dúvida. Se algo aqui contradisser o `CLAUDE.md` ou o `SKILL.md` do projeto, **o `CLAUDE.md` vale**.

Escrito em 2026-11-11, a partir dos Reels já entregues (Hooks, Claude no automático, Memória, PHP2Shell, OpenBot).

---

## 0. Antes de tudo: as 8 regras que não se negociam

1. **Créditos do ElevenLabs são pagos.** Nunca gerar voz sem antes dizer ao dono quantos caracteres vai gastar e
   receber um "sim" explícito. Nada de amostra, teste de voz ou "só pra ver". Regerar uma fala também pede aprovação.
2. **Duas aprovações obrigatórias do dono, sempre, nesta ordem:** (a) o **roteiro**; (b) o **storyboard em HTML**
   (imagem + texto na tela + fala + efeitos de cada cena) junto com o custo da narração. Só depois narrar.
   Imagens soltas não contam como storyboard.
3. **Fazer só o que foi aprovado.** Encontrou um problema novo no caminho? Mostre e pergunte antes de agir. Fazer certo
   sem pedir também é errado.
4. **Conteúdo conferido na fonte.** Cada afirmação do roteiro tem que estar no link, na documentação ou no vídeo que
   foi lido. Nunca inventar recurso, comando, número ou preço.
5. **Identidade @bascowave** (logo onda azul em `marca/logo.png`, azul `#34B5DF`). Nunca a identidade de criadores de
   referência (ex.: @gustagoat.ai). Quando o estilo vem da Lemo, **o estilo manda no visual** e a @bascowave entra só
   como assinatura (selo/logo e @).
6. **Imagem tem que ter a ver com o assunto.** Nada de filmagem genérica (no Reel do PHP, imagens da NASA foram
   reprovadas). Prefira o próprio produto, a página oficial, o código ou a interface redesenhada.
7. **Ajuste em vídeo pronto = refazer só o trecho.** Renderizar apenas os quadros da cena alterada e emendar no vídeo
   (seção 9). Nunca refazer o vídeo inteiro para mudar uma cena.
8. **Segredos nunca aparecem.** A chave do ElevenLabs fica em `.env.local` e a do Groq em `~/.config/watch/.env`.
   Nunca imprimir, copiar para outro arquivo, colar no chat ou passar em linha de comando.

---

## 1. Onde fica cada coisa

**Raiz do projeto:** a pasta onde o repositório foi clonado. Neste manual ela é `$RAIZ`; defina uma vez no Git Bash,
ex.: `RAIZ="$HOME/reels-bascowave"`. Se o caminho tiver espaço ou acento: **sempre entre aspas**.

> Importante para o OpenBot: cada agente começa na própria pasta `~/OpenBot/Agents/<id-do-agente>`, não no projeto.
> Por isso todo comando deste manual usa caminho absoluto ou começa com `cd "$RAIZ"`.
> Também por isso o `CLAUDE.md` e a skill do projeto **não são carregados sozinhos**: o agente precisa lê-los
> (seção 3). Não crie nada em `~/OpenBot/Shared` além de recados entre agentes; o trabalho vai para o projeto.

| O quê | Onde |
|---|---|
| Regras do projeto | `CLAUDE.md` (raiz) |
| Processo completo (skill) | `.claude/skills/reel-bascowave/SKILL.md` |
| Este manual | `.claude/skills/reel-bascowave/MANUAL-OPENBOT.md` |
| Modelos do motor HyperFrames | `.claude/skills/reel-bascowave/modelo/` (7 pontos), `modelo-ferramentas/` (3 ferramentas), `modelo-editorial/` (Editorial claro) |
| Scripts do motor HyperFrames | `.claude/skills/reel-bascowave/scripts/` (`montar.sh`, `sincronizar.py`, `gerar_cues.py`, `kit_som.py`, `storyboard.py`) |
| Narração | `narrar.mjs` (raiz), chamado por `npm run narrar` |
| Chave do ElevenLabs | `.env.local` (raiz) — não abrir, não imprimir |
| Trabalho de um Reel | `reels/AAAA-MM-DD_<tema>/` |
| Vídeo final | `Vídeos prontos/AAAA-MM-DD_<tema>_bascowave.mp4` |
| Logo | `marca/logo.png` |
| Banco de estilos (84 efeitos com prompt) | `Referências/banco-de-estilos/estilos.json` e `banco-de-estilos.html` |
| Reels de referência baixados | `Referências/<nome>/` |
| Sons CC0 e ambiente dos efeitos | `ferramentas/sfx/` e `ferramentas/.sound-effects/` (não apagar) |
| Vídeo gravado pelo dono (raro) | `Vídeo bruto/` |
| Projetos antigos | `arquivo/` |
| Biblioteca Lemo Opuscar | `~/lemo-opuscar` |
| Skills do usuário (watch, claude-video, sound-effects, lemo-opuscar…) | `~/.claude/skills/` |

**Dentro de um Reel** (`reels/AAAA-MM-DD_<tema>/`):

| Pasta/arquivo | Conteúdo |
|---|---|
| `FONTES.md` | links lidos e os fatos, cada um com a frase da fonte |
| `ROTEIRO.md` | tabela cena · tela · fala (o que o dono aprova) |
| `proj/` | só no motor HyperFrames: o HTML das cenas |
| `index.html`, `main.js`, `timeline.json`, `fonts/`, `logo.png` | só no motor Lemo: a página do filme |
| `falas.txt` (Lemo) ou `voz/falas.txt` (HyperFrames) | uma fala por linha, na ordem das cenas |
| `voz-el/` | saída do ElevenLabs: `falaN.mp3` + `falaN.json` (tempo de cada palavra) |
| `voz/` | `narracao.wav` montada no tempo das cenas |
| `som/` | `trilha.wav`, `efeitos.wav`, cues, kit |
| `storyboard/storyboard.html` | o storyboard para aprovação |
| `out/` | `video.mp4` (só imagem), `<tema>_bascowave.mp4` (final), `-leve.mp4` (para celular) |

**Não criar pastas fora desta tabela.** Testes, quadros de conferência e rascunhos vão para uma pasta temporária
(ex.: `D:/tmp/<tema>`), nunca na raiz do projeto.

---

## 2. Ferramentas e para que serve cada uma

Todas já estão instaladas no computador (conferido em 2026-11-11: Node 24, ffmpeg 9, Python 3.12, uv).

| Ferramenta | Para que | Como chamar |
|---|---|---|
| Navegador do agente / `curl` / `gh` | ler a fonte (site, docs, GitHub) | `gh api repos/<dono>/<repo>/readme --jq .content \| base64 -d` |
| Skill **watch** | baixar e "assistir" um vídeo (quadros + transcrição) | `python ~/.claude/skills/watch/scripts/watch.py "<url>" --question "<pergunta>" --detail efficient --out-dir "D:/tmp/<tema>"` |
| **ElevenLabs** (`narrar.mjs`) | narração, voz Paulo, com o tempo de cada palavra | seção 6 |
| **HyperFrames** (skill claude-video) | motor dos 3 formatos próprios | `~/.claude/skills/claude-video/scripts/render.sh`, `frames.sh` (o `montar.sh` chama) |
| **Lemo Opuscar** | motor dos estilos da biblioteca Lemo (Caption News, Living Screencast…) | `cd ~/lemo-opuscar && node core/render/<still\|video\|events>.mjs "<pasta>" …` |
| Python da Lemo | trilha e efeitos dos Reels Lemo (numpy, scipy, soundfile) | `~/lemo-opuscar/.venv/Scripts/python.exe` |
| Skill **sound-effects** + `ferramentas/sfx` | efeitos CC0 do motor HyperFrames | o `montar.sh` chama |
| Kit de sons `ferramentas/sfx/kit/` | `click`, `pop`, `tick`, `whoosh`, `impact`, `riser` (aprovados) | `efeitos.py` dos Reels Lemo |
| **ffmpeg / ffprobe** | mixar, medir volume, folhas de quadros, emendas | seções 7–9 |
| `ritmo.py` (claude-video) | reprova trechos parados > 1 s e cortes < 0,3 s | `python ~/.claude/skills/claude-video/scripts/ritmo.py "<mp4>"` |
| Servidor de prévia | abrir storyboard e páginas no navegador | `python -m http.server 8791 --directory reels` (na raiz) → `http://localhost:8791/<pasta>/…` |

**Gosto do dono em som (já aprovado):** pop original do kit nas palavras-chave, whoosh original nas trocas de cena,
impacto nos selos/números. **Reprovados:** a "gota d'água" e o whoosh do Earshot; o "sol" chato quando a palavra fica
azul. Na dúvida, use só o kit.

---

## 3. A equipe no OpenBot

Recomendado: **5 agentes**, todos com o provedor **Claude Code** (modelo Opus, esforço Low; é o que o projeto usa).
Um coordenador fala com o dono; os outros só recebem tarefas dele. Um Reel por vez.

| Agente | Faz | Entrega |
|---|---|---|
| **Diretor** (coordenador) | recebe o pedido do dono, escolhe formato e motor, distribui, junta, **pede as duas aprovações**, entrega | mensagens ao dono, decisões |
| **Pesquisador** | lê a fonte, assiste o vídeo, confere fatos | `FONTES.md` |
| **Roteirista** | roteiro, falas, revisão de pronúncia | `ROTEIRO.md`, `falas.txt` |
| **Animador** | cenas (HyperFrames) ou página (Lemo), quadros, storyboard | `proj/` ou `main.js`…, `storyboard.html` |
| **Montador** | narração (após o sim), sincronia, render, trilha, efeitos, mix, conferência, entrega, ajustes parciais | `out/…mp4`, `Vídeos prontos/…` |

Equipe enxuta (mais barata): Diretor + um agente "Produtor" que faz Pesquisa, Roteiro, Animação e Montagem.

### Instruções para colar em cada agente

Cole o bloco comum em **todos** e depois o bloco do papel.

**Bloco comum (todos):**
```
Você trabalha na fábrica de Reels da @bascowave. O projeto fica em "<RAIZ>" (troque <RAIZ> pelo caminho da
pasta do projeto ao colar; use sempre aspas). Antes de qualquer tarefa, leia nesta ordem:
1) "<RAIZ>/CLAUDE.md"
2) "<RAIZ>/.claude/skills/reel-bascowave/MANUAL-OPENBOT.md" (este manual, inteiro)
3) "<RAIZ>/.claude/skills/reel-bascowave/SKILL.md"
Use o Git Bash para os comandos. Fale em português do Brasil, simples. Nunca abra nem imprima .env.local ou chaves.
Nunca gere voz no ElevenLabs sem o Diretor confirmar que o dono aprovou o custo. Faça só a tarefa recebida; se
encontrar um problema novo, avise o Diretor em vez de resolver por conta própria. Salve tudo dentro da pasta do
Reel informada pelo Diretor. Ao terminar, responda ao Diretor com: o que fez, os arquivos, o que conferiu e o que
não conseguiu conferir.
```

**Diretor:**
```
Você é o Diretor e o único que fala com o dono. Siga a seção 4 do manual (fluxo). Crie a pasta do Reel
(reels/AAAA-MM-DD_<tema>), escolha formato e motor (seção 5) e diga o porquê. Distribua as tarefas na ordem:
Pesquisador → Roteirista → (APROVAÇÃO 1: roteiro) → Animador → (APROVAÇÃO 2: storyboard + caracteres) →
Montador. Nas aprovações, mande ao dono o arquivo (ROTEIRO.md ou storyboard.html) e pergunte de forma direta,
com o número de caracteres da narração. Espere a resposta; não avance sem "sim". Na entrega, diga duração, volume,
checagens, caracteres gastos e as palavras de risco para ele ouvir. Anote pedidos de melhoria no fim do manual
(seção 12) quando o dono pedir para virar regra.
```

**Pesquisador:**
```
Você é o Pesquisador. Leia a fonte (site, README, documentação; vídeo com a skill watch) e escreva FONTES.md na
pasta do Reel: cada fato numa linha, com o link e a frase exata da fonte. Marque o que é preço, licença, limite ou
risco. Diga também o que a fonte NÃO diz (para ninguém inventar). Liste materiais visuais que tenham a ver com o
assunto (telas do produto, página oficial, código) e de onde vêm.
```

**Roteirista:**
```
Você é o Roteirista. A partir de FONTES.md, escreva ROTEIRO.md (tabela: nº · o que aparece na tela · fala) no
formato escolhido pelo Diretor, seguindo as regras de fala da seção 6 do manual. Uma ideia por fala. Conte os
caracteres de todas as falas e escreva o total no fim. Liste as palavras de risco de pronúncia. Depois da
aprovação, gere falas.txt (uma fala por linha, na ordem das cenas, sem linha vazia).
```

**Animador:**
```
Você é o Animador. Monte as cenas no motor escolhido (seção 7 para HyperFrames, seção 8 para Lemo), com tempos
provisórios. Renderize um quadro de cada cena, OLHE cada quadro (texto cortado, mascote/elemento cobrindo texto,
nada fora da área segura) e corrija antes de gerar o storyboard. Gere storyboard/storyboard.html e entregue ao
Diretor com a lista do que conferiu.
```

**Montador:**
```
Você é o Montador. Só narre depois que o Diretor confirmar a APROVAÇÃO 2 com o número de caracteres. Siga as
seções 6, 7/8 e 9 do manual: narração, sincronia, render, trilha, efeitos, mix, conferência. Olhe a folha de
quadros a cada 2 s. Se o ritmo reprovar, corrija só o trecho e emende (seção 9). Entregue em "Vídeos prontos" e
gere a cópia leve. Responda com duração, LUFS, pico, resultado do ritmo e o que não deu para conferir (você não
ouve áudio: sempre liste as palavras de risco).
```

### Configurações no OpenBot

- **Aprovações:** o Diretor pergunta no chat e espera. Se usar um Workflow do OpenBot, coloque um passo de
  aprovação depois do roteiro e outro depois do storyboard.
- **Permissões:** os agentes do OpenBot rodam com acesso total ao computador (`danger-full-access`, sem confirmação).
  Por isso as regras da seção 0 valem como trava. Mantenha backup do projeto (o GitHub `bascowave/reels-bascowave`).
- **Local scripts** (opcional, para disparar pelo terminal): ligar em Permissões do Diretor e usar
  `openbot-cli run "Diretor" "Faz um Reel sobre <assunto>: <link>" --wait`. O CLI fica em
  `%LOCALAPPDATA%\Programs\OpenBot\resources\cli\openbot-cli.mjs`. Código de saída 3 = o Diretor está esperando
  aprovação no app.
- **Um render por vez.** Dois renders da Lemo ou do HyperFrames ao mesmo tempo deixam tudo lento e podem falhar.

---

## 4. O fluxo de um Reel, passo a passo

| # | Etapa | Quem | Sai | Trava |
|---|---|---|---|---|
| 1 | Pedido do dono (assunto ou link) | Diretor | pasta `reels/AAAA-MM-DD_<tema>/` | — |
| 2 | Fonte e fatos | Pesquisador | `FONTES.md` | só fatos com fonte |
| 3 | Formato e motor | Diretor | decisão + porquê | seção 5 |
| 4 | Roteiro | Roteirista | `ROTEIRO.md` + total de caracteres | **APROVAÇÃO 1** |
| 5 | Cenas/página com tempos provisórios | Animador | `proj/` ou `main.js`… | olhar 1 quadro por cena |
| 6 | Storyboard HTML | Animador | `storyboard/storyboard.html` | **APROVAÇÃO 2** (com caracteres) |
| 7 | Narração | Montador | `voz-el/` | só após o sim |
| 8 | Sincronia → render → trilha → efeitos → mix | Montador | `out/<tema>_bascowave.mp4` | — |
| 9 | Conferência | Montador | LUFS, pico, ritmo, folha 2 s | refazer só o trecho se falhar |
| 10 | Entrega | Diretor | `Vídeos prontos/…`, cópia leve, relatório | palavras de risco |

Nome da pasta: data do dia + tema curto, minúsculo, com hífen: `reels/2026-11-11_openbot`.

---

## 5. Escolher formato e motor

Alterne para o perfil não repetir sempre o mesmo visual. Veja em `Vídeos prontos/` qual foi o último.

| Assunto | Formato | Motor |
|---|---|---|
| Explicar um recurso em vários pontos | **7 pontos** | HyperFrames (`modelo/`) |
| Três ferramentas/comandos | **3 ferramentas** | HyperFrames (`modelo-ferramentas/`) |
| Dicas/truques, tom de revista | **Editorial claro** | HyperFrames (`modelo-editorial/`) |
| Notícia (falha, lançamento, anúncio) | **Caption News** | Lemo (exemplo: `reels/2026-11-10_php2shell/`) |
| Mostrar um app/produto funcionando | **Living Screencast** | Lemo (exemplo: `reels/2026-11-11_openbot/`) |
| Outro estilo da Lemo (68 estilos) | ver galeria `https://lemomo-ai.github.io/lemo-opuscar/` e `~/lemo-opuscar/styles/<estilo>/STYLE.md` | Lemo |

Regras do motor Lemo: ler o `STYLE.md` do estilo inteiro antes de começar e segui-lo (paleta, fonte, câmera, som).
A @bascowave entra só como selo/assinatura. A interface de um produto é **redesenhada em HTML** com os nomes reais
(sem print, sem inventar botão).

---

## 6. Roteiro, falas e narração (ElevenLabs)

### Escrever as falas
- Uma ideia por fala, frase natural, português do Brasil. Uma fala por cena.
- Termo técnico em inglês: deixe na tela e diga em português quando der ("arquivo de configurações" em vez de
  "settings.json").
- **Nunca começar frase com "E" solto** (a voz diz "É"). Reescreva: "São sete coisas…".
- **Evitar "seguem"** (soou estranho).
- **Nada de fala de 2 palavras terminando em inglês** ("Vira hook" saiu com sotaque). Dê contexto: "Então
  transforma isso num hook."
- "Claude" escrito normal (aprovado). Mesmo assim, sempre listar como palavra de risco.
- Fim do vídeo: chamada curta ("Salva esse vídeo e…").

### Contar o custo
Total de caracteres = soma das falas (com espaços e pontuação). Exemplo:
```
cd "$RAIZ/reels/<pasta>" && python -c "print(sum(len(l.strip()) for l in open('falas.txt',encoding='utf-8') if l.strip()))"
```
O plano é Starter (39.147 caracteres no ciclo). Diga o número ao dono na Aprovação 2.

### Narrar (só depois do "sim")
```
cd "$RAIZ" && STABILITY=0.7 npm run narrar -- reels/<pasta>/falas.txt reels/<pasta>/voz-el Qrdut83w0Cr152Yb4Xn3
```
(No motor HyperFrames o arquivo é `reels/<pasta>/voz/falas.txt`.)
- Voz **Paulo** `Qrdut83w0Cr152Yb4Xn3`, modelo `eleven_v4`, `pt`, estabilidade **0,7** (aprovado).
- Sai `voz-el/falaN.mp3` + `voz-el/falaN.json` = `{texto, palavras:[{palavra, inicio, fim}]}`.
- **Regerar só uma fala** (com aprovação do custo): crie `falas-N.txt` só com ela, narre numa pasta temporária e
  copie `fala0.mp3/json` por cima de `voz-el/falaN.*`. Sotaque oscilando: `STABILITY=0.8` só nessa fala.

---

## 7. Motor HyperFrames (formatos 7 pontos, 3 ferramentas, Editorial claro)

O passo a passo detalhado de cada peça (`data-cap`, `*destaque*`, `!impacto!`, `data-at`, `.pop`, `.panel`…) está
no `SKILL.md`, seções "Formatos" e "Processo". Resumo dos comandos:

```
K="<RAIZ>/.claude/skills/reel-bascowave"
R="$RAIZ/reels/<pasta>"
mkdir -p "$R"/{voz,voz-el,som,out}
cp -r "$K/modelo" "$R/proj"            # ou modelo-ferramentas / modelo-editorial
# editar as cenas em "$R/proj/index.html" (tempos provisórios ~3,8 s por cena)
# falas em "$R/voz/falas.txt"
cd "$RAIZ" && python -X utf8 "$K/scripts/storyboard.py" "reels/<pasta>"   # → storyboard/storyboard.html
# APROVAÇÃO 2 → narrar (seção 6) → montar:
bash "$K/scripts/montar.sh" "reels/<pasta>" <tema>-bascowave
```
O `montar.sh` faz tudo em ordem: sincroniza as palavras pelo tempo real da fala, renderiza (HyperFrames, 30 fps),
gera os efeitos (kit + sound-effects), mixa (voz na frente, −16 LUFS, pico < −4 dBFS), roda o ritmo, gera
`out/quadros-2s.jpg` e **só copia para `Vídeos prontos/` se o ritmo passar e o pico estiver ≤ −4 dBFS**.
Variação de som por Reel: `OPENVERSE=impact bash montar.sh …` (só sons CC0; conferir a licença no `CREDITS.txt`).

Pontos de atenção:
- Fundo claro (Editorial) esconde movimento: cada cena precisa de algo entrando no 1º segundo.
- Ilustração entre y 640 e 1300; nada abaixo de 1300 (HUD) nem acima de 140.
- O `data-cap` precisa ter o mesmo número de palavras que a fala.

---

## 8. Motor Lemo Opuscar (Caption News, Living Screencast e outros)

### 8.1 Preparar a pasta
Comece de um Reel Lemo pronto que use o mesmo estilo (ou o mais parecido) e **reescreva** o que é do assunto:
```
cd "$RAIZ/reels"
mkdir -p <pasta>/{voz,voz-el,som,out,storyboard,fonts}
cp 2026-11-11_openbot/{index.html,main.js,sincronizar.py,trilha.py,efeitos.py,storyboard.py} <pasta>/   # Living Screencast
#   ou 2026-11-10_php2shell/... para Caption News
cp 2026-11-11_openbot/fonts/* <pasta>/fonts/ && cp "../marca/logo.png" <pasta>/logo.png
```
O que é genérico e quase não muda: `sincronizar.py`, `efeitos.py`, a estrutura do `storyboard.py`, o contrato da
página. **O que tem que ser reescrito para cada assunto:** as cenas em `main.js` (objeto `CENA`), os textos em
`storyboard.py` (dicionários `TELA` e `TRILHA`) e os nomes de cena usados em `trilha.py`.

### 8.2 O contrato da página (não quebrar)
A Lemo abre `index.html` num Chromium e pede quadro a quadro. O `main.js` precisa expor:
- `window.DUR` (duração em segundos), `window.render(t)` (desenha o tempo `t`; pode ser `async`),
  `window.READY = true` quando terminou de carregar, `window.EV` (lista `{t, type}` dos eventos de som) e
  `window.TEXTS(t)` (caixas de texto, para conferência).
- Tudo é função do tempo: nada de `setTimeout`, animação CSS ou relógio do sistema. Mesmo `t` = mesmo quadro.

### 8.3 `timeline.json`
```json
{ "dur": 58.0, "cenas": [
  { "id": "abre", "cap": "01 Equipe", "fala": "Você monta uma equipe…", "t": 0, "dur": 6.0, "wt": [0, 0.3, …] }
]}
```
`id` = nome da cena (o `main.js` e o `trilha.py` usam), `fala` = texto narrado, `cap` = etiqueta/legenda conforme
o estilo. `t`, `dur` e `wt` (início de cada palavra) são escritos pelo `sincronizar.py` depois da narração; antes
disso use tempos provisórios (≈ caracteres/14 + 0,9 s; mínimo 2,8 s).

### 8.4 Regras de animação que já aprendemos
- **Pendure cada animação numa palavra da fala** (função `W(c, 'palavra')` do `main.js`). Se a palavra não existe
  na fala, a animação dispara no começo da cena — foi o erro do "Ollama" no Reel do OpenBot. Use a palavra que é
  realmente dita ("local", não "Ollama").
- Nada parado por mais de 1 s: em cenas longas, câmera derivando devagar, mascote/elementos respirando.
- Mascote, cursor ou destaque **nunca cobrem texto que precisa ser lido**.
- Living Screencast: o cursor é o usuário e o mascote é o software; nada de mão na tela; zoom nunca menor que 1.
- Caption News: filmagem real e ligada ao assunto; flash de 2 quadros na citação é do estilo.

### 8.5 Comandos
```
L=~/lemo-opuscar ; P="$RAIZ/reels/<pasta>" ; PY=~/lemo-opuscar/.venv/Scripts/python.exe
# quadros soltos (conferência e storyboard)
cd $L && node core/render/still.mjs "$P" 5 11.2 18.5 --size 1080x1920 --out "D:/tmp/<tema>"
# storyboard (renderiza 1 quadro por cena, lê os eventos, monta o HTML)
cd "$P" && python -X utf8 storyboard.py            # → storyboard/storyboard.html
# APROVAÇÃO 2 → narração (seção 6, com falas.txt na pasta do Reel) → sincronia:
cd "$P" && python sincronizar.py                    # escreve t/dur/wt no timeline.json e voz/narracao.wav
# eventos de som e vídeo (só imagem)
cd $L && node core/render/events.mjs "$P" --size 1080x1920
cd $L && node core/render/video.mjs "$P" --fps 30 --size 1080x1920 --out "$P/out/video.mp4"   # leva alguns minutos
# trilha original e efeitos do kit
cd "$P" && $PY trilha.py && $PY efeitos.py         # → som/trilha.wav, som/efeitos.wav
```

### 8.6 Mix final
```
cd "$P" && ffmpeg -v error -y -i out/video.mp4 -i voz/narracao.wav -i som/efeitos.wav -i som/trilha.wav \
 -filter_complex "[1:a]asplit[v1][vs];[3:a]volume=0.55[m0];[m0][vs]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=350[m];[v1][2:a][m]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-6:LRA=9,alimiter=limit=0.45:level=false[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest out/<tema>_bascowave.mp4
```
A música abaixa sozinha quando a voz fala (sidechain). Trilha: composta em código no `trilha.py`, sem baixar nada,
seguindo a seção de som do `STYLE.md` (ex.: Living Screencast = banda leve + voz 8-bit do mascote; Caption News =
pulso 120 BPM, silêncio na citação).

---

## 9. Conferência, ajustes parciais e entrega

### 9.1 Conferir (sempre, antes de entregar)
```
cd "$P"
ffmpeg -hide_banner -i out/<tema>_bascowave.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
python ~/.claude/skills/claude-video/scripts/ritmo.py out/<tema>_bascowave.mp4
ffmpeg -v error -y -i out/<tema>_bascowave.mp4 -vf "fps=1/2,scale=216:-1,tile=10x3" -frames:v 1 "D:/tmp/<tema>/quadros-2s.jpg"
```
| Checagem | Meta |
|---|---|
| Volume integrado | −16 LUFS (aceitável −15 a −17) |
| Pico | abaixo de −4 dBFS |
| Ritmo | PASSOU (nenhum trecho parado > 1 s). Exceção: movimentos próprios do estilo (flash de 2 quadros no Caption News, blocos de pixel no Living Screencast) — dizer ao dono |
| Folha de quadros a cada 2 s | **olhar a imagem**: nada cortado, texto legível, nada cobrindo texto, cena certa na fala certa |

### 9.2 Ajuste parcial (refazer só um trecho) — motor Lemo
O vídeo só pode ser cortado sem recomprimir num **quadro-chave**. Então refaz-se do quadro-chave anterior à cena até
o quadro-chave seguinte.
```
cd "$P"
# 1) corrigir main.js
# 2) ver os quadros-chave do vídeo só-imagem
ffprobe -v error -select_streams v -skip_frame nokey -show_entries frame=pts_time -of csv=p=0 out/video.mp4
#    escolha A = quadro-chave antes da cena, B = quadro-chave depois (em segundos); fa=A*30, fb=B*30
# 3) renderizar só esses quadros
T=$(python -c "print(' '.join(f'{i/30:.4f}' for i in range(<fa>,<fb>)))")
cd ~/lemo-opuscar && node core/render/still.mjs "$P" $T --out "D:/tmp/<tema>/q" --prefix f_ --size 1080x1920
# 4) virar vídeo (mesmo formato do original: yuvj420p, 30 fps)
cd "D:/tmp/<tema>/q" && ls f_*.jpg | sort -t_ -k2 -g | sed "s|^|file '|;s|$|'\nduration 0.0333333|" > l.txt
ffmpeg -v error -y -f concat -safe 0 -i l.txt -r 30 -c:v libx264 -pix_fmt yuvj420p -crf 18 -frames:v <fb-fa> novo.mp4
# 5) cortar as partes que ficam (por número de quadros, sem recomprimir) e emendar
cd "$P"
ffmpeg -v error -y -i out/video.mp4 -frames:v <fa> -c copy -an D:/tmp/<tema>/p1.mp4
ffmpeg -v error -y -ss <B> -i out/video.mp4 -frames:v <total-fb> -c copy -an D:/tmp/<tema>/p3.mp4
printf "file '%s'\n" D:/tmp/<tema>/p1.mp4 D:/tmp/<tema>/q/novo.mp4 D:/tmp/<tema>/p3.mp4 > D:/tmp/<tema>/c.txt
ffmpeg -v error -y -f concat -safe 0 -i D:/tmp/<tema>/c.txt -c copy out/video2.mp4
ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 out/video2.mp4   # tem que bater com o total
mv out/video2.mp4 out/video.mp4
# 6) refazer só o mix (8.6). A narração, a trilha e os efeitos não mudam.
```
Cortar por **número de quadros** (`-frames:v`), não por segundos: com `-t` sobram 1–2 quadros a mais.
Se o ajuste mudar o tempo de uma cena ou o som, aí sim refaça trilha/efeitos (mas ainda não o vídeo inteiro).

No motor HyperFrames, um ajuste numa cena pede `montar.sh` de novo (ele renderiza tudo); avise o dono do tempo.

### 9.3 Entregar
```
cp "$P/out/<tema>_bascowave.mp4" "$RAIZ/Vídeos prontos/AAAA-MM-DD_<tema>_bascowave.mp4"
ffmpeg -v error -y -i "$P/out/<tema>_bascowave.mp4" -c:v libx264 -crf 24 -preset fast -c:a copy "$P/out/<tema>_bascowave-leve.mp4"
```
A cópia leve (≈ 8–10 MB) é a que vai pelo chat para o celular; o arquivo cheio passa de 25 MB.
Relatório ao dono (modelo):
```
Pronto: Vídeos prontos/AAAA-MM-DD_<tema>_bascowave.mp4 (NN s).
Narração: voz Paulo, NNN caracteres gastos.
Volume: −NN LUFS, pico −N dBFS. Ritmo: PASSOU (ou: reprovou só em <movimento do estilo>).
O que corrigi na conferência: …
Ouça com atenção: <palavras de risco>.
Nada foi enviado ao GitHub.
```
Depois de entregue, apague de `out/` as versões intermediárias.

---

## 10. Problemas conhecidos e soluções

| Sintoma | Causa | Solução |
|---|---|---|
| `sound_pass` quebra com fps "30/1," | ffprobe deste PC devolve vírgula no fim | nos Reels Lemo usar `efeitos.py`; não editar a skill |
| `sound_pass` reclama de `/tmp` | precisa de `/d/tmp` | `mkdir -p /d/tmp` (o `montar.sh` já faz) |
| Vídeo maior que a guia de tempo quebra | guia curta | `assets/guia-tempo.wav` tem 180 s; Reel não pode passar disso |
| Animação dispara no começo da cena | palavra de `W()` não existe na fala | usar a palavra realmente dita |
| Ritmo reprova "buraco morto" no fim | cena final parada | câmera derivando, mascote/logo com movimento leve |
| Emenda com quadros a mais | corte com `-t` | cortar com `-frames:v` |
| Mascote cobre texto | ancorado no meio do elemento | ancorar na borda direita/livre (`topo(el, .9)`) |
| Imagens quebradas no storyboard | caminho relativo | o `storyboard.py` embute as imagens em base64; não trocar |
| Painel do navegador oculto trava script | `requestAnimationFrame` não roda | conferir por quadros renderizados (`still.mjs`), não pelo navegador |
| "Claude" vira "Cloud", "E" vira "É" | pronúncia da voz | regras da seção 6; listar como palavra de risco |

---

## 11. Checklist rápido (o Diretor confere antes de cada aprovação e da entrega)

**Antes da Aprovação 1 (roteiro):** fatos todos com fonte · formato/motor justificados · total de caracteres ·
palavras de risco · nenhuma frase começando com "E".

**Antes da Aprovação 2 (storyboard):** HTML com imagem + tela + fala + efeitos de cada cena · quadros olhados ·
nada cobrindo texto · imagens ligadas ao assunto · custo em caracteres na pergunta.

**Antes da entrega:** LUFS e pico na meta · ritmo ok (ou exceção do estilo explicada) · folha de 2 s olhada ·
arquivo em `Vídeos prontos/` com data · cópia leve enviada · palavras de risco listadas · nada no GitHub sem pedido.

---

## 12. Aprendizados (o Diretor acrescenta aqui quando o dono pedir para virar regra)

- 2026-11-10 · Storyboard em HTML sempre, antes de narrar, em qualquer motor.
- 2026-11-10 · Estilo da Lemo fiel; @bascowave só como assinatura.
- 2026-11-11 · Filmagem precisa ter a ver com o assunto (NASA no Reel do PHP reprovada).
- 2026-11-11 · Ajuste pontual = refazer só o trecho e emendar.
- 2026-11-11 · Lemo entra junto com o processo da reel-bascowave, não copiando um estilo só.
- 2026-11-11 · Postar no Instagram pela web: na etapa "Cortar" escolher 9:16 (ou Original), nunca deixar 1:1; no passo "Editar" conferir pelo quadro que o vídeo aparece inteiro; capa = quadro com título (ex.: enviar JPG do quadro em "Selecionar do computador"); conferir o Reel no perfil depois de publicar.
