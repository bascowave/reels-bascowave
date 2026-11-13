---
name: reel-bascowave
description: Cria um Reel explicativo 1080×1920 da @bascowave só com motion graphics a partir de um assunto ou link de documentação — roteiro em 7 pontos, frase com palavras acendendo no tempo da fala, ilustrações de interface, narração ElevenLabs (voz Paulo), efeitos sonoros e render no HyperFrames. Use quando o usuário pedir "faz um Reel sobre X", "cria um vídeo explicando X", "transforma essa documentação/artigo em Reel" ou mandar um link e pedir um vídeo no formato bascowave.
---

# Reel @bascowave

O usuário não grava vídeo. Ele passa o assunto; eu entrego o Reel pronto. Fale em português do Brasil, simples.
`$K` = pasta desta skill. Raiz do projeto = a pasta onde o repositório foi clonado (onde está o `CLAUDE.md`). Cada Reel numa pasta nova: `reels/AAAA-MM-DD_<tema>/` (ver "Onde salvar").

## Regras que não se negociam
- **Créditos ElevenLabs são pagos.** Gere só a narração final aprovada. Nada de amostras, comparações de voz ou testes sem antes dizer quantos caracteres vai custar e ouvir "sim". Regerar uma fala: dizer o custo antes.
- **Identidade própria, nunca a da referência** (@gustagoat.ai: navy + verde-limão + rosa + Anton). O modelo já vem na marca bascowave; não troque paleta nem fonte.
- **Conteúdo conferido na fonte.** Cada afirmação do roteiro tem que estar no link/documentação lido. Não invente recurso, comando ou número.
- Eu não ouço áudio: sempre liste as palavras de risco para o usuário conferir de fone.

## Ferramentas
| Etapa | Ferramenta | Para quê |
|---|---|---|
| Pesquisa | navegador / `curl` (docs: `code.claude.com/docs/llms.txt`) | ler a fonte e validar o tema |
| Referência (opcional) | skill `watch` (quadros + transcrição Groq) | estudar um Reel novo que o usuário mandar |
| Cena | `$K/modelo/` (HTML + `studio.js`, relógio único) | as cenas animadas |
| Prévia e frames | `~/.claude/skills/claude-video/scripts/frames.sh` (HyperFrames snapshot) | cards parados para aprovação |
| Narração | `npm run narrar` na raiz (`narrar.mjs`, SDK ElevenLabs, chave em `.env.local`) | áudio + início de cada palavra |
| Montagem | `$K/scripts/montar.sh` | sincroniza, renderiza, efeitos, mixa e confere |
| Efeitos | skill `sound-effects` (biblioteca CC0) | whoosh nas trocas, pop nos destaques, impacto nos selos, digitação |
| Render | HyperFrames (`render.sh` da claude-video) | MP4 1080×1920, 30 fps |
| Conferência | `ritmo.py`, `ebur128`, folha de quadros a cada 2 s | ritmo, volume, nada cortado |

## Formatos (alternar para não repetir sempre o mesmo)
| Formato | Modelo | Estrutura | Texto na tela |
|---|---|---|---|
| **7 pontos** | `$K/modelo/` | 11 cenas: gancho → "são 7" → 01…07 → pergunta → resumo | frase inteira no topo, palavras acendendo; contador NN/07 |
| **3 ferramentas** | `$K/modelo-ferramentas/` | 9 cenas: gancho → contagem 3-2-1 → (destrava 01 → demo) ×3 → resumo | **uma palavra por vez** embaixo da janela; título grande só nos momentos-chave; pílula "DESBLOQUEADO n/3" |
| **Editorial claro** | `$K/modelo-editorial/` | ~12 cenas: gancho → "4 truques" → (capítulo "truque n de 4" → explicação) ×4 → dica → resumo | fundo de papel com sombra de onda; linha em serifa itálica + palavra-chave grande com marca-texto azul; cartões brancos com faixa preta; sem legenda palavra a palavra |
| **Apresentação de app** | `$K/modelo-app/` | ~10 cenas, 40–45 s: problema (bagunça solta) → virada (logo + "junta tudo") → 3–5 recursos (um por cena, tela do app no celular) → "tudo numa tela" → assinatura | título serifado com número fino ("01 · RECURSO") + 1 palavra em itálico na cor de destaque; legenda em pílula escura embaixo, palavra falada acendendo |

