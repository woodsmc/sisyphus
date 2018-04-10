/**
   (c) Copyright 2018 Mind-Flip Limited

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
**/

const delay = require('delay');
var client_io = require('socket.io-client');
var Q = require('q');
var $sis = require('../../sis/sisyphus').$sis;
var common_functions = require('./common_functions');

console.log("starting as client");
$sis.configureAsClient( {
	platform: "linux",
	client : "node" 
	}, ["http://192.168.1.6/"], client_io);



console.log("waiting for the connections to stablise...");

delay(2000).then(() => {
	console.log("now getting the temp data from mongodb...");
	console.log("Sending the task...");
	common_functions.get_db($sis).then( function (result) {
		if ( result == null) {
			console.log("there was an error...");
		} else {
			console.log("the database has returned...");
			
			console.log("-----------------------------------------------------------------------");
			console.log("error : " + result.error);
			console.log("data : " + JSON.stringify(result.data));
		}
		process.exit(0);
	});
	console.log("task sent");
	
}); // end of delay

