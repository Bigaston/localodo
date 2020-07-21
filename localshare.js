require("dotenv").config()
const express = require('express')
const QRCode = require('qrcode')
const open = require('open');
const inquirer = require('inquirer');
const os = require('os');
const ifaces = os.networkInterfaces();
const mustache = require("mustache")
const fs = require("fs");
const path = require("path");
const multer  = require('multer')
var upload = multer()

let ip_tab = [];
let ip_name = [];
let IP;

// Récupération des addresses IP
Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
			return;
        }

		ip_tab.push(iface.address);
		ip_name.push(ifname + " : " + iface.address);
    });
});

inquirer
	.prompt([
		{
			type: "list",
			name: "ip",
			message: "Choisissez la bonne adresse IP :",
			choices: ip_name
		}
  	])
  	.then(answers => {
		let index = ip_name.indexOf(answers.ip);
		IP = ip_tab[index]; 

		startServ();
  	})
  	.catch(error => {
		console.log(error)
  	});

function startServ() {
	const app = express()

	app.use("/static", express.static("web/static"))
	app.use("/export", express.static("export"))

	app.get("/", (req, res) => {
		QRCode.toDataURL(`http://${IP}:${process.env.PORT}/download`, function (err, url_download) {
			QRCode.toDataURL(`http://${IP}:${process.env.PORT}/download`, function (err, url_share) {
				let render_obj = {
					qrcode_download: url_download,
					download_addr: `http://${IP}:${process.env.PORT}/download`,
					qrcode_share: url_share,
					share_addr: `http://${IP}:${process.env.PORT}/upload`
				}
	
				let template = fs.readFileSync(path.join(__dirname, "./web/index.mustache"), "utf8");
	
				res.send(mustache.render(template, render_obj));
			})
		})
	})
	
	app.get("/download", (req, res) => {
		let files = fs.readdirSync(path.join(__dirname, "export"));
		let render_obj = {files: []};
		files.forEach((f) => {
			render_obj.files.push({link: "/export/" + encodeURI(f), name: f});
		})

		let template = fs.readFileSync(path.join(__dirname, "./web/download.mustache"), "utf8");

		res.send(mustache.render(template, render_obj));
	})

	app.get("/upload", (req, res) => {
		res.sendFile(path.join(__dirname, "web/upload.html"));
	})

	app.post('/uploadfile', upload.array('file'), function (req, res, next) {
		req.files.forEach(f => {
			fs.writeFileSync(path.join(__dirname, "import/" + f.originalname), f.buffer);
		})

		res.redirect("/")
	})
	
	app.listen(process.env.PORT, IP, () => {
		console.log(`Server lancé sur le port ${process.env.PORT}`)
		open(`http://${IP}:${process.env.PORT}`)
	})
}