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

function get_data_from_db($sis) {
	var mongo_db_dest = new $sis.MetaData({
		ServiceType : "DataBase",
		DBType : "MongoDB"	
	}, $sis.NodeType.GATEWAY);	//m ongo_db_dest
	
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
		} // connect_and_get
		
		console.log("kicking off the get...")
		connect_and_get(responseHandler);
		return null;
	}	// mongo_db_get_10
	
	return $sis.task( mongo_db_get_10, mongo_db_dest);
} // get_data_from_db

function issue_request_to_update_db($sis) {

	var mongo_db_dest = new $sis.MetaData({
		ServiceType : "DataBase",
		DBType : "MongoDB"	
	}, $sis.NodeType.GATEWAY);
	
	function mongo_db_insert(ignore_data, meta, responseHandler) {
		var Q = require('q');
		
		function issue_get_temp_request() {
			var tempsource = new $sis.MetaData({
				ServiceType : "Sensor",
				Sensor : "Temp",
				Location : "Home-Study"	
				}, $sis.NodeType.GATEWAY);
							
			function get_temp() {
				console.log("getting the temp... ");
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
				
				console.log("temp returning: " + JSON.stringify(retval));
				return retval;		
			}
			
			console.log("making request for temp from pi...")
			var promise = $sis.task( get_temp, tempsource);
			console.log("request made");
			return promise;
		}		
		
		function insert_into_db(client, db, data, responseHandler) {
			db.collection("temp_collection").insertOne(data, function(err, res){
				console.log("error was :" + err)
				client.close();
				console.log("sending the manual response")
				responseHandler.respond(data);
			});
		}

		function create_collection_and_insert(client, db, data, responseHandler) {
			console.log("create_collection_and_insert");
			db.listCollections({name: "temp_collection"}).toArray(function(err, names) {
				if ( names.length > 0 ) {
					console.log("found the collection");
					insert_into_db(client, db, data, responseHandler);
				}
				else {
					console.log("can not find the collection, making it")
					db.createCollection("temp_collection", function(err, res) {
						console.log("collection made");
						insert_into_db(client, db, data, responseHandler);
					});
				}
			});
		}
		
		function upsert_mongodb(data, responseHandler) {
			console.log("connect_create_collection_insert");
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
					create_collection_and_insert(client, db, data, responseHandler);
					console.log("created the collection and inserted the results!");
				}
			});				
		}
		
		console.log("mongo_db_insert");
		console.log("signalling the we'll handle the response ourselves...");
		responseHandler.delayResponse = true;
		console.log("did thiat, now onto the real work...");
		
		console.log("making request for data from pi")
		issue_get_temp_request().then( function (result) {
			console.log("kicking off the insert...")
			upsert_mongodb(result, responseHandler);
		});
		
		return null;
	}	// mongo_db_insert
	
	return $sis.task( mongo_db_insert, mongo_db_dest, null	);
}

console.log("exporting common functions");
if ( typeof(exports) != 'undefined' ) {
	exports.update_db = issue_request_to_update_db;
	exports.get_db = get_data_from_db;
	//exports.get_db
}
