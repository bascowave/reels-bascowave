# Lê a narração de QUALQUER provedor (voz-el/falaN.mp3|wav|opus|pcm + falaN.json) e:
#  1. converte cada fala em voz/tN.wav;
#  2. reparte o tempo das cenas pela duração de cada fala (fala + 0,9 s, mínimo 2,8 s; a última ganha 3,3 s);
#  3. grava em cada cena do proj/index.html: data-s, data-e, data-v (duração da fala) e data-wt (início de cada palavra);
#  4. monta voz/narracao.wav com cada fala começando 0,25 s depois do início da sua cena.
# uso (dentro da pasta do Reel): python -X utf8 sincronizar.py
import json, re, subprocess, glob, os
n = len(glob.glob('voz-el/fala*.json'))
html = open('proj/index.html', encoding='utf-8').read()
cenas = list(re.finditer(r'<div class="scene" data-s="[\d.]+" data-e="[\d.]+"[^>]*?data-cap="([^"]+)">', html))
assert len(cenas) == n, f'{len(cenas)} cenas no HTML, mas {n} falas em voz-el/'

os.makedirs('voz', exist_ok=True)
durs, words = [], []
for i in range(n):
    audio = next((p for p in (f'voz-el/fala{i}.mp3', f'voz-el/fala{i}.wav', f'voz-el/fala{i}.opus', f'voz-el/fala{i}.pcm') if os.path.exists(p)), None)
    if not audio:
        raise SystemExit(f'fala{i}: nenhum audio em voz-el/ (.mp3/.wav/.opus/.pcm)')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', audio, '-ar', '48000', f'voz/t{i}.wav'], check=True)
    d = json.load(open(f'voz-el/fala{i}.json', encoding='utf-8'))
    words.append([p['inicio'] for p in d['palavras']])
    durs.append(float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'voz/t{i}.wav']).decode()))

lens = [max(d + 0.9, 2.8) for d in durs]; lens[-1] = max(durs[-1] + 3.3, 5.0)
starts = [0.0]
for L in lens[:-1]: starts.append(round(starts[-1] + L, 2))
total = round(starts[-1] + lens[-1], 2)

out, last = [], 0
for i, m in enumerate(cenas):
    ntok = len(m[1].split(' ')); k = len(words[i])
    wt = [round(words[i][min(k - 1, round(j * k / ntok))], 3) for j in range(ntok)]
    e = round(starts[i] + lens[i], 2) if i < n - 1 else round(total + 0.2, 2)
    out.append(html[last:m.start()])
    out.append(f'<div class="scene" data-s="{starts[i]}" data-e="{e}" data-v="{durs[i]:.2f}" data-wt="{",".join(map(str, wt))}" data-cap="{m[1]}">')
    last = m.end()
out.append(html[last:])
html = re.sub(r'data-duration="[\d.]+"', f'data-duration="{total}"', ''.join(out), count=1)
open('proj/index.html', 'w', encoding='utf-8').write(html)

ins = sum([['-i', f'voz/t{i}.wav'] for i in range(n)], [])
ms = [int((s + 0.25) * 1000) for s in starts]
f = ';'.join(f'[{i}]adelay={ms[i]}|{ms[i]}[a{i}]' for i in range(n))
# amix normalize=0 so existe em ffmpeg >= 4.4; em versoes antigas, compensa com volume.
try:
    ajuda = subprocess.run(['ffmpeg', '-hide_banner', '-h', 'filter=amix'], capture_output=True, text=True).stdout
    tem_normalize = 'normalize' in ajuda
except Exception:
    tem_normalize = False
mix = f'amix=inputs={n}:normalize=0' if tem_normalize else f'amix=inputs={n},volume={n}'
f += ';' + ''.join(f'[a{i}]' for i in range(n)) + f'{mix},apad[v]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', f, '-map', '[v]', '-t', str(total), '-ar', '48000', '-ac', '2', 'voz/narracao.wav'], check=True)
json.dump({'starts': starts, 'durs': durs, 'total': total}, open('voz/tempos.json', 'w'))
print(f'{n} cenas sincronizadas, {total} s')