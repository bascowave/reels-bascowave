# Projeto: Reels @bascowave

O usuário não grava vídeo: ele passa um assunto (ou link) e eu entrego o Reel pronto em motion graphics.
Para isso use a skill **`reel-bascowave`** (`.claude/skills/reel-bascowave/SKILL.md`): roteiro, cards, narração
ElevenLabs (voz Paulo, stability 0.7), efeitos, render e conferência. Ela tem três formatos para alternar:
"7 pontos", "3 ferramentas" e "Editorial claro".
Para rodar a produção por uma equipe de agentes do OpenBot: `.claude/skills/reel-bascowave/MANUAL-OPENBOT.md`.

## Regras que não se negociam
- Identidade @bascowave (logo onda azul em `marca/`), nunca a do criador de referência (@gustagoat.ai).
- Créditos do ElevenLabs são pagos: dizer quantos caracteres vai gastar e esperar o "sim" antes de narrar ou regerar.
- Conteúdo conferido na fonte; não inventar recurso, comando ou número.
- Ajuste pontual em vídeo pronto: renderizar só o trecho da cena alterada e emendar no vídeo (ffmpeg, sem recomprimir o resto); nunca refazer tudo.
- Filmagem precisa ter ligação direta com o assunto (nada de B-roll genérico).
- Storyboard em HTML (imagem, texto, fala e efeitos de cada cena) aprovado antes de narrar, em qualquer motor (HyperFrames ou Lemo), nunca só quadros soltos; vídeo conferido (quadros a cada 2 s, ritmo, volume) antes de entregar.

## Onde salvar (não criar pastas fora disso)
| O quê | Onde |
|---|---|
| Trabalho de um Reel | `reels/AAAA-MM-DD_<tema>/` (`proj/`, `voz/`, `voz-el/`, `som/`, `out/`) |
| Vídeo final | `Vídeos prontos/AAAA-MM-DD_<tema>_bascowave.mp4` |
| Logo e identidade | `marca/` |
| Reels de referência | `Referências/<nome>/` |
| Banco de estilos (efeitos com prompt) | `Referências/banco-de-estilos/` (`banco-de-estilos.html`, `estilos.json`) |
| Sons CC0 e ambiente Python dos efeitos | `ferramentas/` (não apagar) |
| Vídeo gravado pelo usuário | `Vídeo bruto/` |
| Projetos antigos | `arquivo/` |
| Testes, frames de conferência, rascunhos | pasta de rascunho da sessão (scratchpad), nunca na raiz |

Na raiz ficam só: este arquivo, `narrar.mjs` (+ `package.json`, `node_modules`, `.env.local` com a chave), e a
configuração do Remotion (`src/`, `remotion.config.ts`).

## Vídeo gravado (caso volte a existir)
A folha de estilo antiga (fundo claro, apresentador em cartão, jump cut) está em
`arquivo/projetos-anteriores/FOLHA_DE_ESTILO.md`. Só usar se o usuário pedir edição de um vídeo gravado, e
perguntar antes se ela ainda vale.