No modelo **Editorial claro**:
- Cada cena: `.kick.serif` (linha pequena, `data-at`) + `.key` com `<span>PALAVRA</span>` (`data-at` aparece, `data-hl` passa o marca-texto). Capítulo: `.cap-n` (número) + `.cap-t` com `<span class="mark">`.
- Cartões: `.card` com `.head` (faixa preta) e `.body`; `.tag` = etiqueta azul; `data-strike` risca texto; `data-mark` marca em azul num tempo.
- `data-cap` fica escondido: só dá o tempo da fala. Som: marque `data-sfx="appear|reveal|success"` antes do `data-at` no elemento.
- Fundo claro esconde movimento: cada cena precisa de algo entrando no 1º segundo, senão o ritmo reprova.

No formato **Apresentação de app** (vídeo de venda de um app/sistema; referência em `Referências/apresentacao-app-belitx/`):
- **Entrada:** prints ou link do app + para quem vende + 3–5 recursos que importam. Sem prints, perguntar; nunca inventar tela ou recurso.
- **A tela é recriada em HTML, não colada como imagem:** cada balão, etiqueta, número e botão vira elemento próprio para poder animar. O print serve só de gabarito (cores, textos, ordem).
- **Visual é do cliente:** cores, fontes e logo do produto mandam; @bascowave só como assinatura discreta no final, se o usuário quiser.
- **Problema (0–9 s):** fragmentos soltos flutuando (balões, cartão "no celular", planilha, papel), cada um entrando com a palavra da fala.
- **Virada:** logo do produto num anel de luz + frase curta palavra por palavra ("junta **tudo** num lugar só").
- **Cada recurso:** celular com a tela, câmera sempre em leve zoom/inclinação 3D; **algo sai da tela e flutua por cima** (etiqueta, card de histórico, notificação) e **a interface age sozinha** (mensagem chegando, código sendo digitado, assinatura desenhada, carimbo, número subindo).
- **Fechamento:** várias telas em leque ("o sistema inteiro numa tela") → logo + slogan com 1 palavra em itálico + site.
- Fundo escuro com vinheta e partículas leves; uma cor de destaque só (ex.: cobre). Duas fontes: serifada nos títulos, sem serifa na legenda.
- **Modelo (`$K/modelo-app/`, exemplo: NeoMoney):** palco de 360×640 escalado ×3. As telas do app são funções JS em `const S={inicio,tx,mercado,…}` (HTML na largura real do celular, 390 px) e entram com `<div class="phone" data-screen="nome" data-x data-y data-pw data-ry>`. Troque as funções pelas telas do novo app.
- Peças animadas: `data-at="s"` (segundos na cena) **ou `data-w="k"`** (aparece na k-ésima palavra da fala, `data-dw` = atraso); `data-fx` = `pop|drop|up|left|right|fade|stamp|fly|tap|scan|suck|phone|fan`; `data-float` = balanço; `data-sfx` = som (`appear|click|success|reveal|movement|build_up`; **não usar `error_or_tech`**: o ruído do kit dura 4 s e invade a cena seguinte). Legenda em pílula sai sozinha do `data-cap`; `data-nocap`/`data-nobrand` vão no `.cam`, não na `.scene` (o sincronizar reescreve a tag da cena).
- Montagem: `python -X utf8 $K/scripts/sincronizar.py` (dentro da pasta do Reel) → `python -X utf8 $K/scripts/palavra_para_tempo.py proj/index.html` (troca `data-w` por `data-at`, para o `gerar_cues` achar os sons) → `montar.sh`. Começar a cena 1 com algo entrando antes de 0,5 s, senão o ritmo reprova.
- Tudo o que a tela mostra precisa existir no app (conferir com o usuário); números de exemplo marcados como fictícios se não forem reais.

Pergunte qual formato (ou escolha o que não foi usado no último Reel e diga por quê). No modelo **3 ferramentas**:
- Cenas vão no lugar de `<!--CENAS-->`; tema do rodapé no texto `TEMA`; `data-steps="3"` na raiz.
- `.title` (com `<b>` para a parte azul) e `data-at`; `.digit` + `data-out` para a contagem; `.slot` com `.agua data-grow data-to="1" data-w="900"` para destravar (`data-grow="-1"` = já destravado); `data-swap` + `data-a`/`data-b` troca 🔒 por ✓; `.win` = janela de app com `.bar`.
- A cena final leva `data-done` (barra cheia). A troca de cena é seca, coberta pela onda que varre a tela.
- O `data-cap` deve ter o mesmo número de palavras da fala ("o comando */goal*." se a voz diz "o comando goal").

