const { io, json } = require("lastejobb");

const art = io.lesDatafil("art-takson/type").items;
const fremmede = json.arrayToObject(io.lesDatafil("40_fremmed").items, {
  uniqueKey: "kode"
});
const truetart = io.lesDatafil("10_truet");
const hjemmeside = json.arrayToObject(io.lesDatafil("30_databank").items, {
  uniqueKey: "kode"
});

art.forEach(e => {
  const kode = e.kode;
  flett(e, hjemmeside[kode]);
  flett(e, fremmede[kode]);
  flett(e, truetart[kode]);
});

const r = art.filter(e => e.finnesINorge);
const truetrot = io.lesDatafil("art-truet/type").items;
truetrot.forEach(truet => r.push(truet));
const fremmedrot = io.lesDatafil("art-fremmed/type").items;
fremmedrot.forEach(fremmed => r.push(fremmed));

io.skrivBuildfil(__filename, r);

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
