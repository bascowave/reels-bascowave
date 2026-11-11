# Escolha de TTS (narração) — @bascowave

**Quando usar:** antes de qualquer narração de Reel, ou quando o usuário perguntar "qual voz/modelo usar?",
"quanto custa?", "dá para narrar de graça?". Use junto com a skill reel-bascowave (passo 6) e com TTS.md.

## Princípio: o agente escolhe, o usuário só dá a chave

O usuário NÃO precisa definir GEMINI_MODEL, GEMINI_VOICE, GEMINI_STYLE, FISH_MODEL ou FISH_VOICE no .env.
O agente lê o catálogo (npm run tts:info), entende o pedido e escolhe provedor + modelo + voz + style,
passando por flags. As variáveis no .env são apenas overrides opcionais para quem quiser fixar algo.

O que fica no .env.local (única responsabilidade do usuário):
- ELEVENLABS_API_KEY — ElevenLabs (pago)
- FISH_API_KEY — Fish Audio
- GEMINI_API_KEY (ou GOOGLE_API_KEY) — Gemini
- STABILITY — opcional, só ElevenLabs (0.7 aprovado)

Nunca peça ao usuário para escolher modelo ou voz: proponha você mesmo, com o motivo, e só depois de
mostrar custo/limites peça o "sim" quando houver gasto (ElevenLabs é pago).

## Passo a passo

1. **Classifique o pedido** (o que o Reel precisa):
   - Precisa de palavra sincronizada na tela (efeito "acender palavras")? → timestamps importam.
   - Idioma(s): pt-BR? outro? mais de 83 idiomas?
   - Emoção/dramatização forte? multi-speaker?
   - Pode gastar crédito? (ElevenLabs é pago; Fish e Gemini têm free tier)

2. **Consulte o catálogo e os limites** (sem chamar API):
   ~~~
   npm run tts:info
   npm run narrar:fish -- --list
   npm run narrar:gemini -- --list
   ~~~
   Para descobrir vozes:
   ~~~
   npm run narrar:fish -- --vozes       # lista vozes públicas pt (requer FISH_API_KEY)
   npm run narrar:gemini -- --vozes     # Voice Library do Gemini (requer GEMINI_API_KEY)
   ~~~
   Sem chave, --vozes mostra as 30 vozes prebuilt conhecidas do Gemini.

3. **Decida com a matriz** (abaixo) e diga ao usuário o que escolheu e por quê.

4. **Simule o custo** antes de narrar:
   ~~~
   npm run narrar -- <falas.txt> <saida> --dry-run
   npm run narrar:fish -- <falas.txt> <saida> --dry-run
   npm run narrar:gemini -- <falas.txt> <saida> --dry-run
   ~~~
   O dry-run imprime modelo, voz, limites, caracteres e bytes — sem chamar a API.

5. **Peça aprovação quando houver custo.** ElevenLabs é pago: informe quantos caracteres serão gastos e
   espere o "sim". Nos free tiers, avise que são gratuitos mas têm limites/temporariedade.

6. **Narre** com as flags escolhidas:
   ~~~
   npm run narrar:fish -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el --model s2.1-pro-free --voice <reference_id>
   npm run narrar:gemini -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el --model gemini-3.8-flash-tts --voice Kore --style "narração clara e envolvente"
   STABILITY=0.7 npm run narrar -- reels/<nome>/voz/falas.txt reels/<nome>/voz-el Qrdut83w0Cr152Yb4Xn3
   ~~~

7. **Registre a escolha** no Reel para reprodutibilidade: salve reels/<nome>/voz-escolha.json
   ~~~
   {
     "provider": "fish",
     "model": "s2.1-pro-free",
     "voice": "<reference_id ou null>",
     "style": null,
     "timing": "segment",
     "motivo": "free tier com timestamps por segmento; sem SLA",
     "refs": ["https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits"]
   }
   ~~~

## Matriz de decisão

