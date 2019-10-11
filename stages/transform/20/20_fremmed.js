const { io, json } = require("lastejobb");

const NATURTYPE_PREFIX = "NN-NA-";
const relasjon_oppsett = [
  {
    kriterie: "c",
    key: "koloniserte naturtyper",
    prefix: NATURTYPE_PREFIX,
    tekst: "Koloniserer<->Er kolonisert av"
  },
  {
    kriterie: "d",
    key: "naturtyper",
    prefix: NATURTYPE_PREFIX,
    tekst: "Har effekt på andre arter i"
  },
  {
    kriterie: "e",
    key: "naturtyper",
    prefix: NATURTYPE_PREFIX,
    tekst: "Har effekt på andre arter i"
  },
  {
    kriterie: "g",
    key: "øvrige naturtyper",
    prefix: NATURTYPE_PREFIX,
    tekst: "har effekt på"
  },
  {
    kriterie: "d",
    key: "trua arter/nøkkelarter",
    tekst: "Truer<->Trues av"
  },
  {
    kriterie: "e",
    key: "andre arter/nøkkelarter",
    tekst: "Truer<->Trues av"
  }
];

const items = io.lesDatafil("art-fremmed/art").items;
items.forEach(rec => map(rec));
io.skrivDatafil(__filename, items);

function map(e) {
  mapRisikovurdering(e);
  if (e.utbredelse) delete e.utbredelse["finnes i områder"];
  const lm = e.utbredelse && e.utbredelse.livsmiljø;
  if (lm) {
    e.livsmiljø = e.utbredelse.livsmiljø;
    delete e.utbredelse.livsmiljø;
  }
  json.moveKey(e, "beskrivelse av arten", "beskrivelse.nob");
  delete e.utbredelse;
  if (e.takson) e.kode = "AR-" + e.takson.scientificnameid;
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

function mapRisikovurdering(e) {
  if (!e.risikovurdering) return;
  mapRelasjoner(e, e.risikovurdering);
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
      delete kriterie.h["overføring av genetisk materiale til stedegne arter"];
    if (oste > 0) {
      e.risikovurdering["overføring andre arter"] =
        e.risikovurdering["overføring andre arter"] || {};
      e.risikovurdering["overføring andre arter"]["genetisk materiale"] = oste;
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
  if (e.risikovurdering.risikonivå)
    addItems(e, e.risikovurdering.risikonivå, "nå", "FA-", "risiko");
  delete e.risikovurdering["risikonivå 2018"];
  cleanVurdering(e.risikovurdering);
}

function mapRelasjoner(e, rv) {
  const krit = rv.kriterie;
  if (!krit) return;
  relasjon_oppsett.forEach(cfg => {
    addItems(e, krit[cfg.kriterie], cfg.key, cfg.prefix, cfg.tekst);
  });
}

function addItems(rec, kriterier, key, prefix = "", destkey) {
  destkey = destkey || key;
  let koder = kriterier && kriterier[key];
  if (!koder) return;
  delete kriterier[key];
  if (!Array.isArray(koder)) koder = [koder];

  koder = koder.filter(onlyUnique);
  if (koder.length <= 0) return;

  rec.relasjon = rec.relasjon || {};
  const relasjon = rec.relasjon;
  relasjon[destkey] = relasjon[destkey] || [];
  const dest = relasjon[destkey];
  koder.forEach(kode => dest.push(prefix + kode));
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
  delete r.c;
  delete r.d;
  delete r.e;
  delete r.f;
  delete r.g;
  delete r.h;
  delete r.i;
  delete r["utslagsgivende 2018"];
}
