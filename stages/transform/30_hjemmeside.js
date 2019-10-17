const { io, log, json } = require("lastejobb");

const la2kode = latinTilKode();
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

const relasjon_oppsett = [
  {
    kriterie: "systematikk",
    key: "forveksling.art",
    tekst: "Kan forveksles med<->Kan forveksles med"
  },
  {
    kriterie: "vert",
    key: "art",
    tekst: "Lever på<->Er vert for"
  },
  {
    kriterie: "diett",
    key: "art",
    tekst: "Spiser<->Bliir spist av"
  }
];

const items = io.lesDatafil("art-hjemmeside/type").items;
items.forEach(rec => map(rec));
io.skrivDatafil(__filename, items);

function map(e) {
  relasjon_oppsett.forEach(cfg => {
    addItems(e, e[cfg.kriterie], cfg.key, cfg.prefix, cfg.tekst, cfg.mapper);
  });
}

function addItems(art, src, key, prefix = "", destkey, mapper) {
  destkey = destkey || key;
  let koder = src && src[key];
  if (!koder) return;
  delete src[key];
  if (!Array.isArray(koder)) koder = [koder];

  koder = koder.filter(onlyUnique);
  if (koder.length <= 0) return;

  art.relasjon = art.relasjon || {};
  const relasjon = art.relasjon;
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
  delete src[key];
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
