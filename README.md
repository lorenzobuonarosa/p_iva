# Partite IVA e forfettario a 100mila euro – dataviz Radar QN

Cinque dataviz in D3 nello stile Radar per il pezzo sul DDL di bilancio 2027 (A.C. 3174-bis, art. 9): soglia del forfettario a 100mila euro per IRPEF e contributi, IVA ferma a 85mila.

Indice con anteprime e snippet: https://lorenzobuonarosa.github.io/p_iva/

| Dataviz | Cartella | Dati | Fonte |
|---|---|---|---|
| Una soglia per le tasse, un'altra per l'IVA | `doppio-binario/` | `data/doppio-binario.csv` | DDL di bilancio 2027, art. 9; Dossier Senato-Camera n. 793 |
| Quasi un forfettario su due incassa meno di 20mila euro l'anno | `fasce-ricavi/` | `data/fasce-ricavi.csv` | Corte dei conti, Relazione sul rendiconto 2025 (dati AdE); MEF |
| Il forfettario è un regime da professionisti | `settori/` | `data/settori.csv` | MEF – Dipartimento delle Finanze |
| La nuova soglia costa 323 milioni l'anno, il regime 3,4 miliardi | `costo/` | `data/costo.csv` | Relazione tecnica DDL bilancio 2027; Corte dei conti |
| Quanto pagheresti con la flat tax (calcolatore del conto: imposte e contributi) | `contatore/` | `data/parametri-contatore.csv` | Elaborazione su DDL bilancio 2027, TUIR, INPS, MEF |

## Note sui dati

- CSV con separatore `;` e virgola decimale, UTF-8. Tutti i numeri mostrati sono letti dai CSV.
- `fasce-ricavi.csv`: la fascia 20-50mila è calcolata per differenza dal totale (riga `Totale`, 2.027.665), segnalata solo nel tooltip (nel grafico è blu come le altre, scelta redazionale). Aggiunta la colonna `ricavi_zero` (72.000) per l'annotazione. Il campo `nota` della prima riga è tra virgolette perché contiene un `;`.
- L'imposta sostitutiva media nel sottotitolo di `fasce-ricavi` è una costante commentata nel codice: 3.791.816 migliaia di euro / 1.813.308 contribuenti (MEF) ≈ 2.091 euro.
- `costo`: il costo complessivo del regime (3,4 miliardi, 2025) è una stima della Corte dei conti; il costo della misura comprende la conferma a 35mila euro della soglia per i redditi da lavoro dipendente.

## Calcolatore (`contatore/`)

- Il lettore inserisce incassi, codice ATECO, previdenza, clienti e sceglie il regime (forfettario o ordinario); le spese reali si chiedono solo con l'ordinario. Il risultato è il conto: totale da pagare (imposte + contributi), con tutti i passaggi del calcolo e una barra che mostra dove vanno gli incassi. Oltre la soglia di uscita immediata (115.000 euro) il forfettario si disattiva e il calcolo prosegue con l'ordinario. Il confronto tra i regimi resta in una riga, solo in modalità ordinario.
- Logica in `contatore/calc.js`, nessun numero nel codice: i parametri (INPS, IRPEF, detrazioni, addizionali, soglie) sono in `data/parametri-contatore.csv`; i coefficienti di redditività per gruppo di codici ATECO in `data/ateco-coefficienti.csv`.
- Codici ATECO: tabella dell'allegato 4 della legge 190/2014 (codici ATECO 2007). Con ATECO 2025 i coefficienti restano questi finché non ne arrivano di nuovi. Il lettore scrive il codice (es. 62.01) e il gruppo si sceglie da solo (vince il prefisso più lungo: 46.1 intermediari, 47.81 ambulanti alimentari, 47.82-47.89 altri ambulanti), oppure sceglie il gruppo dall'elenco. La colonna `prefissi` del CSV elenca i prefissi usati per il riconoscimento; `previdenza` e `gestione_artcom` sono le scelte predefinite del gruppo.
- Parametri INPS: valori **2026** (circolari INPS n. 8/2026 gestione separata e n. 14/2026 artigiani e commercianti). Vanno aggiornati con le circolari 2027 quando escono.
- Artigiani e commercianti: oltre 56.224 euro l'aliquota sale di un punto (25% / 25,48%), come da circolare 2026. Commercianti per commercio, ambulanti, intermediari; artigiani per le altre attività.
- Test: `node contatore/test.js` (professionista 90.000 GS costi 15%; commerciante 60.000 costi 40%; edile 110.000; 120.000 con forfettario spento; massimale; riconoscimento di 22 codici ATECO).

