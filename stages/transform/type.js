const { io, log, json } = require("lastejobb");

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

const hjemmeside = json.arrayToObject(io.lesDatafil("30_hjemmeside").items, {
  uniqueKey: "kode"
});

const truetrot = io.lesDatafil("art-truet/type").items;
truetrot.forEach(truet => art.push(truet));
const fremmedrot = io.lesDatafil("art-fremmed/type").items;
fremmedrot.forEach(fremmed => art.push(fremmed));

let maxcount = 0;
let showcase = "";
art.forEach(e => {
  flett(e, hjemmeside[e.kode]);
  flett(e, beskrivelser[e.kode]);
  flett(e, fremmede[e.kode]);
  flett(e, truetart[e.kode]);
  const count = Object.keys(e).length;
  if (count > maxcount) {
    showcase = e.kode;
    maxcount = count;
  }
});
log.warn(showcase);
io.skrivBuildfil(__filename, art);

function flett(dest, src) {
  if (!src) return;
  Object.keys(src).forEach(key => {
    const srcNode = src[key];
    const datatype = typeof srcNode;
    if (Array.isArray(srcNode)) {
      dest[key] = dest[key] || [];
      dest[key] = dest[key].concat(srcNode);
      return;
    }
    switch (datatype) {
      case "object":
        dest[key] = dest[key] || {};
        flett(dest[key], srcNode);
        return;
      case "boolean":
      case "number":
      case "string":
        dest[key] = srcNode;
        return;
      default:
        debugger;
    }
  });
}
