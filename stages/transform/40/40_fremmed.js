const { io, log } = require("lastejobb");

const fab = io.lesDatafil("20_fremmed").items;
const la2kode = latinTilKode();

fab.forEach(rec => map(rec));
io.skrivDatafil(__filename, fab);

function map(rec) {
  rec.lenke = {
    fab:
      "https://artsdatabanken.no/fremmedarter/2018" +
      rec.autorkode.replace("FA3", "")
  };
  delete rec.id;
  const rv = rec.risikovurdering;
  if (!rv) return;
  if (rv.risiko) rv.risiko = "FA-" + rv.risiko;
  mapArter(rv);
}

function mapArter(rv) {
  const artsnavn = rv && rv.arter;
  if (!artsnavn) return;
  rv.arter = artsnavn.map(art => {
    art = art.toLowerCase();

    /*
  Ukjent art: poa pratensis pratensis 
  Ukjent art: urtica dioica dioica 
  Ukjent art: pinus sylvestris sylvestris 
     */
    if (!la2kode[art]) art = art.replace(/\s(\w*?)$/, " subsp. $1");

    if (!la2kode[art]) log.warn("Ukjent art: " + art);
    return la2kode[art];
  });
}

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
