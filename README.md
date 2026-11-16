# Partite IVA e forfettario a 100mila euro – dataviz Radar QN

Cinque dataviz in D3 nello stile Radar per il pezzo sul DDL di bilancio 2027 (A.C. 3174-bis, art. 9): soglia del forfettario a 100mila euro per IRPEF e contributi, IVA ferma a 85mila.

Indice con anteprime e snippet: https://lorenzobuonarosa.github.io/p_iva/

| Dataviz | Cartella | Dati | Fonte |
|---|---|---|---|
| Una soglia per le tasse, un'altra per l'IVA | `doppio-binario/` | `data/doppio-binario.csv` | DDL di bilancio 2027, art. 9; Dossier Senato-Camera n. 793 |
| Quasi un forfettario su due incassa meno di 20mila euro l'anno | `fasce-ricavi/` | `data/fasce-ricavi.csv` | Corte dei conti, Relazione sul rendiconto 2025 (dati AdE); MEF |
| Il forfettario è un regime da professionisti | `settori/` | `data/settori.csv` | MEF – Dipartimento delle Finanze |
| La nuova soglia costa 323 milioni l'anno, il regime 3,4 miliardi | `costo/` | `data/costo.csv` | Relazione tecnica DDL bilancio 2027; Corte dei conti |
| Quanto pagheresti con la flat tax (calcolatore) | `contatore/` | `data/parametri-contatore.csv` | Elaborazione su DDL bilancio 2027, TUIR, INPS, MEF |

## Note sui dati

- CSV con separatore `;` e virgola decimale, UTF-8. Tutti i numeri mostrati sono letti dai CSV.
- `fasce-ricavi.csv`: la fascia 20-50mila è calcolata per differenza dal totale (riga `Totale`, 2.027.665), ed è più chiara nel grafico. Aggiunta la colonna `ricavi_zero` (72.000) per l'annotazione. Il campo `nota` della prima riga è tra virgolette perché contiene un `;`.
- L'imposta sostitutiva media nel sottotitolo di `fasce-ricavi` è una costante commentata nel codice: 3.791.816 migliaia di euro / 1.813.308 contribuenti (MEF) ≈ 2.091 euro.
- `costo`: il costo complessivo del regime (3,4 miliardi, 2025) è una stima della Corte dei conti; il costo della misura comprende la conferma a 35mila euro della soglia per i redditi da lavoro dipendente.

## Calcolatore (`contatore/`)

- Logica in `contatore/calc.js`, nessun numero nel codice: i parametri (INPS, IRPEF, detrazioni, addizionali, soglie) sono in `data/parametri-contatore.csv`; i coefficienti di redditività per gruppo di codici ATECO in `data/ateco-coefficienti.csv`.
- Codici ATECO: tabella dell'allegato 4 della legge 190/2014 (codici ATECO 2007). Con ATECO 2025 i coefficienti restano questi finché non ne arrivano di nuovi. Il lettore scrive il codice (es. 62.01) e il gruppo si sceglie da solo (vince il prefisso più lungo: 46.1 intermediari, 47.81 ambulanti alimentari, 47.82-47.89 altri ambulanti), oppure sceglie il gruppo dall'elenco. La colonna `prefissi` del CSV elenca i prefissi usati per il riconoscimento; `previdenza` e `gestione_artcom` sono le scelte predefinite del gruppo.
- Parametri INPS: valori **2026** (circolari INPS n. 8/2026 gestione separata e n. 14/2026 artigiani e commercianti). Vanno aggiornati con le circolari 2027 quando escono.
- Artigiani e commercianti: oltre 56.224 euro l'aliquota sale di un punto (25% / 25,48%), come da circolare 2026. Commercianti per commercio, ambulanti, intermediari; artigiani per le altre attività.
- Test: `node contatore/test.js` (professionista 90.000 GS costi 15%; commerciante 60.000 costi 40%; edile 110.000; 120.000 con forfettario spento; massimale; riconoscimento di 22 codici ATECO).

