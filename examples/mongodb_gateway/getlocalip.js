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


function getListOfIPAddresses() {
	var retval = new Array();
	var os = require('os');
	var ifaces=os.networkInterfaces();
	console.log("processing interfaces");

	for(var dev in ifaces) {
		var alias =0;
		ifaces[dev].forEach(function(details){
			if ( details.family=='IPv4') {
				//console.log(dev+(alias?':'+alias:''),details.address);
				retval.push(details.address);
				alias++;				
			}
		});
	}	

	return retval;
}

function getFirstExternalIpAddress() {
	var addresses = getListOfIPAddresses();
	var retval = null;
	for(var i =0 ; i < addresses.length; i++) {
		if ( addresses[i] != '127.0.0.1' ) {
			retval = addresses[i];
			break;
		}
	}
	return retval;
}


function getWorkableIPAddress() {
	var address = getFirstExternalIpAddress();
	if ( address == null ) {
		addreess = '127.0.0.1';
	}
	return address;
}

if ( typeof(exports) != 'undefined' ) {
	exports.getIPAddress = getWorkableIPAddress;
}