## Processo
1. **Ler a fonte.** Abrir o link/assunto, anotar os fatos. Se o usuário só deu um tema, propor 2–3 temas conferidos na documentação.
2. **Roteiro em 11 cenas** e mostrar ao usuário antes de montar:
   gancho (dor) → "são 7 pontos" → 01…07 (um fato cada, rótulo curto na pílula) → pergunta-ponte → fechamento + cartão-resumo + selo "SALVA ESSE".
   Para cada cena: a frase da tela (≤ 8 palavras, 1–2 destaques) e a ilustração de interface.
   **Ilustrações vêm do banco de estilos** (ver seção abaixo): para cada cena, sugerir um estilo do banco que combine e dizer qual no roteiro (ex.: "cena 04 · estilo Receipt").

## Estilos da Lemo Opuscar (motor alternativo)
A Lemo (`~/lemo-opuscar`, skill `lemo-opuscar`) tem vários estilos; não copiamos um só para cá. Quando o assunto pede um deles (ex.: notícia → Caption News), esta skill continua mandando no processo (fonte, roteiro, **storyboard HTML para aprovação**, narração Paulo, som, conferência, entrega em `Vídeos prontos/`) e a Lemo faz só o visual, fiel ao `STYLE.md`, com a @bascowave só como assinatura. Filmagem sempre ligada ao assunto. Exemplo pronto: `reels/2026-11-10_php2shell/` (`sincronizar.py`, `trilha.py`, `efeitos.py`, `storyboard.py`).

## Banco de estilos (`Referências/banco-de-estilos/`)
84 efeitos tirados de Reels de outros criadores, cada um com descrição e prompt. O usuário navega em
`banco-de-estilos.html` (servidor local `banco-estilos` → `http://localhost:8792/banco-de-estilos.html`); eu consulto
`estilos.json` (mesmo conteúdo, sem imagens).
- **Na hora do roteiro:** ler `estilos.json` e escolher para cada cena um estilo `tipo: "motion"` que sirva ao conteúdo
  (número grande → Money stack/Bank note/Chart grow; custos → Receipt; "o que está escondido" → Iceberg; comandos →
  Prompt bar/Keycaps/Terminal bloom; lista → Checklist/Chip row; antes/depois → Grease pencil sheet…). Não repetir o
  mesmo estilo duas vezes seguidas e variar entre Reels.
- **Pedido direto:** "faz no estilo X" → achar X no `estilos.json` (por `nome` ou `cmd`), mostrar ao usuário a
  descrição e o link do original, e construir a cena no nosso motor seguindo a `desc`.
- Estilos `tipo: "gravado"` precisam de vídeo de alguém falando: só usar se houver arquivo em `Vídeo bruto/`; senão,
  avisar e propor um `motion` parecido.
- O estilo é só a **mecânica visual**: sempre na identidade @bascowave (cores, fonte, logo), nunca as cores, textos ou
  marca do criador original. 72 dos 84 prompts são reconstruídos por mim; o efeito real pode ser diferente.
- Cena nova que deu certo → anotar no storyboard qual estilo foi usado, para o usuário reconhecer.
- **Estilo novo para o banco:** baixar o Reel com a watch em `Referências/banco-de-estilos/videos/`, acrescentar a linha
  em `ESTILOS` no `gerar_banco.py` e rodar `python -X utf8 gerar_banco.py` (refaz o HTML e o `estilos.json`).
