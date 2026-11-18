/* Radar – QN · script per la pagina ospite (CMS): altezza degli iframe e tema.
   Questo file è la versione leggibile dello snippet usato nel CMS (embed.min.js).
   Va bene sia come <script> sia dentro l'attributo onload dell'iframe: la sezione Radar di QN
   inserisce l'articolo con JavaScript e lì i <script> non partono, mentre onload sì.
   Niente apici singoli e niente "<" nel codice: deve stare in un attributo e il CMS riscrive "<". */
(function () {
  if (window.__radarQNv2) return;
  window.__radarQNv2 = 1;
  var O = "https://lorenzobuonarosa.github.io";
  var MQ = window.matchMedia("(prefers-color-scheme: dark)");

  function frames() {
    return Array.prototype.filter.call(document.getElementsByTagName("iframe"), function (f) {
      return (f.getAttribute("src") || "").indexOf(O + "/") === 0;
    });
  }
  // primo sfondo non trasparente risalendo dall'iframe
  function bgOf(el) {
    for (; el && el.nodeType === 1; el = el.parentElement) {
      var c = getComputedStyle(el).backgroundColor;
      if (c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c)) return c;
    }
    return null;
  }
  // tema: prima il colore reale dello sfondo dietro l'iframe (la sezione Radar inverte il tema del sito),
  // poi data-theme su html, poi il tema di sistema
  function theme(bg) {
    var m = bg && bg.match(/[\d.]+/g);
    if (m && m.length >= 3) return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 > 0.5 ? "light" : "dark";
    var t = document.documentElement.getAttribute("data-theme");
    return t === "dark" || t === "light" ? t : (MQ.matches ? "dark" : "light");
  }
  function send(f) {
    try { var bg = bgOf(f.parentElement); f.contentWindow.postMessage({ sentinel: "radar-qn", type: "theme", theme: theme(bg), bg: bg }, O); } catch (e) {}
  }
  function sendAll() { frames().forEach(send); }

  window.addEventListener("message", function (e) {
    if (e.origin !== O) return;
    var d = e.data;
    if (!d || d.sentinel !== "radar-qn" || d.type !== "height") return;
    frames().forEach(function (f) {
      if (f.contentWindow !== e.source) return;
      var h = Math.ceil(+d.height);
      if (h > 0 && 20000 > h) f.style.height = h + "px";   // limite di sicurezza
      send(f);
    });
  });
  // cambio di tema sul sito (data-theme o classi su html/body) o nel sistema
  var obs = new MutationObserver(function () { sendAll(); setTimeout(sendAll, 400); });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  if (MQ.addEventListener) MQ.addEventListener("change", sendAll);
  // handshake: gli iframe già caricati rispondono con la loro altezza
  sendAll(); setTimeout(sendAll, 800); setTimeout(sendAll, 2500);
})();
