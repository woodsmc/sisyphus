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

var client_io = require('socket.io-client');
var importedSis = require('../../sis/sisyphus');

var $sis = importedSis.$sis;

console.log("starting as client");
$sis.configureAsClient( {
	platform: "linux",
	client : "node" 
	}, ["http://192.168.1.6/"], client_io);

var tempsource = new $sis.MetaData({
	Sensor : "Temp",
	Location : "Home-Study"	
	});



$sis.task( function(){
	const sense_hat = require('./sensehat');
	var temp = sense_hat.getTemp();
	return temp
}, to_pi ).then(function(result){
	console.log("pi informs me that the temp it see's is:" + result);
});

