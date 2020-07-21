require("dotenv").config()
const express = require('express')
const QRCode = require('qrcode')
const open = require('open');
const inquirer = require('inquirer');
const os = require('os');
const ifaces = os.networkInterfaces();

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

	app.get("/", (req, res) => {
		QRCode.toDataURL(`http://${IP}:${process.env.PORT}/salut`, function (err, url) {
			res.send(`<img src="${url}" alt="QRCode" /><br/><p>http://${IP}:${process.env.PORT}</p>`)
		})
	})
	
	app.get("/salut", (req, res) => {
		res.send("Bonsoir");
	})
	
	app.listen(process.env.PORT, IP, () => {
		console.log(`Server lancé sur le port ${process.env.PORT}`)
		open(`http://${IP}:${process.env.PORT}`)
	})
}