## Snippet per il CMS

Se in un articolo ci sono più dataviz, lo script può restare in ognuna (non si ripete, grazie al controllo `__radarQNv2`) oppure si tiene una volta sola. L'altezza iniziale è quella desktop: lo script la adatta e manda il tema del sito.

### doppio-binario

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/doppio-binario/" width="100%" height="690" frameborder="0" scrolling="no" title="Schema delle soglie IRPEF e IVA del forfettario"></iframe>
<script>
(function(){if(window.__radarQNv2)return;window.__radarQNv2=1;var O="https://lorenzobuonarosa.github.io";var MQ=window.matchMedia("(prefers-color-scheme:dark)");function frames(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),function(f){return(f.getAttribute("src")||"").indexOf(O+"/")===0;});}function theme(){var t=document.documentElement.getAttribute("data-theme");return t==="dark"||t==="light"?t:(MQ.matches?"dark":"light");}function bgOf(el){for(;el&&el.nodeType===1;el=el.parentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c !=="transparent"&&!/rgba\([^)]*,\s*0\)$/.test(c))return c;}return null;}function send(f){try{f.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:theme(),bg:bgOf(f.parentElement)},O);}catch(e){}}function sendAll(){frames().forEach(send);}window.addEventListener("message",function(e){if(e.origin !==O)return;var d=e.data;if(!d||d.sentinel !=="radar-qn"||d.type !=="height")return;frames().forEach(function(f){if(f.contentWindow !==e.source)return;var h=Math.ceil(+d.height);if(h > 0&&20000 > h)f.style.height=h+"px";send(f);});});new MutationObserver(function(){sendAll();setTimeout(sendAll,400);}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});if(MQ.addEventListener)MQ.addEventListener("change",sendAll);})();
</script>
```

### fasce-ricavi

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/fasce-ricavi/" width="100%" height="560" frameborder="0" scrolling="no" title="I forfettari per fascia di ricavi"></iframe>
<script>
(function(){if(window.__radarQNv2)return;window.__radarQNv2=1;var O="https://lorenzobuonarosa.github.io";var MQ=window.matchMedia("(prefers-color-scheme:dark)");function frames(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),function(f){return(f.getAttribute("src")||"").indexOf(O+"/")===0;});}function theme(){var t=document.documentElement.getAttribute("data-theme");return t==="dark"||t==="light"?t:(MQ.matches?"dark":"light");}function bgOf(el){for(;el&&el.nodeType===1;el=el.parentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c !=="transparent"&&!/rgba\([^)]*,\s*0\)$/.test(c))return c;}return null;}function send(f){try{f.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:theme(),bg:bgOf(f.parentElement)},O);}catch(e){}}function sendAll(){frames().forEach(send);}window.addEventListener("message",function(e){if(e.origin !==O)return;var d=e.data;if(!d||d.sentinel !=="radar-qn"||d.type !=="height")return;frames().forEach(function(f){if(f.contentWindow !==e.source)return;var h=Math.ceil(+d.height);if(h > 0&&20000 > h)f.style.height=h+"px";send(f);});});new MutationObserver(function(){sendAll();setTimeout(sendAll,400);}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});if(MQ.addEventListener)MQ.addEventListener("change",sendAll);})();
</script>
```

