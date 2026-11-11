# Provedores de narração (TTS) — Reels @bascowave

Este projeto suporta três provedores de text-to-speech. Todos leem um arquivo `falas.txt`
(uma fala por linha, na ordem das cenas) e geram, por fala, `falaN.<ext>` + `falaN.json`
com os tempos por palavra/segmento usados para sincronizar o texto na tela.

## Resumo comparativo

| Provedor | Custo | Timestamps por palavra | Temporário? | Idiomas | Qualidade |
|---|---|---|---|---|---|
| ElevenLabs (Eleven v4) | Pago (créditos) | Sim (por caractere/palavra) | Não | pt-BR (voz Paulo) | Alta (voz estável, sotaque BR) |
| Fish Audio S2.1 Pro | Grátis (free tier) | Sim (por segmento) | Sim — free até 30/11/2026 | 83 | Alta (SOTA, ~90 ms TTFA) |
| Gemini 3.8 Flash TTS | Free tier AI Studio (3 RPM/10k TPM/10 RPD) ou pago | Não (aproximado) | Free tier limitado | 130+ | Alta (expressivo, multi-speaker) |

## 1. ElevenLabs (padrão atual, pago)

- **Comando:** `npm run narrar -- <falas.txt> <saida> [voice_id]`
- **Variáveis:** `ELEVENLABS_API_KEY` (obrigatória), `STABILITY` (opcional, 0–1).
- **Modelo fixo no código:** `eleven_v4`, `languageCode: "pt"`, `outputFormat: "mp3_44100_128"`.
- **Voz padrão no código:** George `JBFqnCBsd6RMkjVDRZzb`.
- **Voz recomendada (skill):** Paulo (brasileira) `Qrdut83w0Cr152Yb4Xn3`, `STABILITY=0.7`.
- **Timestamps:** sim, via `convertWithTimestamps` (início/fim de cada caractere → agrupado em palavras).
- **Limites/custo:** créditos pagos. Free tier da ElevenLabs ≈ 10.000 créditos/mês (~6–10 min de áudio).
- **Vantagens:** melhor estabilidade de sotaque BR, timestamps precisos, controle de stability.
- **Regra inegociável:** créditos pagos → sempre informar quantos caracteres serão gastos e esperar "sim" antes de narrar/regenerar.

## 2. Fish Audio S2.1 Pro (grátis, com timestamps)

- **Comando:** `npm run narrar:fish -- <falas.txt> <saida> [reference_id]`
- **Variáveis:** `FISH_API_KEY` (obrigatória), `FISH_MODEL` (default `s2.1-pro-free`), `FISH_FORMAT` (default `mp3`).
- **Endpoint:** `POST https://api.fish.audio/v1/tts/stream/with-timestamp` (SSE).
- **Modelos disponíveis:**
  - `s2.1-pro-free` — **grátis** (free tier, até 30/11/2026).
  - `s2.1-pro` — pago ($15/M UTF-8 bytes).
  - `s2-pro` — pago ($15/M).
  - `drama-3` — pago ($50/M, promoção $10/M até 30/11/2026).
  - `s1` — deprecado (retirado em 31/12/2026).
- **Timestamps:** sim, por **segmento** (endpoint stream/with-timestamp retorna `alignment.segments` com `text`/`start`/`end` em segundos). Aproximadamente por palavra, pode agrupar em frases.
- **Idiomas:** 83 (PT-BR incluso).
- **Recursos:** voice cloning via `reference_id`, latência ~90 ms TTFA, streaming.
- **Limites do free tier:**
  - Gratuito até 30/11/2026 (pode ser estendido com aviso).
  - Sem cap rígido de caracteres (Fair Use Policy).
  - Sem SLA / sem garantia de latência.
  - Concorrência: 5 simultâneas (tier Starter, < $100 pagos).
  - Retenção de dados: requisições podem ser usadas para melhorar o modelo.
  - Uso comercial: restrições para produtos com > $1M ARR (contatar a equipe).
