#! /usr/bin/env node

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
const child = require('child_process');
const getPort = require('get-port');

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
		},
		{
			type: "confirm",
			name: "open_folder",
			message: "Ouvrir les dossiers de partage?",
			default: false
		},
		{
			type: "confirm",
			name: "open_web",
			message: "Ouvrir la fenêtre dans le navigateur?",
			default: false
		}
  	])
  	.then(answers => {
		let index = ip_name.indexOf(answers.ip);
		IP = ip_tab[index]; 

		if (answers.open_folder) {
			child.exec('start "" "' + path.join(__dirname, "files") + '"');
		}

		getPort().then(port => {
			startServ(answers.open_web, port);
		})
  	})
  	.catch(error => {
		console.log(error)
  	});

function startServ(open_web, port) {
	const app = express()
	var upload = multer()

	app.get("/static/:file", (req, res) => {
		if (fs.existsSync(path.join(__dirname, "web/static/" + req.params.file))) {
			res.sendFile(path.join(__dirname, "web/static/" + req.params.file))
		} else {
			res.status(404).send("Not found")
		}
	})

	app.get("/files/:file", (req, res) => {
		if (fs.existsSync(path.join(__dirname, "files/" + req.params.file))) {
			res.sendFile(path.join(__dirname, "files/" + req.params.file))
		} else {
			res.status(404).send("Not found")
		}
	})

	app.get("/", (req, res) => {
		QRCode.toDataURL(`http://${IP}:${port}/download`, function (err, url_download) {
			QRCode.toDataURL(`http://${IP}:${port}/upload`, function (err, url_share) {
				let render_obj = {
					qrcode_download: url_download,
					download_addr: `http://${IP}:${port}/download`,
					qrcode_share: url_share,
					share_addr: `http://${IP}:${port}/upload`
				}
	
				let template = fs.readFileSync(path.join(__dirname, "./web/index.mustache"), "utf8");
	
				res.send(mustache.render(template, render_obj));
			})
		})
	})
	
	app.get("/download", (req, res) => {
		let files = fs.readdirSync(path.join(__dirname, "files"));
		let render_obj = {files: []};
		files.forEach((f) => {
			render_obj.files.push({link: "/files/" + encodeURI(f), name: f});
		})

		let template = fs.readFileSync(path.join(__dirname, "./web/download.mustache"), "utf8");

		res.send(mustache.render(template, render_obj));
	})

	app.get("/upload", (req, res) => {
		res.sendFile(path.join(__dirname, "web/upload.html"));
	})

	app.post('/uploadfile', upload.array('file'), function (req, res, next) {
		req.files.forEach(f => {
			fs.writeFileSync(path.join(__dirname, "files/" + f.originalname), f.buffer);
		})

		res.sendFile(path.join(__dirname, "web/done.html"));
	})
	
	app.listen(port, IP, () => {
		console.log(`Server lancé sur le port ${port}`)

		if (open_web) {
			open(`http://${IP}:${port}`);
		}
	})
}