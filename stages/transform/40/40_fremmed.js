const { io, log } = require("lastejobb");

const fab = io.lesDatafil("20_fremmed").items;
const la2kode = latinTilKode();

fab.forEach(rec => map(rec));
io.skrivDatafil(__filename, fab);

function map(rec) {
  rec.lenke = {
    fab:
      "https://artsdatabanken.no/fremmedarter/2018" + rec.id.replace("FA3", "")
  };
  delete rec.id;
  const rv = rec.risikovurdering;
  if (!rv) return;
  rv.risiko = "FA-" + rv.risiko;
  mapArter(rv);
  mapNaturtyper(rv);
}

function mapNaturtyper(rv) {
  const koder = rv && rv.naturtyper;
  if (!koder) return;
  rv.naturtyper = koder.map(kode => {
    return "NN-NA-TI-" + kode;
  });
}

function mapArter(rv) {
  const artsnavn = rv && rv.arter;
  if (!artsnavn) return;
  rv.arter = artsnavn.map(art => {
    art = art.toLowerCase();
    if (!la2kode[art]) log.warn("Ukjent art: " + art);
    return la2kode[art];
  });
}

function latinTilKode() {
  const arter = io.lesDatafil("art-kode/type").items;
  const kode2navn = {};
  arter.forEach(art => {
    kode2navn[art.kode] = art.tittel.la;
  });
  const r = {};

  arter.forEach(art => {
    const fkode = art.foreldre[0];
    const fnavn = kode2navn[fkode];
    const f = fnavn ? fnavn + " " : "";
    const tit = f + art.tittel.la;
    r[tit.toLowerCase()] = art.kode;
  });
  return r;
}
