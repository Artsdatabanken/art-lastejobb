const { io, json } = require("lastejobb");

const art = io.lesDatafil("art-takson/type").items;
const fremmede = json.arrayToObject(io.lesDatafil("40_fremmed").items, {
  uniqueKey: "kode"
});
const truetart = io.lesDatafil("10_truet");
const beskrivelser = json.arrayToObject(
  io.lesDatafil("art-beskrivelse/type").items,
  {
    uniqueKey: "kode"
  }
);

const hjemmeside = json.arrayToObject(
  io.lesDatafil("art-hjemmeside/type").items,
  {
    uniqueKey: "kode"
  }
);

const truetrot = io.lesDatafil("art-truet/type").items;
truetrot.forEach(truet => art.push(truet));
const fremmedrot = io.lesDatafil("art-fremmed/type").items;
fremmedrot.forEach(fremmed => art.push(fremmed));

art.forEach(e => {
  flett(e, hjemmeside[e.kode]);
  flett(e, beskrivelser[e.kode]);
  flett(e, fremmede[e.kode]);
  flett(e, truetart[e.kode]);
});

io.skrivBuildfil(__filename, art);

function flett(dest, src) {
  if (!src) return;
  Object.keys(src).forEach(key => (dest[key] = src[key]));
}
