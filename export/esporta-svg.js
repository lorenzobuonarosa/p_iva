// Uso: node export/esporta-svg.js https://lorenzobuonarosa.github.io/p_iva/doppio-binario/ export/doppio-binario.svg
// Esporta una dataviz Radar in un SVG autonomo: grafico + testata + chiave + piede, stili in linea, font incorporati
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, url, out] = process.argv;
  const fontCSS = fs.readFileSync(__dirname + '/font-incorporati.css', 'utf8');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 760, height: 1000 } });
  await p.goto(url + '?theme=light'); await p.waitForTimeout(600); await p.mouse.wheel(0, 300); await p.waitForTimeout(400); await p.mouse.wheel(0, -300);
  await p.waitForTimeout(1800); await p.evaluate(() => document.fonts.ready);
  const svg = await p.evaluate((fontCSS) => {
    const NS = 'http://www.w3.org/2000/svg';
    const root = document.querySelector('.radar'), R0 = root.getBoundingClientRect();
    const W = Math.round(R0.width), H = Math.ceil(R0.height);
    const bg = getComputedStyle(document.body).backgroundColor;
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const parts = [];
    // testo HTML -> righe SVG (le righe si ricavano dalla posizione di ogni parola)
    function htmlText(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; const words = [];
      while ((n = walker.nextNode())) {
        if (!n.textContent.trim()) continue;
        const cs = getComputedStyle(n.parentElement); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const re = /\S+/g; let m;
        while ((m = re.exec(n.textContent))) {
          const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
          const rc = r.getClientRects()[0]; if (!rc) continue;
          words.push({ t: cs.textTransform === 'uppercase' ? m[0].toUpperCase() : m[0], x: rc.left - R0.left, y: rc.top - R0.top, h: rc.height, w: rc.width, cs });
        }
      }
      // raggruppa per riga e per stile, ricostruendo gli spazi
      const lines = [];
      words.forEach(w => { let L = lines.find(l => Math.abs(l.y - w.y) < w.h * 0.5); if (!L) { L = { y: w.y, ws: [] }; lines.push(L); } L.ws.push(w); });
      lines.forEach(L => {
        L.ws.sort((a, b) => a.x - b.x);
        let runs = [];
        L.ws.forEach(w => { const last = runs[runs.length - 1]; const key = w.cs.fontFamily + w.cs.fontSize + w.cs.fontWeight + w.cs.color;
          // un nuovo pezzo se cambia lo stile o se tra due parole c'è più di uno spazio (voci separate della chiave)
          const gap = last ? w.x - last.end : 0;
          if (last && last.key === key && gap < parseFloat(w.cs.fontSize) * 0.6) { last.t += ' ' + w.t; last.end = w.x + w.w; }
          else runs.push({ key, t: w.t, x: w.x, w, end: w.x + w.w }); });
        runs.forEach(r => { const cs = r.w.cs, fs = parseFloat(cs.fontSize);
          // linea di base: il testo sta nel box di riga; ~0,8 della dimensione del carattere dall'alto del box del glifo
          const base = r.w.y + (r.w.h - fs) / 2 + fs * 0.82;
          parts.push(`<text x="${r.x.toFixed(1)}" y="${base.toFixed(1)}" font-family="${esc(cs.fontFamily).replace(/"/g, "'")}" font-size="${cs.fontSize}" font-weight="${cs.fontWeight}" fill="${cs.color}" letter-spacing="${cs.letterSpacing === 'normal' ? 0 : cs.letterSpacing}" xml:space="preserve">${esc(r.t)}</text>`); });
      });
    }
    document.querySelectorAll('header .r-title, header .r-sub, .r-key, .r-foot span, .r-note').forEach(htmlText);
    // pastiglie della chiave
    document.querySelectorAll('.r-key .sw').forEach(sw => {
      const r = sw.getBoundingClientRect(), cs = getComputedStyle(sw);
      const x = r.left - R0.left, y = r.top - R0.top;
      const hatch = /hatch/.test(sw.className);
      const col = hatch ? cs.borderTopColor : cs.backgroundColor;
      if (hatch) {
        const id = 'k' + Math.random().toString(36).slice(2, 7);
        parts.push(`<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)"><rect width="4" height="4" fill="${bg}"/><line x1="1" x2="1" y1="0" y2="4" stroke="${col}" stroke-width="2"/></pattern></defs>`);
        parts.push(`<rect x="${x}" y="${y}" width="${r.width}" height="${r.height}" rx="2" fill="url(#${id})" stroke="${col}" stroke-width="1"/>`);
      } else parts.push(`<rect x="${x}" y="${y}" width="${r.width}" height="${r.height}" rx="2" fill="${col}"/>`);
    });
    // riga sopra il piede
    const f = document.querySelector('.r-foot'); if (f) { const r = f.getBoundingClientRect(); const y = r.top - R0.top + 0.5;
      parts.push(`<line x1="${r.left - R0.left}" x2="${r.right - R0.left}" y1="${y}" y2="${y}" stroke="${getComputedStyle(f).borderTopColor}" stroke-width="1"/>`); }
    // grafici: copia con gli stili calcolati in linea
    const PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linejoin', 'paint-order', 'opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor'];
    document.querySelectorAll('.r-chart svg').forEach(s => {
      const r = s.getBoundingClientRect(); const clone = s.cloneNode(true);
      const src = s.querySelectorAll('*'), dst = clone.querySelectorAll('*');
      src.forEach((el, i) => { const cs = getComputedStyle(el), d = dst[i];
        if (el.tagName === 'text' && cs.textTransform === 'uppercase') d.textContent = d.textContent.toUpperCase();
        if (el.tagName === 'text' && cs.letterSpacing !== 'normal') d.setAttribute('letter-spacing', cs.letterSpacing);
        d.removeAttribute('style'); d.removeAttribute('class');
        if (['title', 'defs', 'pattern'].includes(el.tagName)) return;
        PROPS.forEach(pn => { const v = cs.getPropertyValue(pn); if (!v) return;
          if (pn === 'paint-order' && v === 'normal') return; if (pn === 'stroke' && v === 'none') return;
          if (pn === 'stroke-dasharray' && v === 'none') return; if (pn === 'opacity' && v === '1') return; if (pn === 'fill-opacity' && v === '1') return;
          if (/^font|text-anchor/.test(pn) && el.tagName !== 'text' && el.tagName !== 'tspan') return;
          d.setAttribute(pn, v.replace(/"/g, "'")); });
      });
      clone.querySelectorAll('rect.hit, .hit').forEach(e => e.remove());
      clone.querySelectorAll('rect').forEach(e => { if (e.getAttribute('fill') === 'rgba(0, 0, 0, 0)' || e.getAttribute('fill') === 'transparent') e.remove(); });
      clone.removeAttribute('class'); clone.removeAttribute('style');
      parts.push(`<g transform="translate(${(r.left - R0.left).toFixed(1)},${(r.top - R0.top).toFixed(1)})">${clone.innerHTML}</g>`);
    });
    const title = document.querySelector('.r-title').textContent.trim();
    const label = document.querySelector('.r-chart svg').getAttribute('aria-label') || '';
    return `<svg xmlns="${NS}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label).replace(/"/g, '&quot;')}">
<title>${esc(title)}</title>
<style>${fontCSS}</style>
<rect width="${W}" height="${H}" fill="${bg}"/>
${parts.join('\n')}
</svg>`;
  }, fontCSS);
  fs.writeFileSync(out, svg); console.log('scritto', out, Math.round(svg.length / 1024) + ' KB');
  await b.close();
})();
