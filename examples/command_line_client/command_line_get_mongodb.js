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

var mongo_db_dest = new $sis.MetaData({
	ServiceType : "DataBase",
	DBType : "MongoDB"	
}, $sis.NodeType.GATEWAY);


console.log("waiting for the connections to stablise...");

var nownow = new Date().getTime();
console.log("got the time...");

delay(2000).then(() => {
	console.log("now getting the temp data from mongodb...");
	
	function mongo_db_get_10() {
		console.log("mongo_db_get_10");
		console.log("signalling the we'll handle the response ourselves...");
		responseHandler.delayResponse = true;
		console.log("did thiat, now onto the real work...");
		
		function get_from_db(client, db, responseHandler) {
			console.log("get_from_db");
			var collection = db.collection("temp_collection");
			if ( collection == null ) {
				console.log("collection is null");
				responseHandler.respond(null);
			} else {
				console.log("collection is not null");
				var options = {
					"limit" : 10,
					"sort" : [ ["_id", "desc"] ]
				};
				collection.find({}, options).toArray( function(err, res){
					console.log("error was :" + err)
					client.close();
					console.log("sending the manual response")
					var result = {
						error: err,
						data: res
					};
					responseHandler.respond(result);					
				});
			}

		}
	
	
	
		function check_collection_and_get(client, db, responseHandler) {
			console.log("check_collection_and_get");
			db.listCollections({name: "temp_collection"}).toArray(function(err, names) {
				if ( names.length > 0 ) {
					console.log("found the collection");
					get_from_db(client, db, responseHandler);
				}
				else {
					console.log("can not find the collection, returning an error")
					responseHandler.respond(null);
				}
			});
		}
		
		function connect_and_get(responseHandler) {
			console.log("connect_and_get");
			var mongo = require('mongodb').MongoClient;
			var url = "mongodb://localhost:27017/tempdb";
			
			mongo.connect(url, function(err, client) {
				if ( err ) {
					console.log("could not connect to database");
					responseHandler.respond(null);
				} else {
					console.log("connected to the database...");
					var db = client.db('tempdb');
					console.log("got the client object and new using it...");
					check_collection_and_get(client, db, responseHandler);
					console.log("created the collection and inserted the results!");
				}
			});				
		}
		
		console.log("kicking off the get...")
		connect_and_get(responseHandler);
		return null;
	}
	
	function handle_db_response (result) {
		if ( result == null) {
			console.log("there was an error...");
		} else {
			console.log("the database has returned...");
			
			console.log("-----------------------------------------------------------------------");
			console.log("error : " + result.error);
			console.log("data : " + JSON.stringify(result.data));
		}
		process.exit(0);
	}
	
	var fake_pi_data = {
			temp : 24,
			time : nownow
		};

	console.log("Sending the task...");
	$sis.task( mongo_db_get_10, mongo_db_dest).then(handle_db_response);
	console.log("task sent");
	
}); // end of delay

