const { io, log } = require("lastejobb");

const relasjon_oppsett = [
  {
    kriterie: "truetvurdering",
    key: "Kategori2015",
    prefix: "RL-",
    tekst: "Rødlistekategori<->Art"
  }
];

const items = io.lesDatafil("art-truet/art").items;
const r = {};
items.forEach(e => (r[e.kode] = map(e)));
io.skrivDatafil(__filename, r);

function map(e) {
  //  json.moveKey(e, "beskrivelse av arten", "beskrivelse.nob");
  const remove = [
    "2010 kategori",
    "2010 kriterier",
    "A",
    "B",
    "C",
    "D",
    "Oa",
    "Region",
    "Vitenskapelig navn"
  ];
  for (let r of remove) delete e[r];
  e = { truetvurdering: e };
  delete e.truetvurdering.kode;
  relasjon_oppsett.forEach(cfg => {
    addItems(e, e[cfg.kriterie], cfg.key, cfg.prefix, cfg.tekst, cfg.mapper);
  });
  return e;
}

function addItems(rec, kriterier, key, prefix = "", destkey, mapper) {
  destkey = destkey || key;
  let koder = kriterier && kriterier[key];
  if (!koder) return;
  delete kriterier[key];
  if (!Array.isArray(koder)) koder = [koder];

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
