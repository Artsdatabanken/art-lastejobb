const { io, json } = require("lastejobb");

const art = io.lesDatafil("art-kode/type").items;
const ingress = json.arrayToObject(io.lesDatafil("art-ingress/ingress").items, {
  uniqueKey: "kode"
});

art.forEach(e => {
  const ing = ingress[e.kode];
  if (!ing) return;
  Object.keys(ing).forEach(key => {
    e[key] = ing[key];
  });
});

io.skrivBuildfil(__filename, art);
