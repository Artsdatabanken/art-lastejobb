const { io } = require("lastejobb");

const toplevel = io.lesDatafil("art-kode/type");
const fatop = io.lesDatafil("fremmed-art/type").items;

fatop.forEach(e => toplevel.items.push(e));
io.skrivBuildfil(__filename, toplevel);
