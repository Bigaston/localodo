const fs = require("fs");
const path = require("path");

if(!fs.existsSync(path.join(__dirname, "../files"))) {
    fs.mkdirSync(path.join(__dirname, "../files"))
}

console.log("Fichiers de bases créés")