const { io, log } = require("lastejobb");

const relasjon_oppsett = [
  {
    kriterie: "gjeldende",
    key: "kategori",
    prefix: "RL-",
    tekst: "Rødlistekategori<->Art"
  }
];

const items = io.lesDatafil("art-truet/art").items;
const r = {};
items.forEach(e => (r[e.kode] = map(e)));
io.skrivDatafil(__filename, r);

function map(e) {
  delete e.kode;
  const f = {};
  relasjon_oppsett.forEach(cfg => {
    Object.keys(e).forEach(sted =>
      addItems(
        f,
        e[sted][cfg.kriterie],
        cfg.key,
        cfg.prefix,
        cfg.tekst,
        cfg.mapper
      )
    );
  });
  f.truetvurdering = e;
  return f;
}

function addItems(rec, kriterier, key, prefix = "", destkey, mapper) {
  destkey = destkey || key;
  let koder = kriterier && kriterier[key];
  if (!koder) return;
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
