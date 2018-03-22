/**
   (c) Copyright 2018 Mind-Flip Limited
   Based on the original from Intel (see license and details below).

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


   ----------------------------------------------------------------------------
   (c) Copyright 2013 Intel Performance Learning Solutions Ltd,
    Intel Corporation

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

var io = require('socket.io').listen(server);
var ioclient = require('socket.io-client');
var ipaddresses = require('./getlocalip');
var importedSis = require('../../sis/sisyphus');
var $sis = importedSis.$sis;

var myIP = ipaddresses.getIPAddress();
console.log("my local ip is being used:" + myIP);

if ( process.argv.length == 3 ) {
	console.log("Command line over rule for auto-detected IP address, using \"" + process.argv[2] + "\" instead.");
	myIP = process.argv[2]; //"pint.dyndns.info";
}

$sis.configureAsGateway( { gateway : "node" }, "http://" + myIP + "/", [], io, ioclient );
