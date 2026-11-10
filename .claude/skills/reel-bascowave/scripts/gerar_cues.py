# Gera som/cues.json (lista de efeitos sonoros) a partir dos tempos do proj/index.html.
# uso: python -X utf8 gerar_cues.py proj/index.html som/cues.json
import re, json, sys, os
h = open(sys.argv[1], encoding='utf-8').read()
cues = []
cenas = re.finditer(r'<div class="scene" data-s="([\d.]+)" data-e="([\d.]+)"([^>]*?)data-cap="([^"]+)">(.*?)(?=<div class="scene"|<!-- HUD)', h, re.S)
for m in cenas:
    s, e, attrs, cap, body = float(m[1]), float(m[2]), m[3], m[4], m[5]
    if s > 0: cues.append({"t": round(s, 3), "type": "scene_cut", "desc": "troca de cena"})
    toks = cap.split(' '); n = len(toks)
    wt = re.search(r'data-wt="([^"]*)"', attrs)
    wt = [float(x) for x in wt[1].split(',')] if wt else []
    v = re.search(r'data-v="([\d.]+)"', attrs)
    step = float(v[1]) / n if v else min(0.34, (e - s - 1.4) / n)
    # Pop em cada palavra que acende (o usuário gosta, com o pop do kit da sound-effects, NÃO a gota do Earshot)
    for i, tk in enumerate(toks):
        if tk.startswith('*') or tk.startswith('!'):
            at = s + 0.25 + (wt[i] if len(wt) == n else i * step)
            cues.append({"t": round(at, 3), "type": "appear", "desc": "destaque " + tk.strip('*!?.,')})
    for pm in re.finditer(r'class="pop ([^"]*)"[^>]*data-at="([\d.]+)"', body):
        if 'stamp' in pm[1]: cues.append({"t": round(s + float(pm[2]), 3), "type": "reveal", "desc": "selo"})
    # formato Editorial: pop quando o marca-texto passa na palavra-chave (.key data-hl)
    for km in re.finditer(r'<div class="key"[^>]*?data-hl="([\d.]+)"', body):
        cues.append({"t": round(s + float(km[1]), 3), "type": "appear", "desc": "marca-texto"})
    for tm in re.finditer(r'data-type="([\d.]+)"', body):
        cues.append({"t": round(s + float(tm[1]), 3), "type": "typing", "dur": 1.3, "desc": "digitação"})
    for sm in re.finditer(r'data-sfx="(\w+)"[^>]*data-at="([\d.]+)"|data-at="([\d.]+)"[^>]*data-sfx="(\w+)"', body):
        tipo, at = (sm[1], sm[2]) if sm[1] else (sm[4], sm[3])
        cues.append({"t": round(s + float(at), 3), "type": tipo, "desc": "efeito marcado"})
cues.sort(key=lambda c: c["t"])
out = []
for c in cues:  # dois sons a menos de 0,12 s um do outro: fica o primeiro
    if out and c["t"] - out[-1]["t"] < 0.12: continue
    out.append(c)
json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), "efeitos")