## Snippet per il CMS

Ogni iframe ha il codice per altezza e tema nell'attributo `onload`, e lo snippet del contatore ha anche lo `<script>`.
Serve perché la sezione Radar di QN inserisce l'articolo con JavaScript e lì i `<script>` incollati nel testo non partono, mentre `onload` sì;
nella pagina articolo normale partono entrambi, ma il controllo `__radarQNv2` evita che il lavoro si ripeta.
Il tema viene dal colore reale dello sfondo dietro l'iframe (il Radar inverte il tema del sito), poi da `data-theme`.
Le altezze iniziali sono quelle della colonna articolo di QN (circa 640px); lo script poi le adatta.

### doppio-binario

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/doppio-binario/" width="100%" height="745" frameborder="0" scrolling="no" title="Schema delle soglie IRPEF e IVA del forfettario" onload='!function(){if(!window.__radarQNv2){window.__radarQNv2=1;var t="https://lorenzobuonarosa.github.io",e=window.matchMedia("(prefers-color-scheme: dark)");window.addEventListener("message",(function(e){if(e.origin===t){var r=e.data;r&amp;&amp;"radar-qn"===r.sentinel&amp;&amp;"height"===r.type&amp;&amp;n().forEach((function(t){if(t.contentWindow===e.source){var n=Math.ceil(+r.height);n>0&amp;&amp;2e4>n&amp;&amp;(t.style.height=n+"px"),a(t)}}))}})),new MutationObserver((function(){i(),setTimeout(i,400)})).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),e.addEventListener&amp;&amp;e.addEventListener("change",i),i(),setTimeout(i,800),setTimeout(i,2500)}function n(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),(function(e){return 0===(e.getAttribute("src")||"").indexOf(t+"/")}))}function r(t){var n=t&amp;&amp;t.match(/[\d.]+/g);if(n&amp;&amp;n.length>=3)return(.299*n[0]+.587*n[1]+.114*n[2])/255>.5?"light":"dark";var r=document.documentElement.getAttribute("data-theme");return"dark"===r||"light"===r?r:e.matches?"dark":"light"}function a(e){try{var n=function(t){for(;t&amp;&amp;1===t.nodeType;t=t.parentElement){var e=getComputedStyle(t).backgroundColor;if(e&amp;&amp;"transparent"!==e&amp;&amp;!/rgba\([^)]*,\s*0\)$/.test(e))return e}return null}(e.parentElement);e.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:r(n),bg:n},t)}catch(t){}}function i(){n().forEach(a)}}();'></iframe>
```

### fasce-ricavi

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/fasce-ricavi/" width="100%" height="580" frameborder="0" scrolling="no" title="I forfettari per fascia di ricavi" onload='!function(){if(!window.__radarQNv2){window.__radarQNv2=1;var t="https://lorenzobuonarosa.github.io",e=window.matchMedia("(prefers-color-scheme: dark)");window.addEventListener("message",(function(e){if(e.origin===t){var r=e.data;r&amp;&amp;"radar-qn"===r.sentinel&amp;&amp;"height"===r.type&amp;&amp;n().forEach((function(t){if(t.contentWindow===e.source){var n=Math.ceil(+r.height);n>0&amp;&amp;2e4>n&amp;&amp;(t.style.height=n+"px"),a(t)}}))}})),new MutationObserver((function(){i(),setTimeout(i,400)})).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),e.addEventListener&amp;&amp;e.addEventListener("change",i),i(),setTimeout(i,800),setTimeout(i,2500)}function n(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),(function(e){return 0===(e.getAttribute("src")||"").indexOf(t+"/")}))}function r(t){var n=t&amp;&amp;t.match(/[\d.]+/g);if(n&amp;&amp;n.length>=3)return(.299*n[0]+.587*n[1]+.114*n[2])/255>.5?"light":"dark";var r=document.documentElement.getAttribute("data-theme");return"dark"===r||"light"===r?r:e.matches?"dark":"light"}function a(e){try{var n=function(t){for(;t&amp;&amp;1===t.nodeType;t=t.parentElement){var e=getComputedStyle(t).backgroundColor;if(e&amp;&amp;"transparent"!==e&amp;&amp;!/rgba\([^)]*,\s*0\)$/.test(e))return e}return null}(e.parentElement);e.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:r(n),bg:n},t)}catch(t){}}function i(){n().forEach(a)}}();'></iframe>
```

