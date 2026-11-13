#!/usr/bin/env bash
# Depois da narração aprovada: sincroniza, renderiza, põe os efeitos, mixa a voz e confere.
# uso: bash montar.sh <pasta-do-reel> <nome-do-arquivo-final>
# A pasta do Reel precisa ter: proj/ (HTML com as cenas), voz/falas.txt e voz-el/ (saída do npm run narrar).
set -e
K=$(cd "$(dirname "$0")/.." && pwd)
RAIZ=$(cd "$K/../../.." && pwd)
R=$(cd "${1:?uso: montar.sh <pasta-do-reel> <nome>}" && pwd); NOME=${2:-final}
SFX_PY="$RAIZ/ferramentas/.sound-effects/Scripts/python"   # venv com librosa
SFX_LIB="$RAIZ/ferramentas/sfx/manifest.json"              # biblioteca CC0 da sound-effects
cd "$R"; mkdir -p voz som out
mkdir -p /d/tmp                                             # o sound_pass grava em /tmp
python -X utf8 "$K/scripts/sincronizar.py"
bash ~/.claude/skills/claude-video/scripts/render.sh proj out/video.mp4 high >/dev/null 2>&1
python -I -X utf8 "$K/scripts/gerar_cues.py" proj/index.html som/cues.json
# kit de sons do Reel: assinatura Earshot (água) + OPENVERSE=whoosh,impact troca categorias por CC0 novos
if [ "$SOM" = "sintetizado" ]; then
  # SOM=sintetizado: efeitos gerados por código (motor do claude-motion), sem biblioteca de sons
  python -X utf8 "$K/scripts/som_sintetizado.py" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video.mp4)"
  rm -rf som/out; mkdir -p som/out
  ffmpeg -v error -y -i out/video.mp4 -i som/sintetizado.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k som/out/after.mp4
else
python -X utf8 "$K/scripts/kit_som.py" . ${OPENVERSE:+--openverse "$OPENVERSE"} && SFX_LIB="$R/som/kit/manifest.json"
rm -rf som/out
PYTHONUTF8=1 "$SFX_PY" -X utf8 ~/.claude/skills/sound-effects/scripts/sound_pass.py --video out/video.mp4 \
  --cues som/cues.json --music "$K/assets/guia-tempo.wav" --music-db -120 --music-source "sem trilha" \
  --music-license "n/a, sem música" --use-case "Instagram Reels" --manifest "$SFX_LIB" --out som/out >/dev/null 2>&1
fi
ffmpeg -v error -y -i som/out/after.mp4 -i voz/narracao.wav -filter_complex \
  "[1:a]highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80[v];[0:a]volume=0.4[s];[v][s]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-6:LRA=9,alimiter=limit=0.45:level=false[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 "out/$NOME.mp4"
echo "--- volume (meta: -16 LUFS, pico abaixo de -4 dBFS)"
ffmpeg -nostats -i "out/$NOME.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
echo "--- ritmo"
RITMO=$(PYTHONIOENCODING=utf-8 python ~/.claude/skills/claude-video/scripts/ritmo.py "out/$NOME.mp4" 2>&1 || true); echo "$RITMO" | tail -6
ffmpeg -v error -y -i "out/$NOME.mp4" -vf "fps=1/2,scale=150:-1,tile=11x2" -frames:v 1 out/quadros-2s.jpg
echo "pronto: $R/out/$NOME.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$NOME.mp4") s) · quadros: out/quadros-2s.jpg"
# entrega: cópia do final em "Vídeos prontos" com data no nome
PICO=$(ffmpeg -nostats -i "out/$NOME.mp4" -af ebur128=peak=true -f null - 2>&1 | grep "Peak:" | tail -1 | grep -oE "[-0-9.]+")
if awk "BEGIN{exit !($PICO > -4)}"; then echo "NÃO entregue: pico $PICO dBFS acima de -4"; exit 1; fi
if echo "$RITMO" | grep -q "^FALHOU"; then echo "NÃO entregue: ritmo reprovado, corrigir e montar de novo"; exit 1; fi
mkdir -p "$RAIZ/Vídeos prontos" && cp "out/$NOME.mp4" "$RAIZ/Vídeos prontos/$(date +%F)_$NOME.mp4" && echo "entregue: Vídeos prontos/$(date +%F)_$NOME.mp4"