3. **Escrever as cenas.** `cp -r $K/modelo reels/<nome>/proj` (ou `modelo-ferramentas`, ver Formatos) e trocar os blocos `<div class="scene">` entre `rainbox` e `<!-- HUD -->`. O modelo traz o Reel de Hooks como exemplo de cada peça.
   - `data-cap`: frase em MAIÚSCULAS; `*PALAVRA*` = destaque azul com sublinhado em onda; `!PALAVRA!` = impacto (pílula azul). Pontuação vai fora do marcador: `*ESCOLHE*.` ou `*DIA*?`.
   - `data-step="1..7"` + `data-pill="RÓTULO"` nas cenas 01–07 (contador e barra).
   - Peças: `.pop` com `data-at` (segundos após o início da cena), `.panel`, `.chip`, `.stamp` (círculo), `.code`; `data-type`+`data-rate` digita texto; `data-grow`/`data-to`/`data-to2`/`data-at2` anima barra; `data-fade` faz aparecer. Ilustração entre y 640 e 1300; nada abaixo de 1300 (HUD) nem acima de 140.
   - Rodapé: logo + `@bascowave` à esquerda, tema à direita (trocar o texto `HOOKS`).
   - Tempos provisórios: 3,8 s por cena. A narração reparte depois.
4. **Falas.** Escrever `reels/<nome>/voz/falas.txt`, uma fala por cena, na mesma ordem (regras de pronúncia no passo 6).
5. **Storyboard em HTML: SEMPRE, antes de narrar, em qualquer motor (HyperFrames ou Lemo)**. Quadros soltos não contam: tem que ser o HTML tela por tela (o usuário pediu; evita descobrir problema de som/texto só no vídeo final).
   - `python -X utf8 $K/scripts/storyboard.py reels/<nome>` gera `reels/<nome>/storyboard/storyboard.html`: por cena, a **imagem de como fica**, o tempo, o **texto na tela**, a **fala** e os **efeitos sonoros** (qual som e em que segundo), mais o total de caracteres.
   - Abrir no painel do navegador (`preview_start` "reel-preview" → `http://localhost:8791/<nome>/storyboard/storyboard.html`) e enviar ao usuário (SendUserFile).
   - Antes de mostrar, ler o storyboard e corrigir o óbvio (som duplicado, cena sem efeito nenhum, texto cortado).
   - Perguntar: "O storyboard está certo? A narração vai gastar N caracteres." Esperar o "sim". Mudou algo? Gerar de novo e mostrar de novo.
6. **Narração** (só depois do sim ao storyboard):
   - Fala = frase da tela dita de forma natural; termos técnicos em inglês ficam só na tela quando der ("arquivo de configurações" em vez de "settings.json").
   - Pronúncia: "Claude" escrito normal (o usuário aprovou). Nunca começar frase com "E" solto (sai "É"). Nada de fala de 2 palavras terminando em palavra inglesa ("Vira hook" saiu com sotaque inglês) — dar contexto: "Então transforma isso num hook." Evitar "seguem".
   - `STABILITY=0.7 npm run narrar -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el Qrdut83w0Cr152Yb4Xn3` (voz Paulo, brasileira; stability 0.7 aprovado).
- Se o provedor escolhido não der timestamps por palavra (ex.: Gemini), rode `npm run transcrever -- reels/<nome>/voz-el` (Groq Whisper) antes de montar; o `sincronizar.py` usa o `falaN.json` regravado.
- Antes de escolher provedor/modelo/voz, carregue a skill **tts-escolha** (`.claude/skills/tts-escolha/SKILL.md`): o padrão é ElevenLabs + Paulo; ela só sugere outro provedor com motivo e só usa depois do "sim" do usuário (o usuário não configura modelo/voz no .env, só as chaves).
- Alternativas gratuitas, **só com aprovação do usuário** (ver CLAUDE.md "Provedores de narração"):
  - Fish Audio S2.1 Pro (free até 30/11/2026, com timestamps): `npm run narrar:fish -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el`
  - Gemini 3.8 Flash TTS (free tier 3 RPM/10k TPM/10 RPD, SEM timestamps por palavra — tempos aproximados): `npm run narrar:gemini -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el`
  - Para sincronia precisa de palavras na tela, prefira Fish Audio ou ElevenLabs.
7. **Montar:** `bash $K/scripts/montar.sh reels/<nome> <nome>-bascowave`. Ele sincroniza as palavras pelo tempo real da fala, renderiza, põe os efeitos, mixa (voz na frente, −16 LUFS, pico < −4 dBFS) e gera `out/quadros-2s.jpg`.
8. **Conferir antes de entregar:** ler `out/quadros-2s.jpg` (nada cortado, legível, dentro da área segura, contador certo), ritmo PASSOU, volume na meta. Corrigir e montar de novo se falhar.
9. **Entregar:** enviar o MP4, dizer duração, volume, checagens, caracteres gastos e as palavras de risco para ouvir. Pedir pontos de melhoria e anotar na memória.

