# Efeitos sonoros gerados por código (motor do claude-motion, MIT, em ../sons-sintetizados/sfx).
# Sem arquivos de áudio e sem licença de som: cada efeito é sintetizado na hora.
# Lê som/cues.json (o mesmo do gerar_cues.py) e grava som/sintetizado.wav com a duração do vídeo.
# uso (dentro da pasta do Reel): python -X utf8 som_sintetizado.py <duração-em-segundos>
import json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sons-sintetizados'))
from sfx.mix import Mix  # noqa: E402
from sfx.synth import blip, chime, click, impact, pop, riser, whoosh  # noqa: E402

DUR = float(sys.argv[1])
NOTAS = [1046.5, 1318.5, 1568.0, 2093.0]  # pops sobem em escala (dó maior), não repetem o mesmo som

cues = json.load(open('som/cues.json', encoding='utf-8'))
mix = Mix(DUR, seed=11)
n = 0
ultimo_whoosh = -9
for c in cues:
    t, ty = c['t'], c['type']
    if ty in ('scene_cut', 'movement'):
        if t - ultimo_whoosh < 0.3:  # troca de cena + celular entrando no mesmo instante: um whoosh só
            continue
        ultimo_whoosh = t
        mix.put(max(0, t - 0.12), whoosh(0.45, 300, 2200, peak=0.5), 0.12)
    elif ty == 'appear':
        f = NOTAS[n % 4]; n += 1
        mix.put(t, pop(f * 0.4, f * 0.18), 0.22)
    elif ty == 'click':
        mix.put(t, click(1800), 0.35)
    elif ty == 'success':
        mix.put(t, chime([1318.5, 1975.5, 2637.0], dur=1.0, tau=0.35), 0.10)
    elif ty == 'reveal':
        mix.put(t, impact(1.0), 0.30)
    elif ty == 'build_up':
        mix.put(t, riser(0.9, 300, 3600), 0.10)
    elif ty == 'typing':
        mix.typing(t, t + c.get('dur', 1.3), int(c.get('dur', 1.3) / 0.035))
    elif ty == 'hover_or_small_ui':
        mix.put(t, blip(880, dur=0.2, tau=0.06), 0.15)
st = mix.master(target_lufs=-18.0)
mix.write('som/sintetizado.wav')
print(f"som sintetizado: {mix.count} efeitos, {st['lufs']:.1f} LUFS, pico {st['peak_db']:.1f} dBFS")
