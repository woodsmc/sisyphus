



var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var ioclient = require('socket.io-client');
var path = require('path');

var Q = require('q');
var $sis = require('../../sis/sisyphus').$sis;
var common_functions = require('../command_line_client/common_functions');

console.log("starting as client");
$sis.configureAsClient( {
	ServiceType : "EdgeRender",
	HostCloud : "AWS-CDN"
	}, ["http://192.168.1.6/"], ioclient);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/latest', function(req,res) {
	res.setHeader('Content-Type', 'application/json');
	common_functions.get_db($sis).then( function(result){
		res.send(JSON.stringify(result));
	});
});

app.get('/force', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	common_functions.update_db($sis).then( function(result){
		res.send(JSON.stringify(result));
	});
});

server.listen(3000);





