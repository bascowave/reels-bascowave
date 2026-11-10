# Monta o kit de sons de UM Reel em <reel>/som/kit/ e grava <reel>/som/kit/manifest.json
# (mesmo formato da skill sound-effects, que o sound_pass.py lê).
#
#   Assinatura @bascowave (Earshot, gerado em código, local, sem custo):
#     pop    -> fica o pop do kit da sound-effects (a gota d'água do Earshot foi reprovada)
#     whoosh -> fica o whoosh do kit da sound-effects (o swipe/glide do Earshot foi reprovado)
#     impact -> cut_hit/air (selos)
#   Variação (Openverse, só CC0): --openverse <categoria>[,<categoria>] troca aquela categoria
#   por um som CC0 novo, diferente a cada Reel (semente = nome da pasta).
#
# uso: python -X utf8 kit_som.py <pasta-do-reel> [--openverse whoosh,impact]
import json, os, sys, subprocess, urllib.request, urllib.parse, hashlib, shutil

reel = os.path.abspath(sys.argv[1])
ov = sys.argv[sys.argv.index('--openverse') + 1].split(',') if '--openverse' in sys.argv else []
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
BASE = os.path.join(RAIZ, 'ferramentas', 'sfx')                  # biblioteca CC0 da sound-effects
kit = os.path.join(reel, 'som', 'kit'); os.makedirs(kit, exist_ok=True)
man = json.load(open(os.path.join(BASE, 'manifest.json'), encoding='utf-8'))
# caminhos absolutos para a biblioteca base continuar valendo como alternativa
for k in ('bundled', 'default_kit'):
    for e in man.get(k, []):
        if e.get('file') and not os.path.isabs(e['file']): e['file'] = os.path.join(BASE, e['file'])

ASSINATURA = {
    # whoosh: fica o do kit da sound-effects (o swipe/glide do Earshot na troca de cena foi reprovado em 2026-11-10)
    'impact': ('cut_hit/air', [], 'batida de ar'),
}
BUSCA = {'whoosh': 'whoosh', 'impact': 'soft impact', 'pop': 'water drop', 'click': 'ui click', 'riser': 'riser'}

def norm(src, dst):
    # corta silêncio do começo e deixa o pico em -1 dBFS (como os sons da biblioteca)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-14:TP=-1', '-ar', '48000', dst], check=True)

def earshot(cat):
    sid, extra, nota = ASSINATURA[cat]
    out = os.path.join(kit, f'{cat}-earshot.wav')
    subprocess.run(['earshot', 'sfx', 'render', sid, '-o', out, *extra], check=True, capture_output=True)
    return {'category': cat, 'title': f'{sid} ({nota})', 'creator': 'earshot (gerado em código)',
            'source': 'earshot bank, MIT', 'source_url': 'https://github.com/Leonxlnx/earshot',
            'license': 'CC0 1.0', 'credit': f'"{sid}" gerado com earshot (MIT), sem gravação de terceiros', 'file': out}

def openverse(cat):
    q = urllib.parse.urlencode({'q': BUSCA.get(cat, cat), 'license': 'cc0', 'page_size': 20})
    req = urllib.request.Request(f'https://api.openverse.org/v1/audio/?{q}', headers={'User-Agent': 'reel-bascowave/1.0'})
    res = [r for r in json.load(urllib.request.urlopen(req, timeout=30))['results']
           if r.get('license') == 'cc0' and (r.get('duration') or 9e9) <= 4000 and r.get('url')]
    if not res: raise SystemExit(f'Openverse não achou som CC0 curto para {cat}')
    r = res[int(hashlib.md5(os.path.basename(reel).encode()).hexdigest(), 16) % len(res)]  # muda a cada Reel
    bruto = os.path.join(kit, f'{cat}-openverse-bruto' + os.path.splitext(urllib.parse.urlparse(r['url']).path)[1])
    with urllib.request.urlopen(urllib.request.Request(r['url'], headers={'User-Agent': 'reel-bascowave/1.0'}), timeout=60) as f, open(bruto, 'wb') as o:
        shutil.copyfileobj(f, o)
    out = os.path.join(kit, f'{cat}-openverse.wav'); norm(bruto, out); os.remove(bruto)
    pag = r.get('foreign_landing_url') or r.get('url')
    return {'category': cat, 'title': r.get('title'), 'creator': r.get('creator') or '?', 'source': f"{r.get('source')} via Openverse (CC0)",
            'source_url': pag, 'license': 'CC0 1.0', 'credit': f"\"{r.get('title')}\" by {r.get('creator')} ({pag}), CC0", 'file': out}

novos = {}
for cat in ASSINATURA: novos[cat] = earshot(cat)
for cat in ov: novos[cat] = openverse(cat)
man['default_kit'] = [novos.get(e['category'], e) for e in man['default_kit']]
json.dump(man, open(os.path.join(kit, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for cat, e in novos.items(): print(f'{cat:7s} <- {e["title"]} [{e["source"]}]')