## Sons do Reel (kit próprio a cada vídeo)
`montar.sh` chama `scripts/kit_som.py`, que monta `som/kit/` antes dos efeitos:
- **Pop nas palavras e whoosh nas trocas de cena: os originais do kit da sound-effects** (aprovados; a gota d'água e o swipe do Earshot foram reprovados).
- **Assinatura @bascowave, sempre (Earshot, gerado em código, local, grátis):** impacto = `cut_hit/air` nos selos. Por serem gerados por nós, entram como CC0 no `CREDITS.txt`.
- **Variação por Reel (Openverse, só CC0):** `OPENVERSE=impact bash montar.sh …` (ou `whoosh,impact`) troca a categoria por um som CC0 novo, escolhido pelo nome da pasta, para os Reels não soarem iguais. Antes de publicar, abrir a página de cada som do Openverse listada no `som/out/CREDITS.txt` e confirmar que ainda diz CC0.
- Digitação continua do Mixkit (baixado na hora, licença gratuita do Mixkit).
- Instalação: `uv tool install "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot"`. Os comandos `earshot sfx`/`kit` não usam os modelos de 1,1 GB; só baixe (`earshot doctor --fetch`) se o usuário quiser `describe`/`critique`.

### Som sintetizado (opção, motor do claude-motion)
- `SOM=sintetizado bash montar.sh …` troca a biblioteca de sons por efeitos **gerados por código** (`scripts/som_sintetizado.py` + `sons-sintetizados/sfx`, MIT, de github.com/whaleyxbt/claude-motion): sem arquivo de áudio, sem licença de som para conferir.
- Mesmos tempos do `som/cues.json`. Pops sobem numa escala (não repetem o mesmo som), whoosh único quando troca de cena e celular entram juntos, chime no `success`, impacto no `reveal`, riser no `build_up`, digitação no `typing`.
- Usar para variar o som entre Reels; o padrão continua o kit da sound-effects. Mostrar ao usuário para ouvir antes de fixar.

## Referências de movimento (para se inspirar)
- **Regras de movimento com números** (curvas, molas, stagger, tempos de leitura, tipografia): `referencias/claude-motion-motion-design.md`; desenho de som: `referencias/claude-motion-sound-design.md`. Ler ao montar cenas novas.
- **Transições:** evitar só esmaecer entre cenas; preferir que um elemento da cena vire o da próxima (card do saldo → gráfico, logo → anel), ideia do hyperframes-motion-reel.

## Ajustes comuns
- Regerar uma fala só: gerar a linha num `falas-N.txt` separado, copiar `fala0.mp3/json` por cima de `voz-el/falaN.*`, ajustar o `data-cap` se o texto mudou e rodar `montar.sh` de novo.
- Sotaque oscilando: subir `STABILITY` (0.7 → 0.8) só na fala problemática.
- Dependências do `montar.sh`: venv `ferramentas/.sound-effects` (librosa) e a biblioteca CC0 em `ferramentas/sfx`; não apagar.

## Onde salvar (padrão do projeto, não criar pastas fora disso)
| O quê | Onde |
|---|---|
| Trabalho de um Reel (HTML, falas, narração, sons, render) | `reels/AAAA-MM-DD_<tema>/` com `proj/`, `voz/`, `voz-el/`, `som/`, `out/` |
| Vídeo final entregue | `Vídeos prontos/AAAA-MM-DD_<tema>_bascowave.mp4` (o `montar.sh` copia sozinho) |
| Logo e identidade | `marca/` |
| Reels de referência baixados | `Referências/<nome>/` |
| Sons CC0, ambiente Python dos efeitos | `ferramentas/` |
| Vídeo gravado pelo usuário (se um dia houver) | `Vídeo bruto/` |
| Projetos antigos que não usamos mais | `arquivo/` |
| Testes, frames de conferência, rascunhos | pasta de rascunho da sessão (scratchpad), nunca na raiz do projeto |
Ao terminar um Reel, apagar de `out/` as versões intermediárias; o que vale está em `Vídeos prontos`.
