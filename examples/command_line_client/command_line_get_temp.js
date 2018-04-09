/**
   (c) Copyright 2013 Intel Performance Learning Solutions Ltd, Intel Corporation

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 In addition to the Apache License, Version 2.0, please note that:
 This software is subject to the U.S. Export Administration Regulations
 and other U.S. law, and may not be exported or re-exported to certain
 countries (Cuba, Iran, North Korea, Sudan, and Syria) or to persons or
 entities prohibited from receiving U.S. exports (including Denied Parties,
 Specially Designated Nationals, and entities on the Bureau of Export 
 Administration Entity List or involved with missile technology or nuclear,
 chemical or biological weapons).
   
**/

const delay = require('delay');
var client_io = require('socket.io-client');
Q = require('q');
var importedSis = require('../../sis/sisyphus');


var $sis = importedSis.$sis;

console.log("starting as client");
$sis.configureAsClient( {
	platform: "linux",
	client : "node" 
	}, ["http://192.168.1.6/"], client_io);

var tempsource = new $sis.MetaData({
	ServiceType : "Sensor",
	Sensor : "Temp",
	Location : "Home-Study"	
	}, $sis.NodeType.GATEWAY);
	

function issue_get_temp_request() {
	var tempsource = new $sis.MetaData({
		ServiceType : "Sensor",
		Sensor : "Temp",
		Location : "Home-Study"	
		}, $sis.NodeType.GATEWAY);	
	
	function get_temp() {
		var path = require('path');
		var fs = require('fs');
		var directory = path.join( path.dirname(fs.realpathSync(__filename)), '../examples/pi_sensehat');
		const sense_hat = require(directory + '/sensehat');
		var currentTemp = sense_hat.getTemp();
		var now = new Date().getTime();
		var retval = {
			temp : currentTemp,
			time : now
		};
		return retval;		
	}
	
	return $sis.task( get_temp, tempsource);		
}




console.log("waiting for the connections to stablise...");



delay(2000).then(() => {
	console.log("now requesting the temp from the Sisyphus framework");
	
	issue_get_temp_request().then( function(result){
		var time = new Date( result.time ).toUTCString();
		console.log("-----------------------------------------------------------------------");
		console.log("pi informs me that the temp it see's is " + result.temp + " on  " + time);
		process.exit(0);		
	});
	
});