| Situação | Escolha | Por quê |
|---|---|---|
| Reel padrão @bascowave, pt-BR, precisa de palavras sincronizadas, sem gastar | **Fish s2.1-pro-free** | Grátis até 30/11/2026, timestamps por segmento, 83 idiomas |
| Sincronia por palavra + voz Paulo (pt-BR) + estabilidade máxima, e há crédito aprovado | **ElevenLabs eleven_v4, voz Paulo** | Timestamps por palavra, sotaque BR aprovado |
| Muitos idiomas (mais de 83), dramatização, multi-speaker, aceita timestamps aproximados | **Gemini 3.8 Flash TTS** | 130+ idiomas, style + tags, 30 vozes, multi-speaker |
| Produção com SLA/garantia, sem retenção de dados, orçamento disponível | **Fish s2.1-pro pago** | Mesmo modelo, com SLA e sem retenção |
| Volume alto e barato | **Gemini 3.8 Flash-Lite TTS** | Rápido e mais barato no Cloud |
| Experimento sem chave/API | **--dry-run** | Mostra o plano sem gastar |

Heurística em código: **tts-modelos.mjs** exporta escolherProvedor() e escolherVozGemini(); os scripts
usam a mesma lógica para o default e imprimem os avisos.

## Modelos e limites (referências)

### Fish Audio — https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits
| Modelo | Preço | Timestamps | Temporário? | Observações |
|---|---|---|---|---|
| s2.1-pro-free | $0 (Fair Use) | segmento | Sim — até 30/11/2026 | Sem SLA; dados podem ser usados para treino; concorrência 5 |
| s2.1-pro | $15 / 1M UTF-8 bytes | segmento | Não | SLA no plano pago; sem retenção |
| s2-pro | $15 / 1M UTF-8 bytes | segmento | Não | Geração anterior (S2.1 venceu 61% em teste cego) |
| drama-3 | $50 / 1M (promo $10 até 30/11/2026) | segmento | Não | Mais emotivo, para diálogo/dramatização |
| s1 | $15 / 1M | segmento | Não (retira 31/12/2026) | Deprecado; cai para s2.1-pro |

- 83 idiomas; ~90 ms TTFA no padrão; voice cloning por reference_id.
- Free tier: sem cap rígido de caracteres, mas Fair Use; uso comercial acima de $1M ARR exige contato.
- Descubra vozes: https://fish.audio/voices ou --vozes (GET /model?language=pt&sort_by=score).

### Gemini TTS — https://aistudio.google.com/docs/speech-generation
| Modelo | Custo | Timestamps | Idiomas | Notas |
|---|---|---|---|---|
| gemini-3.8-flash-tts | Free tier AI Studio (3 RPM / 10k TPM / 10 RPD) ou Cloud pago | Não (aproximado) | 130+ | Flagship criativo; multi-speaker 2 vozes; voice design |
| gemini-3.8-flash-lite-tts | Free tier / Cloud pago | Não | 100+ | Rápido e barato para volume |
| gemini-3.1-flash-tts-preview | Cloud pago | Não | 100+ | Migrar para 3.8 Flash-Lite |
| gemini-2.5-pro-preview-tts | Cloud pago | Não | 24+ | Legado |

- Cloud TTS: $0,50/1M tokens de entrada + $9/1M tokens de áudio (até 31/12/2026; dobra em 2027);
  Flash-Lite: $6/1M de áudio. Áudio ≈ 25 tokens por segundo.
- Saída unary: WAV 24 kHz mono. Streaming: PCM l16.
- 30 vozes prebuilt (Kore, Puck, Charon, Sulafat...), Extended Voice Library e Voice design.
- ATENÇÃO: sem timestamps por palavra. Para o efeito de palavras acendendo, prefira Fish ou ElevenLabs.

### ElevenLabs — https://elevenlabs.io/pricing
- Modelo eleven_v4 (fixo no narrar.mjs). Voz Paulo (pt-BR) Qrdut83w0Cr152Yb4Xn3, stability 0.7 aprovada.
- Timestamps por palavra (convertWithTimestamps).
- Créditos pagos; free tier ~10k créditos/mês (~6-10 min). Regra: informar caracteres e esperar o "sim".

## Escolha de voz

