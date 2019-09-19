const { io } = require("lastejobb");

const toplevel = io.lesDatafil("art-kode/type").items;
const fatop = io.lesDatafil("fremmed-art/type").items;

fatop.forEach(e => toplevel.push(e));
io.skrivBuildfil(__filename, toplevel);