### settori

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/settori/" width="100%" height="660" frameborder="0" scrolling="no" title="Il forfettario per settore di attività" onload='!function(){if(!window.__radarQNv2){window.__radarQNv2=1;var t="https://lorenzobuonarosa.github.io",e=window.matchMedia("(prefers-color-scheme: dark)");window.addEventListener("message",(function(e){if(e.origin===t){var r=e.data;r&amp;&amp;"radar-qn"===r.sentinel&amp;&amp;"height"===r.type&amp;&amp;n().forEach((function(t){if(t.contentWindow===e.source){var n=Math.ceil(+r.height);n>0&amp;&amp;2e4>n&amp;&amp;(t.style.height=n+"px"),a(t)}}))}})),new MutationObserver((function(){i(),setTimeout(i,400)})).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),e.addEventListener&amp;&amp;e.addEventListener("change",i),i(),setTimeout(i,800),setTimeout(i,2500)}function n(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),(function(e){return 0===(e.getAttribute("src")||"").indexOf(t+"/")}))}function r(t){var n=t&amp;&amp;t.match(/[\d.]+/g);if(n&amp;&amp;n.length>=3)return(.299*n[0]+.587*n[1]+.114*n[2])/255>.5?"light":"dark";var r=document.documentElement.getAttribute("data-theme");return"dark"===r||"light"===r?r:e.matches?"dark":"light"}function a(e){try{var n=function(t){for(;t&amp;&amp;1===t.nodeType;t=t.parentElement){var e=getComputedStyle(t).backgroundColor;if(e&amp;&amp;"transparent"!==e&amp;&amp;!/rgba\([^)]*,\s*0\)$/.test(e))return e}return null}(e.parentElement);e.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:r(n),bg:n},t)}catch(t){}}function i(){n().forEach(a)}}();'></iframe>
```

### costo

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/costo/" width="100%" height="670" frameborder="0" scrolling="no" title="Quanto costa il forfettario allo Stato" onload='!function(){if(!window.__radarQNv2){window.__radarQNv2=1;var t="https://lorenzobuonarosa.github.io",e=window.matchMedia("(prefers-color-scheme: dark)");window.addEventListener("message",(function(e){if(e.origin===t){var r=e.data;r&amp;&amp;"radar-qn"===r.sentinel&amp;&amp;"height"===r.type&amp;&amp;n().forEach((function(t){if(t.contentWindow===e.source){var n=Math.ceil(+r.height);n>0&amp;&amp;2e4>n&amp;&amp;(t.style.height=n+"px"),a(t)}}))}})),new MutationObserver((function(){i(),setTimeout(i,400)})).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),e.addEventListener&amp;&amp;e.addEventListener("change",i),i(),setTimeout(i,800),setTimeout(i,2500)}function n(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),(function(e){return 0===(e.getAttribute("src")||"").indexOf(t+"/")}))}function r(t){var n=t&amp;&amp;t.match(/[\d.]+/g);if(n&amp;&amp;n.length>=3)return(.299*n[0]+.587*n[1]+.114*n[2])/255>.5?"light":"dark";var r=document.documentElement.getAttribute("data-theme");return"dark"===r||"light"===r?r:e.matches?"dark":"light"}function a(e){try{var n=function(t){for(;t&amp;&amp;1===t.nodeType;t=t.parentElement){var e=getComputedStyle(t).backgroundColor;if(e&amp;&amp;"transparent"!==e&amp;&amp;!/rgba\([^)]*,\s*0\)$/.test(e))return e}return null}(e.parentElement);e.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:r(n),bg:n},t)}catch(t){}}function i(){n().forEach(a)}}();'></iframe>
```

