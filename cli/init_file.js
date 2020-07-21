const fs = require("fs");
const path = require("path");

if (!fs.existsSync(path.join(__dirname, "../.env"))) {
    fs.writeFileSync(path.join(__dirname, "../.env"), `
PORT=7563
`)
}

if(!fs.existsSync(path.join(__dirname, "../export"))) {
    fs.mkdirSync(path.join(__dirname, "../export"))
}

if(!fs.existsSync(path.join(__dirname, "../import"))) {
    fs.mkdirSync(path.join(__dirname, "../import"))
}

console.log("Fichiers de bases créés")