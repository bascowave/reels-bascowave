# Converte data-w="k" (+ data-dw) em data-at fixo, usando o data-wt da cena (para o gerar_cues achar os sons).
import re, sys
p = sys.argv[1]
h = open(p, encoding='utf-8').read()
parts = re.split(r'(<div class="scene" [^>]*>)', h)
out = [parts[0]]
for i in range(1, len(parts), 2):
    tag, body = parts[i], parts[i + 1]
    wt = [float(x) for x in re.search(r'data-wt="([^"]*)"', tag)[1].split(',')]
    def rep(m):
        a = m[0]
        k = int(re.search(r'data-w="(\d+)"', a)[1])
        dw = re.search(r'data-dw="(-?[\d.]+)"', a)
        at = 0.25 + wt[min(k, len(wt) - 1)] + (float(dw[1]) if dw else 0)
        a = re.sub(r' data-dw="-?[\d.]+"', '', a)
        return re.sub(r'data-w="\d+"', f'data-at="{at:.2f}"', a)
    body = re.sub(r'<[^>]*data-w="\d+"[^>]*>', rep, body)
    out += [tag, body]
open(p, 'w', encoding='utf-8').write(''.join(out))
print('ok', h.count('data-w="'), '->', ''.join(out).count('data-w="'))
