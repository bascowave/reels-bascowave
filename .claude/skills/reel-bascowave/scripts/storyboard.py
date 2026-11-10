# Gera <reel>/storyboard/storyboard.html: uma linha por cena com a imagem de como a cena fica, o tempo,
# o texto na tela, a fala da narração e os efeitos sonoros (o quê e em que segundo).
# Obrigatório antes de narrar: o usuário aprova imagem + texto + fala + sons de uma vez.
# uso: python -X utf8 storyboard.py <pasta-do-reel>
import os, re, sys, json, html, subprocess, shutil, glob, base64

R = os.path.abspath(sys.argv[1]); K = os.path.dirname(os.path.abspath(__file__))
SB = os.path.join(R, 'storyboard'); shutil.rmtree(SB, ignore_errors=True); os.makedirs(SB)
h = open(os.path.join(R, 'proj', 'index.html'), encoding='utf-8').read()
cenas = list(re.finditer(r'<div class="scene" data-s="([\d.]+)" data-e="([\d.]+)"([^>]*?)data-cap="([^"]+)">(.*?)(?=<div class="scene"|<!-- HUD|<div id="foot")', h, re.S))
falas_p = os.path.join(R, 'voz', 'falas.txt')
falas = [l.strip() for l in open(falas_p, encoding='utf-8') if l.strip()] if os.path.exists(falas_p) else []

# 1) imagens: um quadro por cena, 0,35 s antes do fim (tudo já entrou)
tempos = [max(float(m[1]) + 0.3, float(m[2]) - 0.35) for m in cenas]
snap = os.path.join(SB, '_snap')
subprocess.run(['npx', '--yes', 'hyperframes@0.8.181', 'snapshot', os.path.join(R, 'proj'), '--at',
                ','.join(f'{t:.2f}' for t in tempos), '--no-end', '-o', snap], check=True, capture_output=True, shell=os.name == 'nt')
pngs = sorted(glob.glob(os.path.join(snap, 'frame-*.png')))
for i, p in enumerate(pngs):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-vf', 'scale=360:-2', '-q:v', '4', os.path.join(SB, f'cena{i:02d}.jpg')], check=True)
shutil.rmtree(snap, ignore_errors=True)

# 2) efeitos sonoros previstos (mesma lógica do montar.sh)
cues_p = os.path.join(SB, 'cues.json')
subprocess.run([sys.executable, '-I', '-X', 'utf8', os.path.join(K, 'gerar_cues.py'), os.path.join(R, 'proj', 'index.html'), cues_p], check=True, capture_output=True)
cues = json.load(open(cues_p, encoding='utf-8'))
NOME = {'scene_cut': ('whoosh', 'troca de cena'), 'appear': ('pop', 'destaque'), 'reveal': ('impacto', 'selo/número'),
        'typing': ('digitação', 'texto sendo digitado'), 'success': ('pop de sucesso', 'confirmação'), 'click': ('clique', '')}

def texto_tela(m):
    corpo = m[5]
    partes = re.findall(r'class="(?:[^"]*\s)?(?:kick|key|title|cap-t|digit|cap-n)(?:\s[^"]*)?"[^>]*>(.*?)</div>', corpo, re.S)
    partes = [re.sub(r'<[^>]+>', ' ', p).strip() for p in partes]
    partes = [re.sub(r'\s+', ' ', p) for p in partes if p]
    return partes or [m[4].replace('*', '').replace('!', '')]

linhas = []
for i, m in enumerate(cenas):
    s, e = float(m[1]), float(m[2])
    sons = [c for c in cues if s - 0.05 <= c['t'] < e - 0.05]
    sons_html = ''.join(f'<li><b>{NOME.get(c["type"], (c["type"], ""))[0]}</b> <span>{c["t"] - s:+.1f} s · {html.escape(c.get("desc", ""))}</span></li>' for c in sons) or '<li class="vazio">sem efeito</li>'
    tela = ''.join(f'<p>{html.escape(t)}</p>' for t in texto_tela(m))
    fala = html.escape(falas[i]) if i < len(falas) else '<i>(fala ainda não escrita)</i>'
    # imagem embutida no próprio HTML: o arquivo abre completo mesmo enviado sozinho
    jpg = os.path.join(SB, f'cena{i:02d}.jpg')
    src = 'data:image/jpeg;base64,' + base64.b64encode(open(jpg, 'rb').read()).decode() if os.path.exists(jpg) else ''
    linhas.append(f'''<article><img src="{src}" alt="cena {i + 1}">
<div class="info"><div class="n">Cena {i + 1}<span>{s:.1f}–{e:.1f} s</span></div>
<h3>Na tela</h3>{tela}<h3>Fala</h3><p class="fala">“{fala}”</p><h3>Efeitos</h3><ul>{sons_html}</ul></div></article>''')

tot = len(''.join(falas))
contagem = {}
for c in cues: contagem[NOME.get(c['type'], (c['type'],))[0]] = contagem.get(NOME.get(c['type'], (c['type'],))[0], 0) + 1
resumo = ' · '.join(f'{v}× {k}' for k, v in contagem.items())
pagina = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storyboard · {html.escape(os.path.basename(R))}</title>
<style>
:root{{--bg:#F4F3EF;--ink:#111114;--mute:#6B707A;--azul:#34B5DF;--card:#fff}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0E1A26;--ink:#EEF2F6;--mute:#9AA6B2;--card:#15263A}}}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,sans-serif;padding:24px 16px}}
header{{max-width:1100px;margin:0 auto 20px}} h1{{margin:0 0 6px;font-size:26px}} .meta{{color:var(--mute)}}
.meta b{{color:var(--ink)}} main{{max-width:1100px;margin:0 auto;display:grid;gap:16px}}
article{{display:grid;grid-template-columns:200px 1fr;gap:18px;background:var(--card);border-radius:14px;padding:14px;box-shadow:0 4px 18px rgba(0,0,0,.06)}}
img{{width:200px;border-radius:8px;display:block}} .n{{font-weight:700;font-size:18px;margin-bottom:6px}} .n span{{color:var(--mute);font-weight:400;margin-left:10px;font-size:14px}}
h3{{margin:10px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}} p{{margin:2px 0}}
.fala{{font-style:italic}} ul{{margin:0;padding-left:18px}} li span{{color:var(--mute);font-size:14px}} li b{{color:var(--azul)}} .vazio{{color:var(--mute)}}
@media (max-width:600px){{article{{grid-template-columns:1fr}} img{{width:100%;max-width:260px}}}}
</style></head><body><header><h1>Storyboard · {html.escape(os.path.basename(R))}</h1>
<div class="meta">{len(cenas)} cenas · <b>{tot} caracteres</b> de narração · efeitos: {resumo}</div></header>
<main>{''.join(linhas)}</main></body></html>'''
open(os.path.join(SB, 'storyboard.html'), 'w', encoding='utf-8').write(pagina)
os.remove(cues_p)
print(f'storyboard: {os.path.join(SB, "storyboard.html")} ({len(cenas)} cenas, {tot} caracteres, {resumo})')