### contatore

```html
<iframe src="https://lorenzobuonarosa.github.io/p_iva/contatore/" width="100%" height="1570" frameborder="0" scrolling="no" title="Calcolatore forfettario e ordinario" onload='!function(){if(!window.__radarQNv2){window.__radarQNv2=1;var t="https://lorenzobuonarosa.github.io",e=window.matchMedia("(prefers-color-scheme: dark)");window.addEventListener("message",(function(e){if(e.origin===t){var r=e.data;r&amp;&amp;"radar-qn"===r.sentinel&amp;&amp;"height"===r.type&amp;&amp;n().forEach((function(t){if(t.contentWindow===e.source){var n=Math.ceil(+r.height);n>0&amp;&amp;2e4>n&amp;&amp;(t.style.height=n+"px"),a(t)}}))}})),new MutationObserver((function(){i(),setTimeout(i,400)})).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),e.addEventListener&amp;&amp;e.addEventListener("change",i),i(),setTimeout(i,800),setTimeout(i,2500)}function n(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),(function(e){return 0===(e.getAttribute("src")||"").indexOf(t+"/")}))}function r(t){var n=t&amp;&amp;t.match(/[\d.]+/g);if(n&amp;&amp;n.length>=3)return(.299*n[0]+.587*n[1]+.114*n[2])/255>.5?"light":"dark";var r=document.documentElement.getAttribute("data-theme");return"dark"===r||"light"===r?r:e.matches?"dark":"light"}function a(e){try{var n=function(t){for(;t&amp;&amp;1===t.nodeType;t=t.parentElement){var e=getComputedStyle(t).backgroundColor;if(e&amp;&amp;"transparent"!==e&amp;&amp;!/rgba\([^)]*,\s*0\)$/.test(e))return e}return null}(e.parentElement);e.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:r(n),bg:n},t)}catch(t){}}function i(){n().forEach(a)}}();'></iframe>
<script>
!function(){if(!window.__radarQNv2){window.__radarQNv2=1;var t="https://lorenzobuonarosa.github.io",e=window.matchMedia("(prefers-color-scheme: dark)");window.addEventListener("message",(function(e){if(e.origin===t){var r=e.data;r&&"radar-qn"===r.sentinel&&"height"===r.type&&n().forEach((function(t){if(t.contentWindow===e.source){var n=Math.ceil(+r.height);n>0&&2e4>n&&(t.style.height=n+"px"),a(t)}}))}})),new MutationObserver((function(){i(),setTimeout(i,400)})).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),e.addEventListener&&e.addEventListener("change",i),i(),setTimeout(i,800),setTimeout(i,2500)}function n(){return Array.prototype.filter.call(document.getElementsByTagName("iframe"),(function(e){return 0===(e.getAttribute("src")||"").indexOf(t+"/")}))}function r(t){var n=t&&t.match(/[\d.]+/g);if(n&&n.length>=3)return(.299*n[0]+.587*n[1]+.114*n[2])/255>.5?"light":"dark";var r=document.documentElement.getAttribute("data-theme");return"dark"===r||"light"===r?r:e.matches?"dark":"light"}function a(e){try{var n=function(t){for(;t&&1===t.nodeType;t=t.parentElement){var e=getComputedStyle(t).backgroundColor;if(e&&"transparent"!==e&&!/rgba\([^)]*,\s*0\)$/.test(e))return e}return null}(e.parentElement);e.contentWindow.postMessage({sentinel:"radar-qn",type:"theme",theme:r(n),bg:n},t)}catch(t){}}function i(){n().forEach(a)}}();
</script>
```

## Pubblicazione

GitHub Pages dalla root del branch `main` (*Settings → Pages → Deploy from a branch → main / root*).
