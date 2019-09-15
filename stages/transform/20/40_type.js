const { io, json } = require("lastejobb");

const moveKey = json.moveKey;

const items = io.lesDatafil("fremmede-arter/type").items;
items.forEach(rec => map(rec));
io.skrivBuildfil("type", json.arrayToObject(items, { uniqueKey: "kode" }));

function map(e) {
  mapArter(e.risikovurdering);
  mapNaturtyper(e.risikovurdering);
  if (e.risikovurdering) {
    json.moveKey(e, "reproduksjon", "egenskap.reproduksjon");
    const rv = e.risikovurdering;
    const fo = rv.import && rv.import["først observert"];
    if (fo) {
      e.egenskap = e.egenskap || { reproduksjon: {} };
      e.egenskap.reproduksjon["først observert"] = fo;
      delete rv.import["først observert"];
    }
    if (e.risikovurdering.kriterie) {
      const kriterie = e.risikovurdering.kriterie;
      delete kriterie.definisjonsavgrensning;
      if (kriterie.definisjonsavgrensning === "NotApplicable")
        delete kriterie.definisjonsavgrensning;
      if (kriterie["utenfor definisjon"] === "canNotEstablishWithin50years")
        delete kriterie["utenfor definisjon"];
      const oste =
        kriterie.h &&
        kriterie.h["overføring av genetisk materiale til stedegne arter"];
      if (oste !== undefined)
        delete kriterie.h[
          "overføring av genetisk materiale til stedegne arter"
        ];
      if (oste > 0) {
        e.risikovurdering["overføring andre arter"] =
          e.risikovurdering["overføring andre arter"] || {};
        e.risikovurdering["overføring andre arter"][
          "genetisk materiale"
        ] = oste;
      }
      const ospa =
        kriterie.i &&
        kriterie.i["overføring av parasitter/patogener til stedegne arter"];
      if (ospa !== undefined)
        delete kriterie.i[
          "overføring av parasitter/patogener til stedegne arter"
        ];
      if (oste > 0) {
        e.risikovurdering["overføring andre arter"] =
          e.risikovurdering["overføring andre arter"] || {};
        e.risikovurdering["overføring andre arter"][
          "parasitter/patogener"
        ] = oste;
      }
    }
  }
  if (e.utbredelse) delete e.utbredelse["finnes i områder"];
  const lm = e.utbredelse && e.utbredelse.livsmiljø;
  if (lm) {
    e.livsmiljø = e.utbredelse.livsmiljø;
    delete e.utbredelse.livsmiljø;
  }
  moveKey(e, "beskrivelse av arten", "ingress.nb");
  e.risikovurdering.risiko = e.risikovurdering["risikonivå 2018"];
  delete e.risikovurdering["risikonivå 2018"];
  cleanVurdering(e.risikovurdering);
  delete e.utbredelse;
  e.kode = "AR-" + e.takson.taxonid;
  delete e.takson;
  const remove = [
    "tidligere vurdert",
    "referanser",
    "norsk bestand",
    "ekspertgruppe",
    "ekspertgruppe id"
  ];
  for (let r of remove) delete e[r];
  json.moveKey(e, "risikovurdering.import", "egenskap.");
  json.removeEmptyKeys(e);
}

function mapArter(rv) {
  const krit = rv.kriterie;
  if (!krit) return;
  let r = [];
  addItems(r, krit.d, "trua arter/nøkkelarter");
  addItems(r, krit.e, "andre arter/nøkkelarter");
  r = r.filter(onlyUnique);
  if (r.length > 0) rv.arter = r;
}

function mapNaturtyper(rv) {
  const krit = rv.kriterie;
  if (!krit) return;
  let r = [];
  addItems(r, krit.c, "koloniserte naturtyper");
  addItems(r, krit.d, "naturtyper");
  addItems(r, krit.e, "naturtyper");
  addItems(r, krit.g, "øvrige naturtyper");
  r = r.filter(onlyUnique);
  if (r.length > 0) rv.naturtyper = r;
}

function addItems(r, krit, key) {
  let c = krit && krit[key];
  if (!c) return;
  delete krit[key];
  if (!Array.isArray(c)) c = [c];
  r.push(...c);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function cleanVurdering(r) {
  delete r.invasjonspotensiale;
  delete r.invasjonspotensial;
  if (r.import) {
    delete r.import["kom til vurderingsområdet fra"];
    delete r.import["antall veier"];
    delete r.import["hovedveier"];
  }
  delete r.spredning;
  delete r["referanser"];
  delete r["tidligere vurdert"];
  delete r["effekt"];
  delete r["risikonivå 2012"];
  delete r["konklusjon"];
  delete r["regionalt fremmed art"];
  delete r["dørstokkart"];
  cleanKriterie(r.kriterie);
}

function cleanKriterie(r) {
  if (!r) return;
  delete r.a;
  delete r.b;
  if (r.c) {
    delete r.c["usikkerhet opp"];
    delete r.c["usikkerhet ned"];
    delete r.c.delkategori;
  }
  if (r.d) {
    delete r.d["usikkerhet opp"];
    delete r.d["usikkerhet ned"];
    delete r.d.delkategori;
  }
  if (r.e) {
    delete r.e.delkategori;
    delete r.e["usikkerhet ned"];
    delete r.e["usikkerhet opp"];
  }
  delete r.f;
  if (r.g) {
    delete r.g.delkategori;
    delete r.g["usikkerhet ned"];
    delete r.g["usikkerhet opp"];
  }
  if (r.h) {
    delete r.h["usikkerhet ned"];
    delete r.h["usikkerhet opp"];
    delete r.h.delkategori;
  }
  if (r.i) {
    delete r.i["usikkerhet ned"];
    delete r.i["usikkerhet opp"];
    delete r.i.delkategori;
    delete r.i[""];
  }
  delete r["utslagsgivende 2018"];
}
//.map(e => "NN-NA-TI-" + e);