- **Gemini**: use o traço oficial para casar com o tom. Narração clara → Kore (Firm); explicativo → Charon
  (Informative); energia → Puck (Upbeat); caloroso → Sulafat (Warm); autoridade → Algenib (Gravelly);
  claro/pronúncia → Iapetus (Clear). Passe por --voice ou deixa o script escolher Kore para narração.
  Style: comece vazio; adicione curto (ex.: "narração clara e envolvente") só se precisar.
- **Fish**: reference_id da Voice Library; sem referência, usa a voz padrão da conta. Para pt-BR, busque
  vozes com idioma pt e ouça antes; não presuma voz brasileira.
- **ElevenLabs**: Paulo para pt-BR; George é o padrão antigo (inglês).

## Apresentar as vozes ao usuário (obrigatório)

Quando o agente for escolher a voz, NÃO despeje a lista crua (100+ vozes). Apresente 3 a 4 opções
curadas, cada uma com: **id**, **descrição em português** e **para que serve**. Use ask_user_question
com opções (o usuário escolhe pelo uso, não pelo nome técnico).

Exemplo de pergunta:
- "Qual voz combina com este Reel?"
  - pt-br-advisor-3 — feminina, 45 anos, confiante e clara; narração principal.
  - pt-br-advisor-9 — masculina, 45 anos, objetiva e direta; tutorial/passo a passo.
  - Narrador Propagandas (Fish) — masculina, profissional e confiante; anúncio/corporativo.
  - pt-br-assistant-11 — masculina, 33 anos, grave e aveludada; suspense/dramático.

Atalhos por cenário (pt-BR):
| Cenário | Gemini (nativo) | Fish Audio | ElevenLabs |
|---|---|---|---|
| Narração principal séria | pt-br-advisor-3, pt-br-advisor-9 | NARRADOR (d0a102...), Melhor narrador (b2f48e...) | adicionar Antônio (biblioteca) |
| Educativo/conversa | pt-br-advisor-5, pt-br-assistant-5 | Narrador Persuasivo (d8178b...) | adicionar Lucas Gabriel |
| Energético/anúncio | pt-br-advisor-6, pt-br-assistant-2 | Narrador Propagandas (df1fa6...) | adicionar Teresinha |
| Grave/dramático | pt-br-assistant-11 | narrador oficial (e2b7e2...) | adicionar Antônio |
| Acolhedor/storytelling | pt-br-advisor-1, pt-br-advisor-7 | NARRADOR (d0a102...) | adicionar Jorge |

Lembre ao usuário:
- Gemini prebuilt (Kore, Puck...) são en-US: podem sair com sotaque; para pt-BR nativo use pt-br-*.
- Fish: vozes de terceiros; confirmar direitos antes de usar em marca.
- ElevenLabs: a conta atual não tem voz pt-BR; a voz Paulo (Qrdut83w0Cr152Yb4Xn3) não existe nesta
  conta (voice_not_found). Para usar, adicione a voz no painel; o ID muda ao adicionar.
- Depois da escolha, registre em reels/<nome>/voz-escolha.json.

## O que avisar ao usuário (template)

"Vou narrar com **<provedor> · <modelo> · voz <voz>**. Isso gasta <N> caracteres (<X> bytes UTF-8).
Free tier: <sim/não> <prazo>. Timestamps: <palavra/segmento/aproximado>. <custo se pago>.
Pode rodar?"

Se o free tier da Fish tiver expirado: avise e ofereça s2.1-pro pago, Gemini (com timestamps aproximados)
ou ElevenLabs — nunca mude de provedor sem dizer.

## Não faça

- Não peça ao usuário para definir modelo/voz no .env.local — escolha você e explique.
- Não invente modelo, preço ou limite: consulte tts-modelos.mjs/TTS.md e as fontes oficiais.
- Não narre com ElevenLabs sem aprovação de caracteres.
- Não use Gemini quando o Reel depende de palavra sincronizada sem avisar que o tempo será aproximado.
- Não regrave áudio já aprovado só para testar voz: dry-run não gasta, narração gasta.