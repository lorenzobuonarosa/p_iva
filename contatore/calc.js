/* Radar – QN · calcolo del contatore forfettario/ordinario.
   Nessun parametro numerico qui: tutto arriva da data/parametri-contatore.csv (oggetto P, valori in euro o in %).
   Usato sia dalla pagina sia dal test (node contatore/test.js). */
(function (root) {
  "use strict";

  // attività: chiave del coefficiente, previdenza predefinita, gestione INPS se artigiani e commercianti
  var ATTIVITA = [
    { id: "professionista", label: "Professionista (avvocato, consulente, architetto, sanità, istruzione, finanza)", coeff: "coeff_professionista", prev: "gs", artcom: "artigiani" },
    { id: "commercio", label: "Commercio, alimentari, ristorazione e alloggio", coeff: "coeff_commercio", prev: "artcom", artcom: "commercianti" },
    { id: "ambulante", label: "Commercio ambulante non alimentare", coeff: "coeff_ambulante", prev: "artcom", artcom: "commercianti" },
    { id: "intermediario", label: "Intermediario del commercio", coeff: "coeff_intermediario", prev: "artcom", artcom: "commercianti" },
    { id: "costruzioni", label: "Costruzioni e attività immobiliari", coeff: "coeff_costruzioni", prev: "artcom", artcom: "artigiani" },
    { id: "altre", label: "Altre attività", coeff: "coeff_altre", prev: "artcom", artcom: "artigiani" }
  ];

  function pc(v) { return v / 100; }

  /** contributi INPS su un reddito; forf = true applica la riduzione dei forfettari (solo artigiani e commercianti) */
  function contributi(P, reddito, prev, artcom, forf) {
    var R = Math.max(0, Math.min(reddito, P.massimale));
    if (prev === "gs") return { tot: R * pc(P.aliquota_gs), dett: "Gestione separata " + P.aliquota_gs + "% sul reddito" };
    var art = artcom === "artigiani";
    var fisso = art ? P.fisso_artigiani : P.fisso_commercianti;
    var a1 = pc(art ? P.aliquota_artigiani : P.aliquota_commercianti);
    var a2 = pc(art ? P.aliquota_artigiani_2 : P.aliquota_commercianti_2);
    var c = fisso
      + Math.max(0, Math.min(R, P.fascia2_artcom) - P.minimale_artcom) * a1
      + Math.max(0, R - P.fascia2_artcom) * a2;
    if (forf) c *= 1 - pc(P.riduzione_forfettari_artcom);
    return { tot: c };
  }

  function irpefLorda(P, imp) {
    var s1 = P.irpef_s1, s2 = P.irpef_s2;
    return Math.min(imp, s1) * pc(P.irpef_a1)
      + Math.max(0, Math.min(imp, s2) - s1) * pc(P.irpef_a2)
      + Math.max(0, imp - s2) * pc(P.irpef_a3);
  }

  /** detrazione per redditi di lavoro autonomo, art. 13 c. 5 TUIR */
  function detrazione(P, R) {
    if (R <= P.detr_l1) return P.detr_max;
    if (R <= P.detr_l2) return P.detr_base + P.detr_var * (P.detr_l2 - R) / (P.detr_l2 - P.detr_l1);
    if (R <= P.detr_l3) return P.detr_base * (P.detr_l3 - R) / (P.detr_l3 - P.detr_l2);
    return 0;
  }

  /**
   * input: { incassi, attivita (id), prev ("gs"|"artcom"), costi (%), startup (bool), clienti ("imprese"|"privati") }
   */
  function calcola(P, inp) {
    var att = ATTIVITA.filter(function (a) { return a.id === inp.attivita; })[0] || ATTIVITA[0];
    var I = inp.incassi, costiReali = I * pc(inp.costi);
    var coeff = P[att.coeff];

    // ---- Forfettario (regole 2027) ----
    var fRed = I * pc(coeff);
    var fCon = contributi(P, fRed, inp.prev, att.artcom, true).tot;
    var fImp = Math.max(0, fRed - fCon);
    var fAliq = inp.startup ? P.aliquota_startup : P.aliquota_forfettario;
    var fTax = fImp * pc(fAliq);
    var forf = {
      disponibile: I <= P.uscita_immediata_irpef,
      reddito: fRed, contributi: fCon, imponibile: fImp, aliquota: fAliq,
      imposte: fTax, sostitutiva: fTax,
      prelievo: fTax + fCon,
      restano: I - costiReali - fCon - fTax
    };
    // aliquota effettiva sul reddito reale (incassi − costi reali), uguale base per i due regimi
    var reale = I - costiReali;
    forf.effettiva = reale > 0 ? forf.prelievo / reale : 0;

    // ---- Ordinario (regole 2027) ----
    var oRed = I - costiReali;
    var oCon = contributi(P, oRed, inp.prev, att.artcom, false).tot;
    var oImp = Math.max(0, oRed - oCon);
    var lorda = irpefLorda(P, oImp);
    var detr = detrazione(P, oImp);
    var netta = Math.max(0, lorda - detr);
    var reg = oImp * pc(P.add_regionale), com = oImp * pc(P.add_comunale);
    var ord = {
      disponibile: true,
      reddito: oRed, contributi: oCon, imponibile: oImp,
      irpefLorda: lorda, detrazione: detr, irpef: netta, addReg: reg, addCom: com,
      imposte: netta + reg + com,
      prelievo: netta + reg + com + oCon,
      restano: I - costiReali - oCon - netta - reg - com
    };
    ord.effettiva = reale > 0 ? ord.prelievo / reale : 0;

    // ---- Regole di accesso ----
    var fascia;
    if (I <= P.soglia_iva) fascia = "pieno";
    else if (I <= P.soglia_irpef) fascia = "doppio";
    else if (I <= P.uscita_immediata_irpef) fascia = "uscita";
    else fascia = "fuori";

    var risparmio = forf.disponibile ? forf.restano - ord.restano : null;
    var ivaScorporo = I * P.iva / (100 + P.iva);

    return { att: att, coeff: coeff, costiReali: costiReali, forf: forf, ord: ord, fascia: fascia, risparmio: risparmio, ivaScorporo: ivaScorporo };
  }

  /** Converte le righe del CSV parametri in oggetto {parametro: numero} */
  function params(rows, num) {
    var P = {};
    rows.forEach(function (r) { P[r.parametro] = num(r.valore); });
    return P;
  }

  var api = { ATTIVITA: ATTIVITA, calcola: calcola, contributi: contributi, irpefLorda: irpefLorda, detrazione: detrazione, params: params };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Contatore = api;
})(this);
