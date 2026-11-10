---
name: reel-bascowave
description: Cria um Reel explicativo 1080×1920 da @bascowave só com motion graphics a partir de um assunto ou link de documentação — roteiro em 7 pontos, frase com palavras acendendo no tempo da fala, ilustrações de interface, narração ElevenLabs (voz Paulo), efeitos sonoros e render no HyperFrames. Use quando o usuário pedir "faz um Reel sobre X", "cria um vídeo explicando X", "transforma essa documentação/artigo em Reel" ou mandar um link e pedir um vídeo no formato bascowave.
---

# Reel @bascowave

O usuário não grava vídeo. Ele passa o assunto; eu entrego o Reel pronto. Fale em português do Brasil, simples.
`$K` = pasta desta skill. Raiz do projeto = `D:/Editor de Vídeo com IA`. Cada Reel numa pasta nova: `reels/AAAA-MM-DD_<tema>/` (ver "Onde salvar").

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

No modelo **Editorial claro**:
- Cada cena: `.kick.serif` (linha pequena, `data-at`) + `.key` com `<span>PALAVRA</span>` (`data-at` aparece, `data-hl` passa o marca-texto). Capítulo: `.cap-n` (número) + `.cap-t` com `<span class="mark">`.
- Cartões: `.card` com `.head` (faixa preta) e `.body`; `.tag` = etiqueta azul; `data-strike` risca texto; `data-mark` marca em azul num tempo.
- `data-cap` fica escondido: só dá o tempo da fala. Som: marque `data-sfx="appear|reveal|success"` antes do `data-at` no elemento.
- Fundo claro esconde movimento: cada cena precisa de algo entrando no 1º segundo, senão o ritmo reprova.

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
3. **Escrever as cenas.** `cp -r $K/modelo reels/<nome>/proj` (ou `modelo-ferramentas`, ver Formatos) e trocar os blocos `<div class="scene">` entre `rainbox` e `<!-- HUD -->`. O modelo traz o Reel de Hooks como exemplo de cada peça.
   - `data-cap`: frase em MAIÚSCULAS; `*PALAVRA*` = destaque azul com sublinhado em onda; `!PALAVRA!` = impacto (pílula azul). Pontuação vai fora do marcador: `*ESCOLHE*.` ou `*DIA*?`.
   - `data-step="1..7"` + `data-pill="RÓTULO"` nas cenas 01–07 (contador e barra).
   - Peças: `.pop` com `data-at` (segundos após o início da cena), `.panel`, `.chip`, `.stamp` (círculo), `.code`; `data-type`+`data-rate` digita texto; `data-grow`/`data-to`/`data-to2`/`data-at2` anima barra; `data-fade` faz aparecer. Ilustração entre y 640 e 1300; nada abaixo de 1300 (HUD) nem acima de 140.
   - Rodapé: logo + `@bascowave` à esquerda, tema à direita (trocar o texto `HOOKS`).
   - Tempos provisórios: 3,8 s por cena. A narração reparte depois.
4. **Cards para aprovação.** `bash ~/.claude/skills/claude-video/scripts/frames.sh reels/<nome>/proj <t1,…,t11>` (≈0,4 s antes do fim de cada cena), juntar numa faixa e mostrar. Esperar o "sim".
5. **Narração** (só depois do sim; dizer o total de caracteres antes):
   - `reels/<nome>/voz/falas.txt`, uma fala por cena, na mesma ordem.
   - Fala = frase da tela dita de forma natural; termos técnicos em inglês ficam só na tela quando der ("arquivo de configurações" em vez de "settings.json").
   - Pronúncia: "Claude" escrito normal (o usuário aprovou). Nunca começar frase com "E" solto (sai "É"). Nada de fala de 2 palavras terminando em palavra inglesa ("Vira hook" saiu com sotaque inglês) — dar contexto: "Então transforma isso num hook." Evitar "seguem".
   - `cd "D:/Editor de Vídeo com IA" && STABILITY=0.7 npm run narrar -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el Qrdut83w0Cr152Yb4Xn3` (voz Paulo, brasileira; stability 0.7 aprovado).
6. **Montar:** `bash $K/scripts/montar.sh reels/<nome> <nome>-bascowave`. Ele sincroniza as palavras pelo tempo real da fala, renderiza, põe os efeitos, mixa (voz na frente, −16 LUFS, pico < −4 dBFS) e gera `out/quadros-2s.jpg`.
7. **Conferir antes de entregar:** ler `out/quadros-2s.jpg` (nada cortado, legível, dentro da área segura, contador certo), ritmo PASSOU, volume na meta. Corrigir e montar de novo se falhar.
8. **Entregar:** enviar o MP4, dizer duração, volume, checagens, caracteres gastos e as palavras de risco para ouvir. Pedir pontos de melhoria e anotar na memória.

## Sons do Reel (kit próprio a cada vídeo)
`montar.sh` chama `scripts/kit_som.py`, que monta `som/kit/` antes dos efeitos:
- **Pop nas palavras e whoosh nas trocas de cena: os originais do kit da sound-effects** (aprovados; a gota d'água e o swipe do Earshot foram reprovados).
- **Assinatura @bascowave, sempre (Earshot, gerado em código, local, grátis):** impacto = `cut_hit/air` nos selos. Por serem gerados por nós, entram como CC0 no `CREDITS.txt`.
- **Variação por Reel (Openverse, só CC0):** `OPENVERSE=impact bash montar.sh …` (ou `whoosh,impact`) troca a categoria por um som CC0 novo, escolhido pelo nome da pasta, para os Reels não soarem iguais. Antes de publicar, abrir a página de cada som do Openverse listada no `som/out/CREDITS.txt` e confirmar que ainda diz CC0.
- Digitação continua do Mixkit (baixado na hora, licença gratuita do Mixkit).
- Instalação: `uv tool install "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot"`. Os comandos `earshot sfx`/`kit` não usam os modelos de 1,1 GB; só baixe (`earshot doctor --fetch`) se o usuário quiser `describe`/`critique`.

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
