require("dotenv").config()
const express = require('express')
const QRCode = require('qrcode')
const open = require('open');

const app = express()

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});

const IP = "192.168.0.11";
startServ()

function startServ() {
	app.get("/", (req, res) => {
		QRCode.toDataURL(`http://${IP}:${process.env.PORT}/salut`, function (err, url) {
			res.send(`<img src="${url}" alt="QRCode" /><br/><p>http://${IP}:${process.env.PORT}</p>`)
		})
	})
	
	app.get("/salut", (req, res) => {
		console.log("Salut")
		res.send("Bonsoir");
	})
	
	app.listen(process.env.PORT, IP, () => {
		console.log(`Server lancé sur le port ${process.env.PORT}`)
		open(`http://${IP}:${process.env.PORT}`)
	})
}