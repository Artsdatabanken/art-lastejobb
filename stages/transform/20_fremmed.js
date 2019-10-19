const { io, log, json } = require("lastejobb");

const la2kode = latinTilKode();
const områder = {};

function latinTilKode() {
  const arter = io.lesDatafil("art-takson/type").items;
  const kode2navn = {};
  arter.forEach(art => {
    kode2navn[art.kode] = art.tittel.sn;
  });
  const r = {};

  arter.forEach(art => {
    if (!art.foreldre) return;
    r[art.tittel.sn.toLowerCase()] = art.kode;
  });
  return r;
}

const livsmiljø = {
  terrestrial: "ES-TE",
  limnic: "ES-AK-LI",
  marine: "ES-AK-MA"
};

const relasjon_oppsett = [
  {
    kriterie: "c",
    key: "koloniserte naturtyper",
    tekst: "Koloniserer<->Er kolonisert av"
  },
  {
    kriterie: "d",
    key: "naturtyper",
    tekst: "Har effekt på andre arter i"
  },
  {
    kriterie: "e",
    key: "naturtyper",
    tekst: "Har effekt på andre arter i"
  },
  {
    kriterie: "g",
    key: "øvrige naturtyper",
    tekst: "har effekt på"
  },
  {
    kriterie: "d",
    key: "trua arter/nøkkelarter",
    mapper: sciName => la2kode[sciName.toLowerCase()],
    tekst: "Truer<->Trues av"
  },
  {
    kriterie: "e",
    key: "andre arter/nøkkelarter",
    mapper: sciName => la2kode[sciName.toLowerCase()],
    tekst: "Truer<->Trues av"
  }
];

const items = io.lesDatafil("art-fremmed/art").items;
items.forEach(rec => map(rec));
io.skrivDatafil(__filename, items);
io.skrivDatafil("område", områder);

function map(e) {
  mapRisikovurdering(e);
  if (e.utbredelse && e.utbredelse["finnes i områder"]) {
    e.utbredelse["finnes i områder"].forEach(o => {
      områder[o] = { kode: "AO-TO-FL-xx", tittel: "" };
    });
  }
  const lm = e.utbredelse && e.utbredelse.livsmiljø;
  if (lm) {
    lm.forEach(lm1 => {
      const kode = livsmiljø[lm1];
      if (!kode) throw new Error("Mangler livsmiljø " + lm);
      addItems(e, { kode }, "kode", "", "Livsmiljø");
    });
    delete e.utbredelse.livsmiljø;
  }
  json.moveKey(e, "beskrivelse av arten", "beskrivelse.nob");
  if (e.takson) e.kode = "AR-" + e.takson.scientificnameid;
  delete e.takson;
  json.moveKey(
    e,
    "reproduksjon.norsk bestand",
    "utbredelse.tidslinje.etablert_bestand"
  );
  const remove = ["ekspertgruppe", "ekspertgruppe id"];
  for (let r of remove) delete e[r];
  json.removeEmptyKeys(e);
}

function mapRisikovurdering(e) {
  if (!e.risikovurdering) return;
  mapRelasjoner(e, e.risikovurdering);
  json.moveKey(
    e,
    "risikovurdering.import.først observert",
    "utbredelse.tidslinje.først_observert"
  );
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
    addItems(e, krit[cfg.kriterie], cfg.key, cfg.prefix, cfg.tekst, cfg.mapper);
  });
}

function addItems(rec, kriterier, key, prefix = "", destkey, mapper) {
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
  koder.forEach(skode => {
    let kode = skode;
    if (mapper) {
      kode = mapper(skode);
      if (!kode) log.warn("Finner ikke mapping for " + skode);
    }
    dest.push(prefix + kode);
  });
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
  //  return;
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
