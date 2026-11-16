/* Test del contatore: node contatore/test.js (dalla root della repo) */
"use strict";
var fs = require("fs"), path = require("path");
var C = require("./calc.js");

function num(s) { s = String(s || "").trim(); if (!s) return null; var v = +s.replace(/\./g, "").replace(",", "."); return isNaN(v) ? null : v; }
var lines = fs.readFileSync(path.join(__dirname, "../data/parametri-contatore.csv"), "utf8").split(/\r?\n/).filter(Boolean);
var head = lines[0].split(";");
var rows = lines.slice(1).map(function (l) { var c = l.split(";"), o = {}; head.forEach(function (h, i) { o[h] = c[i]; }); return o; });
var P = C.params(rows, num);

var e = function (v) { return v == null ? "–" : v.toLocaleString("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 }); };
var fails = 0;
function near(a, b, msg) { var ok = Math.abs(a - b) < 0.01; if (!ok) { fails++; console.log("  ✗ " + msg + ": atteso " + e(b) + ", ottenuto " + e(a)); } else console.log("  ✓ " + msg + " = " + e(a)); }

function show(t, inp) {
  var r = C.calcola(P, inp);
  console.log("\n== " + t + " ==");
  console.log("  fascia: " + r.fascia + ", coeff " + r.coeff + "%, costi reali " + e(r.costiReali));
  console.log("  FORFETTARIO" + (r.forf.disponibile ? "" : " (NON DISPONIBILE)") + ": reddito " + e(r.forf.reddito) + " | contributi " + e(r.forf.contributi) + " | imponibile " + e(r.forf.imponibile) + " | imposta " + e(r.forf.imposte) + " | prelievo " + e(r.forf.prelievo) + " | restano " + e(r.forf.restano) + " | eff. " + (r.forf.effettiva * 100).toFixed(1) + "%");
  console.log("  ORDINARIO: reddito " + e(r.ord.reddito) + " | contributi " + e(r.ord.contributi) + " | imponibile " + e(r.ord.imponibile) + " | IRPEF lorda " + e(r.ord.irpefLorda) + " | detrazione " + e(r.ord.detrazione) + " | IRPEF netta " + e(r.ord.irpef) + " | add. reg. " + e(r.ord.addReg) + " | add. com. " + e(r.ord.addCom) + " | prelievo " + e(r.ord.prelievo) + " | restano " + e(r.ord.restano) + " | eff. " + (r.ord.effettiva * 100).toFixed(1) + "%");
  console.log("  risparmio forfettario: " + e(r.risparmio) + "   IVA scorporata (22/122): " + e(r.ivaScorporo));
  return r;
}

// 1) professionista, 90.000, gestione separata, costi 15%
var r1 = show("Professionista, 90.000 euro, gestione separata, costi 15%", { incassi: 90000, attivita: "professionista", prev: "gs", costi: 15, startup: false, clienti: "imprese" });
// controllo a mano
near(r1.forf.reddito, 70200, "reddito forf. 90.000 × 78%");
near(r1.forf.contributi, 70200 * 0.2607, "contributi GS 26,07%");
near(r1.forf.imposte, (70200 - 18301.14) * 0.15, "imposta sostitutiva 15%");
var imp1 = 76500 - 76500 * 0.2607;
near(r1.ord.imponibile, imp1, "imponibile ordinario 76.500 − contributi");
near(r1.ord.irpefLorda, 28000 * 0.23 + 27000 * 0.33 + (imp1 - 55000) * 0.43, "IRPEF lorda a scaglioni");
near(r1.ord.detrazione, 0, "detrazione (imponibile oltre 50.000)");
if (r1.fascia !== "doppio") { fails++; console.log("  ✗ fascia attesa: doppio"); }

// 2) commerciante, 60.000, costi 40%
var r2 = show("Commerciante, 60.000 euro, costi 40%", { incassi: 60000, attivita: "commercio", prev: "artcom", costi: 40, startup: false, clienti: "privati" });
near(r2.forf.reddito, 24000, "reddito forf. 60.000 × 40%");
near(r2.forf.contributi, (4611.64 + (24000 - 18808) * 0.2448) * 0.65, "contributi commercianti con riduzione 35%");
near(r2.ord.contributi, 4611.64 + (36000 - 18808) * 0.2448, "contributi ordinari commercianti");
var imp2 = 36000 - r2.ord.contributi;
near(r2.ord.imponibile, imp2, "imponibile ordinario 36.000 − contributi");
near(r2.ord.detrazione, 500 + 765 * (28000 - imp2) / 22500, "detrazione tra 5.500 e 28.000");
near(r2.ord.irpefLorda, imp2 * 0.23, "IRPEF lorda (tutto nel primo scaglione)");

// 3) edile, 110.000 (costi 15% predefiniti)
var r3 = show("Edile, 110.000 euro, artigiani, costi 15%", { incassi: 110000, attivita: "costruzioni", prev: "artcom", costi: 15, startup: false, clienti: "imprese" });
near(r3.forf.reddito, 94600, "reddito forf. 110.000 × 86%");
near(r3.forf.contributi, (4521.36 + (56224 - 18808) * 0.24 + (94600 - 56224) * 0.25) * 0.65, "contributi artigiani due fasce, −35%");
if (r3.fascia !== "uscita") { fails++; console.log("  ✗ fascia attesa: uscita"); }

// 4) 120.000: forfettario non disponibile
var r4 = show("Professionista, 120.000 euro, colonna forfettario spenta", { incassi: 120000, attivita: "professionista", prev: "gs", costi: 15, startup: false, clienti: "imprese" });
if (r4.forf.disponibile || r4.risparmio !== null || r4.fascia !== "fuori") { fails++; console.log("  ✗ il forfettario dovrebbe essere spento"); } else console.log("  ✓ forfettario non disponibile, nessun risparmio calcolato");
near(r4.ord.contributi, 102000 * 0.2607, "contributi GS sotto il massimale");

// extra: contributi oltre il massimale
var r5 = C.calcola(P, { incassi: 150000, attivita: "professionista", prev: "gs", costi: 0, startup: false });
near(r5.ord.contributi, P.massimale * 0.2607, "contributi GS fermi al massimale");

console.log("\n" + (fails ? fails + " test falliti" : "Tutti i test superati"));
process.exit(fails ? 1 : 0);