### settori

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/settori/" width="100%" height="630" frameborder="0" scrolling="no" title="Il forfettario per settore di attività"></iframe>
<script>
(function(){if(window.__radarQNv2)return;window.__radarQNv2=1;var O="https://lorenzobuonarosa.github.io";var MQ=window.matchMedia("(prefers-color-scheme:dark)");function frames(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),function(f){return(f.getAttribute("src")||"").indexOf(O+"/")===0;});}function theme(){var t=document.documentElement.getAttribute("data-theme");return t==="dark"||t==="light"?t:(MQ.matches?"dark":"light");}function bgOf(el){for(;el&&el.nodeType===1;el=el.parentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c !=="transparent"&&!/rgba\([^)]*,\s*0\)$/.test(c))return c;}return null;}function send(f){try{f.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:theme(),bg:bgOf(f.parentElement)},O);}catch(e){}}function sendAll(){frames().forEach(send);}window.addEventListener("message",function(e){if(e.origin !==O)return;var d=e.data;if(!d||d.sentinel !=="radar-qn"||d.type !=="height")return;frames().forEach(function(f){if(f.contentWindow !==e.source)return;var h=Math.ceil(+d.height);if(h > 0&&20000 > h)f.style.height=h+"px";send(f);});});new MutationObserver(function(){sendAll();setTimeout(sendAll,400);}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});if(MQ.addEventListener)MQ.addEventListener("change",sendAll);})();
</script>
```

### costo

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/costo/" width="100%" height="650" frameborder="0" scrolling="no" title="Quanto costa il forfettario allo Stato"></iframe>
<script>
(function(){if(window.__radarQNv2)return;window.__radarQNv2=1;var O="https://lorenzobuonarosa.github.io";var MQ=window.matchMedia("(prefers-color-scheme:dark)");function frames(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),function(f){return(f.getAttribute("src")||"").indexOf(O+"/")===0;});}function theme(){var t=document.documentElement.getAttribute("data-theme");return t==="dark"||t==="light"?t:(MQ.matches?"dark":"light");}function bgOf(el){for(;el&&el.nodeType===1;el=el.parentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c !=="transparent"&&!/rgba\([^)]*,\s*0\)$/.test(c))return c;}return null;}function send(f){try{f.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:theme(),bg:bgOf(f.parentElement)},O);}catch(e){}}function sendAll(){frames().forEach(send);}window.addEventListener("message",function(e){if(e.origin !==O)return;var d=e.data;if(!d||d.sentinel !=="radar-qn"||d.type !=="height")return;frames().forEach(function(f){if(f.contentWindow !==e.source)return;var h=Math.ceil(+d.height);if(h > 0&&20000 > h)f.style.height=h+"px";send(f);});});new MutationObserver(function(){sendAll();setTimeout(sendAll,400);}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});if(MQ.addEventListener)MQ.addEventListener("change",sendAll);})();
</script>
```

### contatore

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/contatore/" width="100%" height="1160" frameborder="0" scrolling="no" title="Calcolatore forfettario e ordinario"></iframe>
<script>
(function(){if(window.__radarQNv2)return;window.__radarQNv2=1;var O="https://lorenzobuonarosa.github.io";var MQ=window.matchMedia("(prefers-color-scheme:dark)");function frames(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),function(f){return(f.getAttribute("src")||"").indexOf(O+"/")===0;});}function theme(){var t=document.documentElement.getAttribute("data-theme");return t==="dark"||t==="light"?t:(MQ.matches?"dark":"light");}function bgOf(el){for(;el&&el.nodeType===1;el=el.parentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c !=="transparent"&&!/rgba\([^)]*,\s*0\)$/.test(c))return c;}return null;}function send(f){try{f.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:theme(),bg:bgOf(f.parentElement)},O);}catch(e){}}function sendAll(){frames().forEach(send);}window.addEventListener("message",function(e){if(e.origin !==O)return;var d=e.data;if(!d||d.sentinel !=="radar-qn"||d.type !=="height")return;frames().forEach(function(f){if(f.contentWindow !==e.source)return;var h=Math.ceil(+d.height);if(h > 0&&20000 > h)f.style.height=h+"px";send(f);});});new MutationObserver(function(){sendAll();setTimeout(sendAll,400);}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});if(MQ.addEventListener)MQ.addEventListener("change",sendAll);})();
</script>
```

## Pubblicazione

GitHub Pages dalla root del branch `main` (*Settings → Pages → Deploy from a branch → main / root*).