- **Vantagens:** gratuito, timestamps, 83 idiomas, voice cloning, baixa latência.
- **Desvantagens:** sem SLA, dados retidos, free tier temporário, timestamps por segmento (não por caractere).
- **Uso recomendado:** substituto gratuito do ElevenLabs quando precisar de sincronia de palavras na tela.

## 3. Gemini 3.8 Flash TTS (free tier AI Studio, sem timestamps)

- **Comando:** `npm run narrar:gemini -- <falas.txt> <saida> [voice]`
- **Variáveis:** `GEMINI_API_KEY` (ou `GOOGLE_API_KEY`), `GEMINI_MODEL` (default `gemini-3.8-flash-tts`), `GEMINI_VOICE` (default `Kore`), `GEMINI_STYLE` (opcional).
- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/interactions` (auth `x-goog-api-key`).
- **Modelos disponíveis:**
  - `gemini-3.8-flash-tts` — flagship (máxima fidelidade, 130+ idiomas).
  - `gemini-3.8-flash-lite-tts` — rápido/barato (100+ idiomas).
  - `gemini-3.1-flash-tts-preview` — preview anterior.
  - `gemini-2.5-pro-preview-tts`, `gemini-2.5-flash-tts` — legados.
- **Vozes:** 30 prebuilt (Zephyr, Puck, Charon, Kore, Fenrir, Leda, Orus, Aoede, Callirrhoe, Autonoe, Enceladus, Iapetus, Umbriel, Algieba, Despina, Erinome, Algenib, Rasalgethi, Laomedeia, Achernar, Alnilam, Schedar, Gacrux, Pulcherrima, Achird, Zubenelgenubi, Vindemiatrix, Sadachbia, Sadaltager, Sulafat) + Extended Voice Library (centenas) + Voice design/replication/remixing.
- **Saída:** WAV (24 kHz, mono, 16-bit) por padrão (unary). Suporta `audio/l16`, `audio/mulaw`, `audio/alaw` via `response_format`.
- **Timestamps:** **não** retorna timestamps por palavra (feature request pendente). O script distribui a duração total pelas palavras (por contagem de caracteres) → `timing: "approximate"`.
- **Idiomas:** 130+ (Flash TTS), 100+ (Flash-Lite).
- **Recursos:** multi-speaker (até 2), style metadata, inline vocal tags (`<laugh>`, `<sigh>`, `<short pause>`), voice design.
- **Limites/custo:**
  - Free tier AI Studio (informado pelo usuário): 3 RPM / 10.000 TPM / 10 RPD.
  - Cloud TTS pricing: "Not available" free para Gemini-TTS; pago a partir de $0,50/1M tokens de entrada e $9,00/1M tokens de áudio (até 31/12/2026; dobra em 2027).
  - Multi-speaker limitado a 2 vozes prebuilt por request.
- **Vantagens:** 130+ idiomas, expressividade (style + tags), multi-speaker, voice design.
- **Desvantagens:** sem timestamps por palavra, free tier muito restrito (10 RPD), saída WAV (maior), Cloud TTS sem free tier.
- **Uso recomendado:** quando precisar de muitos idiomas/expressividade e a sincronia por palavra não for crítica; ou para experimentação dentro dos limites do free tier.

## Escolha automática (o agente decide; o usuário só dá a chave)

O agente escolhe provedor, modelo, voz e style — o usuário **não** precisa definir essas variáveis no .env.
A skill **tts-escolha** (.claude/skills/tts-escolha/SKILL.md) documenta a decisão; o catálogo executável
fica em tts-modelos.mjs e pode ser consultado com:

~~~
npm run tts:info                      # catálogo completo (modelos/vozes/limites)
npm run narrar:fish -- --list         # modelos do Fish
npm run narrar:gemini -- --list       # modelos + 30 vozes do Gemini
npm run narrar:fish -- --vozes        # vozes públicas pt (requer FISH_API_KEY)
npm run narrar:gemini -- --vozes      # Voice Library (requer GEMINI_API_KEY)
~~~

Flags (sobrepõem qualquer variável de ambiente):
- --model <id> — modelo.
- --voice <id> (ou --voz) — voz/reference_id.
- --style "<texto>" — só Gemini.
- --dry-run — imprime plano, custo (caracteres/bytes) e avisos, sem chamar a API.
- --list / --vozes — catálogo/descoberta.

Os scripts imprimem no início: modelo, custo, temporariedade, timestamps, idiomas, voz e avisos.
Para reprodutibilidade, registre a escolha em reels/<nome>/voz-escolha.json (provider/model/voice/style/motivo).

## Variáveis de ambiente (`.env.local`, gitignored)

As chaves são do usuário; as variáveis de modelo/voz são **overrides opcionais** que o agente pode usar — não é necessário preenchê-las.

| Variável | Provedor | Obrigatória | Default | Descrição |
|---|---|---|---|---|
| `ELEVENLABS_API_KEY` | ElevenLabs | Sim | — | Chave da API ElevenLabs |
| `STABILITY` | ElevenLabs | Não | (sem voiceSettings) | 0–1; recomendado 0.7 |
| `FISH_API_KEY` | Fish Audio | Sim | — | Chave da API Fish Audio |
| `FISH_MODEL` | Fish Audio | Não | `s2.1-pro-free` | Modelo (ver lista acima) |
| `FISH_FORMAT` | Fish Audio | Não | `mp3` | Formato de saída (mp3/opus/wav/pcm) |
| `GEMINI_API_KEY` (ou `GOOGLE_API_KEY`) | Gemini | Sim | — | Chave do Google AI Studio |
| `GEMINI_MODEL` | Gemini | Não | `gemini-3.8-flash-tts` | Modelo (ver lista acima) |
| `GEMINI_VOICE` | Gemini | Não | `Kore` | Voz prebuilt |
| `GEMINI_STYLE` | Gemini | Não | (vazio) | Style metadata (ex.: "cheerful and friendly") |

Ver `.env.local.example` para template.

## Qual escolher?

- **Sincronia precisa de palavras na tela (efeito "acender palavras") + PT-BR de qualidade:** ElevenLabs (pago) ou Fish Audio (grátis, até 30/11/2026).
- **Prototipagem/experimentação gratuita com timestamps:** Fish Audio.
- **Muitos idiomas / expressividade / multi-speaker, sem necessidade de timestamps:** Gemini.
- **Produção paga com SLA:** ElevenLabs ou Fish Audio pago (s2.1-pro).

## Temporariedade

- **Fish Audio free tier:** temporário (até 30/11/2026, sujeito a extensão com aviso).
- **Gemini free tier (AI Studio):** limitado (10 RPD) — não adequado para produção; Cloud TTS é pago.
- **ElevenLabs:** pago, sem expiração de tier (créditos mensais conforme plano).

## Comandos

```bash
STABILITY=0.7 npm run narrar -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el Qrdut83w0Cr152Yb4Xn3   # ElevenLabs
npm run narrar:fish -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el                                 # Fish Audio
npm run narrar:gemini -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el                               # Gemini
```

Créditos do ElevenLabs são pagos: sempre informar caracteres e esperar "sim" antes de narrar/regenerar.

## Catálogo de vozes (descrições para escolher)

### Gemini 3.8 TTS — 30 prebuilt (en-US; falam português com possível sotaque)
| Voz | Estilo | Descrição | Usar em |
|---|---|---|---|
| Zephyr | Bright | Brilhante e leve, tom jovem | abertura animada, apresentação |
| Puck | Upbeat | Alegre e enérgica | gancho, promoção, CTA |
| Charon | Informative | Informativa e estável, tom baixo | explicativo técnico, documentário |
| Kore | Firm | Firme e direta | narração principal (padrão do script) |
| Fenrir | Excitable | Empolgada e intensa | gancho agressivo, anúncio |
| Leda | Youthful | Jovem e leve | público jovem, redes |
| Orus | Firm | Firme e confiante | narração confiante, institucional |
| Aoede | Breezy | Leve e descontraída | lifestyle, vlog |
| Callirrhoe | Easy-going | Relaxada e casual | conversa amigável, tutorial |
| Autonoe | Bright | Brilhante e entusiasmada | promoções, novidades |
| Enceladus | Breathy | Sussurrada e íntima | suspense, revelação |
| Iapetus | Clear | Clara e nítida | pronúncia técnica |
| Umbriel | Easy-going | Neutra e tranquila | narração neutra, longa |
| Algieba | Smooth | Suave e polida | corporativo, explainer |
| Despina | Smooth | Suave e madura | marketing, e-learning |
| Erinome | Clear | Clara e direta | didático, passo a passo |
| Algenib | Gravelly | Grave e impactante | narração dramática, autoridade |
| Rasalgethi | Informative | Informativa e calma | notícia, análise |
| Laomedeia | Upbeat | Animada | promoção, CTA |
| Achernar | Soft | Suave e acolhedora | storytelling pessoal, fechamento |
| Alnilam | Firm | Firme e comandante | instruções autoritativas |
| Schedar | Even | Uniforme e equilibrada | narração longa |
| Gacrux | Mature | Madura e experiente | autoridade, conselho |
| Pulcherrima | Forward | Projetada para frente | chamada para ação |
| Achird | Friendly | Amigável e acolhedora | walkthrough casual |
| Zubenelgenubi | Casual | Casual e descontraída | conversa, bastidores |
| Vindemiatrix | Gentle | Gentil e delicada | temas sensíveis, fechamento |
| Sadachbia | Lively | Viva e animada | dinamismo, listas |
| Sadaltager | Knowledgeable | Conhecedora, professoral | aula, expert |
| Sulafat | Warm | Calorosa e envolvente | conexão emocional, encerramento |

### Gemini — vozes pt-BR nativas (Voice Library)
| Voz | Perfil | Descrição | Usar em |
|---|---|---|---|
| pt-br-advisor-3 | feminina, 45 | Confiante e clara | narração principal, explicações |
| pt-br-advisor-5 | feminina, 48 | Confiante e clara, podcast | educativo, conversa |
| pt-br-advisor-8 | feminina, 43 | Confiante e clara, corporativo | institucional |
| pt-br-advisor-1 | feminina, 41 | Calorosa e envolvente | acolhedor, storytelling |
| pt-br-advisor-7 | feminina, 30 | Calorosa e envolvente, jovem | social media, gancho |
| pt-br-advisor-12 | feminina, 31 | Calorosa e envolvente, criativa | criativo, narrativa |
| pt-br-advisor-9 | masculina, 45 | Objetiva, direta e útil | tutorial, passo a passo |
| pt-br-advisor-4 | masculina, 49 | Papo reto e curioso | podcast, entrevista |
| pt-br-advisor-11 | masculina, 39 | Descontraída e encorajadora | casual, dica rápida |
| pt-br-advisor-6 | masculina, 48 | Cristalina e animada | anúncio energético |
| pt-br-advisor-2 | masculina, 34 | Relaxada e leve | conversa leve |
| pt-br-advisor-10 | masculina, 35 | Acolhedora, transmite calma | empático, tema sensível |
| pt-br-assistant-11 | masculina, 33 | Grave, aveludada e sem pressa | narração grave, suspense |
| pt-br-assistant-5 | feminina, 31 | Clara, pitch médio e amigável | explicação clara |
| pt-br-assistant-12 | feminina, 44 | Objetiva, direta e útil | didático, instruções |

### Fish Audio — vozes pt-BR de narração (curadas)
| Voz (reference_id) | Perfil | Descrição | Usar em |
|---|---|---|---|
| Narrador Propagandas (df1fa6d2ae194b3ebcbae60df48fde35) | masculina | Profissional e confiante, suave e energético | anúncios, corporativo |
| NARRADOR (d0a1020822f64d07905bd4f4cb37fba9) | masculina | Calmo, sotaque BR claro, ritmo medido | narração principal, storytelling |
| Narrador (dfe49f8dc6e145238ca87f97ab89f3a5) | masculina | Calmo e sério, meia-idade | narração dramática |
| Melhor narrador (b2f48ebaf7b644539abc7dea4cf7d28c) | masculina | Grave e profissional, narrativa clara | documentário, educativo |
| narrador oficial (e2b7e279f9ee47138bdf0b6d62356e8b) | masculina | Grave, autoritária e medida | oficial, institucional |
| Narrador Persuasivo (d8178b2723e845d2a3995fe99112faa5) | masculina | Calma e clara, envolvente | educativo |
| narrador (e8cad1cf86da456f9170ea8e3176646a) | masculina | Energética e profissional | dinâmico, anúncio |
| NARRADOR (c3fe6105acc5476cb95e10a952e8e013) | masculina | Grave e calma, ritmo medido | social media, educativo |
| Narrador (b601c1a92e8d426c8706a8efc8bb318d) | masculina | Jovem, amigável e conversacional | social media |
| Narrador (7adc1c4204ba4335b78ecf4ce06b9e86) | masculina | Timbre grave | impacto, abertura |

Atenção: vozes do Fish são de terceiros; confira direitos/likeness antes de usar em marca.

### ElevenLabs — conta atual e biblioteca pt-BR
- Conta: 21 vozes, todas en (George, Alice, Matilda, Daniel, Lily, Sarah, Laura...). Nenhuma pt-BR.
- **Paulo (Qrdut83w0Cr152Yb4Xn3) NÃO está nesta conta** (voice_not_found). Adicione uma voz pt-BR no painel
  e use o novo ID; stability 0.7 continua o ajuste aprovado.
- Biblioteca compartilhada pt-BR (adicionar à conta): Antônio (grave/caloroso/calmo), Iago (natural/calmo),
  Lucas Gabriel (calmo/claro), Marcelo (calmo/amigável), Jorge (calmo/caloroso), Teresinha (professora
  energética), Audesio (casual), Gui (chill).

## Timestamps independentes com Groq Whisper

Para não depender do provedor de TTS, transcreva o áudio com a API da Groq (OpenAI-compatible) e
sobrescreva o `falaN.json` com tempos por palavra:

~~~bash
npm run transcrever:list                                   # modelos, preços e limites
npm run transcrever -- reels/<nome>/voz-el --dry-run       # plano e custo, sem chamar a API
npm run transcrever -- reels/<nome>/voz-el                 # grava falaN.json (backup falaN.tts.json)
npm run transcrever -- audio.mp3 --model whisper-large-v3-turbo --out pasta
~~~

- Endpoint: `https://api.groq.com/openai/v1/audio/transcriptions` (compatível com OpenAI).
- `response_format=verbose_json` + `timestamp_granularities[]=word` e `segment`.
- Modelos: `whisper-large-v3` ($0,111/h, WER 10,3%) e `whisper-large-v3-turbo` ($0,04/h, WER 12%).
- Limites free tier: 20 RPM, 2.000 RPD, 7.200 s de áudio/hora, 28.800 s/dia; arquivo 25 MB;
  mínimo cobrado de 10 s por requisição.
- Formatos: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm; outros (opus, pcm) são convertidos
  automaticamente para flac 16 kHz mono.
- O JSON gerado mantém o formato usado por `sincronizar.py`: `{ texto, palavras: [{palavra,inicio,fim}], provider: "groq", timing: "word", ... }`.
- Sem `--sobrescrever`, o `falaN.json` original do TTS é copiado para `falaN.tts.json` antes.

**Quando usar:** Gemini (não tem timestamps por palavra), áudio gravado, conferência de sincronia
ou troca de provedor de voz sem perder o efeito "palavra acendendo".
