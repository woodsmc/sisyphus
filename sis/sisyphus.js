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
**/


$sis = function(){
	var Q = require('q');
	var $sis = { };
	
	var resultIs = {
		OK : 1,
		BAD : 2
	};

	Queue = function(onpush) {
		this.q = new Array();
		var onpushFunction = onpush;
		var onpushFunction = onpush;
		var me = this;
		this.push = function(item) {
			//console.log("Queue.push");
			this.q.push(item);
			if ( onpushFunction != null ) {
				//console.log("onpushFunction is not null.. invoking");
				setTimeout(function() {
					onpushFunction(me);	
				}, 1);
			}
		};
		
		this.pop = function() {
			//console.log("pop");
			var item = this.q.pop();
			return item;
		};
	}

	Queue.prototype = Object.create(Queue, {
		empty : {
			get : function() {
				var retval = false;
				if ( this.q.length == 0 )
					retval = true;
				return retval;
			}, enumerable : true, configurable : true
		},
		length :  {
			get : function() {
				return this.q.length;
			}, enumerable : true, configurable : true
		}
	});
	
	function generateGUID() {
		return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			}));
	}
	
	function deserialise_MetaData(obj) {
		var retval = new MetaData();
		//console.log("deserialise_MetaData:");
		for (var property in obj ) {
			switch(property) {
				case '_guid':
				case 'url':
				case 'nodeType':
				case 'extended':
					retval[property] = obj[property];
					//console.log(" ->" + property + " = " + obj[property]);
				break;
			}
		}
		//console.log("finished metadata");
		return retval;
	}
	

	var MetaData = function(extendedMetaData, nodeType) {
		this._guid = null;
		this.generateNewGuid = function() {
			this._guid = generateGUID();
		};
		this.url = null;
		if ( typeof (nodeType) === 'undefined' ) {
			this.nodeType = $sis.NodeType.CLIENT;
		} else {
			this.nodeType = nodeType;
		}
		
		if ( typeof(extendedMetaData) === 'undefined' )
			this.extended = { };
		else
			this.extended = extendedMetaData;

		this.makeCopy = function() {
			var me = new MetaData();
			me._guid = this._guid;
			me.url = this.url;
			me.nodeType = this.nodeType;
			me.extended = this.extended;
			return me;
		}
		
		this.isMe = function() {
			return (this.guid == $sis.myMetaData.guid );
		}
		
		this.isClient = function() {
			return (this.nodeType == $sis.NodeType.CLIENT);
		}
		
		this.isServer = function() {
			return (this.nodeType == $sis.NodeType.SERVER);
		}
		
		this.isGateway = function() {
			return (this.nodeType == $sis.NodeType.GATEWAY);
		}
		
		this.hasGuidButNoUrl = function() {
			return (this._guid != null && ( this.url == null || this.url === "http://null" ) );
		}
		
		this.storageKey = function() {
			//console.log("storageKey for (" + this.url +")(" + this.guid + ")");
			var retval = null;
			if ( this.guid == $sis.myMetaData.guid && this.url == null) {
				retval = "http://null";
			} else if ( this.url != null ) {
				//console.log("url is not present, or is the default URL");
				retval = this.url; 
			} else if ( this.guid != null ) {
				//console.log("guid is present,  using this as key");
				retval = this.guid;
			}else {
				//console.log("warning, connection's storage key is not available ... !!!!");
			}
			//console.log("storage key is[" + retval + "]");
			return retval;
		}
		
		this.merge = function(metadata) {
			if ( metadata.url != null) this.url = metadata.url;			
			this.nodeType = metadata.nodeType;
			this.extended = metadata.extended;
			this._guid = metadata.guid;
		}

		this.copy = function(metadata) {
			this._guid = metadata._guid;
			this.url = metadata.url;
			this.nodeType = metadata.nodeType;
			this.extended = metadata.extended;
		}
		
		this.subsetMatch = function(metadata) {
			//console.log("subset match this : " + JSON.stringify( this ) );
			//console.log("subset match that : " + JSON.stringify( metadata ) );
			
			var retval = false;
			if ( this.guid != null && metadata.guid != null) {
				//console.log("doing GUID compare");
				return (this.guid === metadata.guid);
			}
			if ( this.nodeType != null && metadata.nodeType != null ){
				//console.log("doing nodeType compare");
				retval = (this.nodeType === metadata.nodeType);
				if ( retval == false ) return false;
			}
			
			function compareObjects(obj1, obj2) {
				if ( typeof(obj1)!= 'object' && typeof(obj2) != 'object' ) {
					return (obj1 == obj2);
				}else if( typeof(obj1) === 'object' && typeof(obj2) === 'object') {
					var obj2keys = Object.keys(obj2);
					var obj1keys = Object.keys(obj1);
					for( var i = 0; i < obj1keys.length; i++){
						var key = obj1keys[i];
						if ( obj2keys.indexOf(key) != -1 ) {
							return compareObjects(obj1[key], obj2[key]);
						}
					}
				}else {
					return false;
				}
			}
			if ( Object.keys(metadata.extended).length > 0 )
				//console.log("comparing extended data... ");
				retval = compareObjects(metadata.extended, this.extended);
				
			return retval;
		}
	}
	
	MetaData.prototype = Object.create(MetaData, {
		guid : {
			get : function() {
				return this._guid;				
			},
			
			set : function(metadata) {
				this._guid = metadata.guid;
			},
			enumerable : true, configurable : true
		}
	});
	
	var MY_URL = "http://null";
	
	// accepts array of URLs
	function KnownHosts(hostList) {
		var _knownHosts = new Array(); // key is URL
		var _containsHostOtherThanMe = false;
		this.changeCallback = null;
		
		_knownHosts[MY_URL] = new Array();
		_knownHosts[MY_URL].push($sis.myMetaData);
		
		if (typeof(hostList) != 'undefined') {
			_containsHostOtherThanMe = true;
			for(var i = 0; i < hostList.length; i++ ) {
				_knownHosts[hostList[i]] = new Array();
				var metadataForHost = new MetaData();
				metadataForHost.url = hostList[i];
				_knownHosts[hostList[i]].push(metadataForHost);
			}
		}
		
		this.item = function (itemIndex) {			
			var keys = Object.keys(_knownHosts);
			var retval = null;
			for(var i = 0; i < keys.length; i++) {
				if ( itemIndex < _knownHosts[keys[i]].length ) {
					retval = _knownHosts[keys[i]][itemIndex];
					break;
				}
				itemIndex -= _knownHosts[keys[i]].length;
			}
			return retval;
		}
		
		this.length = function() {
			var keys = Object.keys(_knownHosts);
			var length = 0;
			for(var i = 0; i < keys.length; i++) {
				length += _knownHosts[keys[i]].length;
			}
			return length;
		}
		
		this.populateWithKnownUrl = function(metadata) {
			//console.log("populateWithKnownUrl");
			var max = this.length();
			for( var i = 0; i < max; i++ ) {
				var item = this.item(i);
				if ( item.guid === metadata.guid ) {
					metadata.url = item.url;
					//console.log("found and populated with url");
					break;
				}				
			}
			
			//console.log("finished : populateWithKnownUrl");
		}

		this.findCapableHost = function(metadata) {
			var retval = null;
			var keys = Object.keys(_knownHosts);			
			for(var i = 0; i < keys.length; i++) {
				for( var j = 0; j < _knownHosts[keys[i]].length; j++ ) {
					var host = _knownHosts[keys[i]][j];
					if ( host.subsetMatch(metadata) ) {
						retval = host;
						break;
					}
				}
			}
			return retval;
		}
		
		this.findCapableHostOtherThanOriginator = function(job) {
			//console.log("findCapableHostOtherThanOriginator for job from:" + job.originatingMetaData.guid);
			var retval = null;
			var keys = Object.keys(_knownHosts);
			for(var i = 0; i < keys.length; i++) {
				for( var j = 0; j < _knownHosts[keys[i]].length; j++ ) {
					var host = _knownHosts[keys[i]][j];
					//var debug = "[" + i + "]";
					if ( job.originatingMetaData.guid != host.guid && host.subsetMatch(job.destinationMetaData) ) {
						retval = host;
						break;
					}
				}
			}
			return retval;
		}

		this.forall = function(fn) {
			var keys = Object.keys(_knownHosts);			
			for(var i = 0; i < keys.length; i++) {
				for( var j = 0; j < _knownHosts[keys[i]].length; j++ ) {
					fn(_knownHosts[keys[i]][j], keys[i], i, j);
				}
			}		
		}

		this.foreachendpoint = function(fn) {
			var keys = Object.keys(_knownHosts);			
			for(var i = 0; i < keys.length; i++) {
				if ( keys[i].indexOf("http:") == 0 && _knownHosts[keys[i]].length > 0 ) {
					fn(_knownHosts[keys[i]][0]);
				}
			}		
		}
		
		function getPrimaryKeyForItemWith(property, whichHasValue) {
			var retval = null;
			var keys = Object.keys(_knownHosts);			
			for(var i = 0; i < keys.length; i++) {
				for( var j = 0; j < _knownHosts[keys[i]].length; j++ ) {
					if (_knownHosts[keys[i]][j][property] == whichHasValue) {
						retval = keys[i];
						break;
					}
				}
			}
			return retval;
		}

		this.invokeChangeCallback = function() {
			if ( this.changeCallback != null) {
				var currentState = new Array();
				var max = this.length();
				for( var i = 0; i < max; i++ ) {
					var item = this.item(i).makeCopy();	
					currentState.push(item);
				}

				this.changeCallback(currentState);
				currentState = null;
			}

		}
		
		this.deleteHost = function(metadata) { // there is a duplication of functionality here... 
			//console.log("known hosts deleting host details for " + metadata.guid);
			var keyToDelete = metadata.storageKey();
			var removed = false;
			if ( keyToDelete != null ) {
				//console.log("got storagekey to delete:" + keyToDelete);
				if ( keyToDelete in _knownHosts ) {
					//console.log("deleting key")
					delete _knownHosts[keyToDelete];
					removed = true;
				}
				
			}
			
			if ( !removed) {
				keyToDelete = null;
				//console.log("looks like we've not found the item to delete it");
				
				if ( metadata.guid != null ) {
					keyToDelete = getPrimaryKeyForItemWith("guid", metadata.guid);
				}
				
				if ( keyToDelete== null && metadata.url != null) {
					keyToDelete = getPrimaryKeyForItemWith("guid", metadata.url);
				}
				
				if ( keyToDelete != null ) {
					delete _knownHosts[keyToDelete];
				}
				
			}
			
			if (this.length() == 1 && this.item(0).guid == $sis.myMetaData.guid)
				_containsHostOtherThanMe = false;
			else
				_containsHostOtherThanMe = true;

			this.invokeChangeCallback(this);
			
		}	
	



		this.upsert = function(metadata) {
			
			var stored = false;
			
			if ( metadata.length > 0) {			
				var key = metadata[0].storageKey();
				//console.log("knownhosts upsert:" + key);
				if ( key != null ) {
					_knownHosts[key] = metadata; // assuming metadata is an array				
					stored = true;
				} else {
					//console.log("unable to update knownhosts with array of meta data - no key available");
				}
			}
			
			if (stored) {
				for( var i = 0; i < metadata.length; i++){
					if (!metadata[i].isMe()) {
						_containsHostOtherThanMe = true;
						break;
					}
				}
			}
				
			this.invokeChangeCallback(this);
		}

		this.getLocalVersionOfMetadata = function(metadata) {
			//console.log("getLocalVersionOfMetadata");
			//console.log("received metadata URL(" + metadata.url + ") GUID:" + metadata.guid );
			var retval = metadata;
			if ( metadata.guid != null ) {
				//console.log("metadata.guid is not null!");
				var keys = Object.keys(_knownHosts);
				for(var i = 0; i < keys.length; i++) {
					for( var j = 0; j < _knownHosts[keys[i]].length; j++ ) {
						var host = _knownHosts[keys[i]][j];						
						if ( host.guid == metadata.guid) {
							retval = host;
							break;
						}
					}
				}				
			}
			return retval;
		}
		
		this.containsHostOtherThanMe = function() {
			return _containsHostOtherThanMe;
		}
	}
	
	function NotificationList() {
		var list = new Array();
		this.store = function(job, deferred) {
			var obj = {
				'job' : job,
				'deferred' : deferred
			};
			list[job.jobGuid] = obj;
		}
		
		this.signal = function(notification) {
			////console.log("signal invoked for notification:" + JSON.stringify(notification));
			if ( notification.jobGuid in list ) {
				var indextoRemove = -1;
				for(var i = 0; i < list.length; i++) {
					if ( list[i].job.jobGuid == notification.jobGuid ) {
						indextoRemove = i;
						break;
					}
				}
				
				var job = list[notification.jobGuid].job;
				var deferred = list[notification.jobGuid].deferred;
				
				// remove item from array///
				list.splice(indextoRemove, 1);
				////console.log("invoking call back with(" + notification.payload + ")");
				deferred.resolve(notification.payload);
			}
		}
	}

	/*Assumes presences of socket.io*/
	
	function CommunicationManager(onJob, onNotification, knownHosts){
		//console.log("creating communication manager");
		var WHY_CLIENT_HELLO = "why client hello";
		var ABOUTME = "aboutme";
		var _knownHosts = knownHosts;
		var _onJob = onJob;
		var _onNotification = onNotification;

		var io = {
			client : null, // making connections to servers from browser / gateway
			server : null // recieving connections from clients / gateways on gateway / server
		}
		

		if ( typeof(window) != 'undefined' ) {
			//console.log("configuring as a browser element");
			io.client = window.io;
		} else {
			//console.log("configuring as a node element");
		}
		
		
		function Message(type, payload) {
			//console.log("creatign new message, type " + type)
			this.type = type;
			this.payload = payload;
		}
		
		var liveconnections = new Array();
	
		function storeConnection(socket, metadata){ // upsert
			//console.log("storing connection for url[" + metadata.url + "] >" + metadata.guid );
			var key = metadata.storageKey();
			if ( key != null ) {
				liveconnections[key] = socket;
			} else {
				//console.log("warning, connection cannot be stored!!!!")
			}
		}
		
		function findConnection(metadata) {
			//console.log("searching for an active connection to url[" + metadata.url + "] >" + metadata.guid );
			var retval = null;
			if ( metadata.url != "http://null" && metadata.url != null ) {
				if ( metadata.url in liveconnections ) {
					//console.log("found active connection for " + metadata.url);
					retval = liveconnections[metadata.url];
				}
			} else if ( metadata.guid != null ) {
				if( metadata.guid in liveconnections ) {
					//console.log("found connection for " + metadata.guid );
					retval = liveconnections[metadata.guid];
				} else {
					//console.log("I've not found a connection");
				}
			}
			return retval;
		}
		
		function removeConnection(metadata) {
			//console.log("removeConnection");
			var keyToDelete = metadata.storageKey();
			if (keyToDelete in liveconnections ) {
				delete liveconnections[keyToDelete];
			}
		}
		
		function generateArrayOfMyMetaData(destinationMetadata) {
			//console.log("generateArrayOfMyMetaData");
			var retval = new Array();
			switch ( $sis. myMetaData.nodeType ) {
				case $sis.NodeType.CLIENT:
				case $sis.NodeType.SERVER:
					retval.push($sis.myMetaData);
				break;

				case $sis.NodeType.GATEWAY: {
					if (typeof(destinationMetadata) != 'undefined' && destinationMetadata != null ) {
						knownHosts.forall( function(i) {
							if ( i.isMe() ) {
								retval.push(i);
							}else if (destinationMetadata.guid != i.guid) {
								var duplicate = new MetaData();
								duplicate.copy(i);
								duplicate.url = $sis.myMetaData.url;
								retval.push(duplicate);
							}
						});
					} else {
						knownHosts.forall( function(i) {
							if ( i.isMe() ) {
								retval.push(i);
							}else{
								var duplicate = new MetaData();
								duplicate.copy(i);
								duplicate.url = $sis.myMetaData.url;
								retval.push(duplicate);
							}
						});
					}
				}
				break;
			}
			return retval;
		}
		
		function handleArrayOfReceivedMetaData(data) {
			//console.log("handleArrayOfReceivedMetaData");
			var retval= new Array();
			for (var i = 0; i < data.length; i++) {
				var metadata = deserialise_MetaData(data[i]);
				retval.push(metadata);
			}
			return retval;
		}
		
		function job_handler(data) {
			//console.log("job_handler");
			//console.log("received JOB!");
			if ( _onJob != null ) {
				//console.log("handler available - sending for processing");
				var job = deserialise_Job(data);
				job.destinationMetaData = knownHosts.getLocalVersionOfMetadata(job.destinationMetaData);
				_onJob(job);
			} else {
				//console.log("no handler is registered for processing job");
			}
		}
		
		function notification_handler(data) {
			//console.log("notificaiton_handler");
			//console.log("received Notification : " + JSON.stringify(data));
			
			if ( _onNotification != null ) {
				//console.log("handler available - sending for processing");
				var notification = deserialise_Notification(data);
				_onNotification(notification);
			} else {
				//console.log("no handler is registered for processing notification");
			}
		}
		
		function client_handle_why_client_hello(data, socket) {
			//console.log("as a client I've just received about me info from a node or gateway - processing it here") ;
			var receivedMetaData = handleArrayOfReceivedMetaData(data);
			knownHosts.upsert(receivedMetaData);
			// I do not update liveconnections - as it will already be assigned the url from which I've received this data			
			send_aboutme(socket, receivedMetaData[0]);
		}

		function client_handle_aboutme(data, socket) {
			//console.log("as a client I've just received about me info from a node or gateway - processing it here") ;
			var receivedMetaData = handleArrayOfReceivedMetaData(data);
			knownHosts.upsert(receivedMetaData);
			// I do not update liveconnections - as it will already be assigned the url from which I've received this data			
			//send_aboutme(socket, receivedMetaData[0]);
		}		
		
		function server_handle_aboutme(data, socket) {
			//console.log("As a server I've just received about me info");
			// we can record the connection here too
			//console.log("recording connection in live connections");
			var receivedMetaData = handleArrayOfReceivedMetaData(data);
			storeConnection(socket, receivedMetaData[0]);
			knownHosts.upsert(receivedMetaData);
			// I do not send about me... 
			return receivedMetaData[0];
		}
		
		function send_aboutme(socket, metadata) {
			//console.log("send_aboutme");
			if ( metadata != null ) {
				//console.log("sening about me information to " + metadata.guid)	;			} else {
				//console.log("sending about me information to an unknown connection...");
			}
			
			var dataToSend = generateArrayOfMyMetaData(metadata);
			socket.emit(ABOUTME, dataToSend);
			//console.log("about me sent");
		}

		function send_why_client_hello(socket, metadata) {
			//console.log("send_why_client_hello");
			if ( metadata != null ) {
				//console.log("sening about me information to " + metadata.guid)	;			} else {
				//console.log("sending about me information to an unknown connection...");
			}
			
			var dataToSend = generateArrayOfMyMetaData(metadata);
			socket.emit(WHY_CLIENT_HELLO, dataToSend);
			//console.log("about me sent");
		}		
		
		function handleConnectionDisconnectAndInformOthers(metadata) {
			//console.log( "  handleConnectionDisconnectAndInformOthers" );			
			//todo: remove hosts associated with this socket / guid from our knownhosts and live connections
			removeConnection(metadata);
			knownHosts.deleteHost(metadata);
			// send an about me to anone remaining to let them know about the disconnect and lost of connection
			knownHosts.forall(function(host){
				//console.log("found :" + host.guid);
				if ( !host.isMe() ) {
					//console.log( host.guid + " should be send an about me message");
					sendAboutMeMessageTo(host);
					//console.log("about message sent");
				} else {
					var str = "";
					if ( host.isMe() ) str = " me!";
					//console.log(host.guid + " is " + str );
				}
			});		
		}
		
		function handleConnectionDisconnect(metadata) {
			//todo: remove hosts associated with this socket / guid from our knownhosts and live connections
			//console.log("  handleConnectionDisconnect");
			removeConnection(metadata);
			knownHosts.deleteHost(metadata);		
		}
		
		function retryEstablishConnection(metadata, callback, existingSocket) {
			//console.log("retryEstablishConnection");
			setTimeout(function(){
				//console.log("retryEstablishConnection, timeout expired... ");
				establishConnection(metadata, callback, existingSocket);
				}, 1000);
		}
		
		function establishConnection(metadata, callback, existingSocket) {
			//console.log("establishing a connection to " + metadata.url);
			var newSocket = true;
			var socket = null;
			if ( typeof(existingSocket) != 'undefined') {
				newSocket = false;
				socket = existingSocket;
				socket.reconnect();
			} else {
				socket = io.client.connect(metadata.url);
			}
			storeConnection(socket, metadata);
			
			if (newSocket){
				socket.on(WHY_CLIENT_HELLO, function(data){
					client_handle_why_client_hello(data, socket);
					callback(resultIs.OK);
				});

				socket.on(ABOUTME, function(data) {
					client_handle_aboutme(data, socket);				
				});
				socket.on(messageTypeIs.JOB, job_handler);
				socket.on(messageTypeIs.NOTIFICATION, notification_handler);	
				socket.on('disconnect', function() {
					//console.log("registered a disconnection from : " + metadata.guid);
					switch( $sis.myMetaData.nodeType ) {
						case $sis.NodeType.CLIENT:							
							handleConnectionDisconnect(metadata);
							retryEstablishConnection(metadata, callback, socket);
						break;
						
						case $sis.NodeType.SERVER: // this should never happen - servers never establish a connection
						break;
						
						case $sis.NodeType.GATEWAY:
							handleConnectionDisconnectAndInformOthers(metadata);
						break;
						
					}
					
				});
				socket.on('error', function() {
					//console.log("error connecting to " + metadata.url);
					retryEstablishConnection(metadata, callback);
		
				});

				socket.on('connect_failed', function() {
					//console.log("error connecting to socket " + metadata.url);
					retryEstablishConnection(metadata, callback);
				});					
			}

					
		}
		
		// this function sends a message to a client only if it is already connected.. avoiding an about me game of tennis
		function sendAboutMeMessageTo(metadata) {
			//console.log("sending an about me message");
			var connection = findConnection(metadata);
			if (connection != null) {
				//console.log("connection exists sending about me message");
				send_aboutme(connection, metadata);
			}
		}


		this.clientUpdateOfAboutmeInfo = function() {
			//console.log("clientUpdateOfAboutmeInfo");
			knownHosts.foreachendpoint(function(host){
				//console.log("found :" + host.guid);
				if ( !host.isMe()) {
					//console.log( host.guid + " should be send an about me message");
					sendAboutMeMessageTo(host);
					//console.log("about message sent");
				} 
			});			
		}
				
		this.sendMessage = function (metadata, type, message, doneCB) {
			//console.log("sending a message");
			//console.log("checking meta data");
			if ( metadata.hasGuidButNoUrl() ) {
				//console.log("there is no URL for this destination, and an existing link was not found");
				_knownHosts.populateWithKnownUrl( metadata );
			} else {
				//console.log("metadata ok");
			}
			
			var connection = findConnection(metadata);
			if ( connection == null ) {
				//console.log("connection could not be found");				
				//console.log("creating a missing connection");
				connection = establishConnection(metadata, function(result){
					if ( result == resultIs.OK ) {
						//console.log("connection establoshed, sending message");
						connection.emit(type, message);
					}
					doneCB(result);
				});
			} else {
				//console.log("connection exists sending message");
				connection.emit(type, message);
				doneCB(resultIs.OK);
			}
		}
		
		this.startConnectionsToKnownHosts = function(socketioclient) {
			//console.log("startConnectionsToKnownHosts");
			if ( typeof(socketioclient) != 'undefined' ) {
				io.client = socketioclient;
			}
			
			var max = knownHosts.length();
			//console.log("startConnectionsToKnownHosts (" + max + ")");
			if ( max > 1 ) {
				// try to establish connections first, then tell the developer
				knownHosts.forall(function(host){
					//console.log("host[" + host.guid + "]");
					if ( ! host.isMe() ) {
						//console.log("this host isn't me, creating connection to " + host.url);
						establishConnection(host, function(result) {
							//console.log("connection established to " +  host.url);
							// call back...
							// if ( result == resultIs.OK)
							
						});
					}
				});
			} else {
				// theer is only one known host, that's us... so just tell the developer what the status is
				//console.log("the only host available is me, not establishing connections");
				knownHosts.invokeChangeCallback();	
			}
		}
		
		this.startReceivingIncomingConnections = function(socketio) {
			//console.log("startReceivingIncomingConnections");
			io.server = socketio;
			io.server.sockets.on('connection', function (socket) {
				//console.log("connection received, sending about me");
				var socketsMetaData = null;
				send_why_client_hello(socket, null);
				socket.on(ABOUTME, function(data) {
					//console.log("received about me information");
					socketsMetaData = server_handle_aboutme(data, socket);
					//console.log("about me information delt with, sending update description of self to everyone else");
					knownHosts.forall(function(host){
						//console.log("found :" + host.guid);
						if ( !host.isMe() && host.guid != socketsMetaData.guid ) {
							//console.log( host.guid + " should be send an about me message");
							sendAboutMeMessageTo(host);
							//console.log("about message sent");
						} else {
							var str = "";
							if ( host.isMe() ) str = " me!";
							if ( host.guid == socketsMetaData.guid ) str = " the recently joined dude";
							console.log(host.guid + " is " + str );
						}
					});
				});
				socket.on('disconnect', function() {
					handleConnectionDisconnectAndInformOthers(socketsMetaData);
				});
				
				socket.on(messageTypeIs.JOB, job_handler);
				socket.on(messageTypeIs.NOTIFICATION, notification_handler);	
			});			
		}
		
	}

	var messageTypeIs = {
		JOB : "Job",
		NOTIFICATION : "Notification"
	};
	
	var jobCameFrom = {
		ME : 0,
		EXTERNAL : 1
	};	
	
	function deserialise_Job(obj) {
		//console.log("deserialise_Job");
		var retval = new Job(function(){}, null, null, false);
		//console.log("deserialise_Job>");
		for (var property in obj ) {
			switch(property) {
				case 'jobGuid':
				case 'payload':
				case 'fnct':
				case 'fireandforget':
					retval[property] = obj[property];
					//console.log(" ["+property+"]->" + obj[property]);
				break;
				
				case 'destinationMetaData':
				case 'originatingMetaData':
					//console.log(" ["+property+"]--->")
					retval[property] = deserialise_MetaData(obj[property]);
				break;
			}
		}
		retval.originator = jobCameFrom.EXTERNAL;
		//console.log("deserialise_Job<");
		return retval;
	}	

	function Job(fnct, metadata, payload, fireandforget) {
				
		function ResponseHandler(jobToHandle) {			
			function sendResponse(job, response) {
				if ( !job.fireandforget ) {
					//console.log("this job need a response");
					// send response back...
					var notify = new Notification(job.jobGuid, job.originatingMetaData, response);
					if (notify.isForMe()) {
						//console.log("response is addressed to me... ");
						notificationQueue.push(notify);
						//console.log("pushed locally");
					}else {
						//console.log("response is addressed to someone else... ");
						var msg = {
							type : messageTypeIs.NOTIFICATION,
							message : notify
						};
						outgoingQueue.push(msg);
					}
				}		
			}			
			
			this.job = jobToHandle;
			this.delayResponse = false;
			this.respond = function(response) {
				sendResponse(this.job, response);
			};
			this.automaticResponse = function(response) {
				if ( !this.delayResponse ) {
					sendResponse(this.job, response);
				}
			}
		}
		

		//console.log("new Job");
		this.originator = jobCameFrom.ME;
		this.jobGuid = generateGUID();
		this.payload = payload;
		this.destinationMetaData = metadata;
		this.originatingMetaData = $sis.myMetaData;
		this.fireandforget = fireandforget;
		this.fnct = fnct.toString();
		this.execute = function() {
			var responseHandler = new ResponseHandler(this);
			var functionToCall = null;
			var string = "functionToCall = " + this.fnct;
			eval(string);
			var response = null;
			
			try {
				//console.log("trying to execute job:");
				response = functionToCall(this.payload, this.originatingMetaData, responseHandler);	
				//console.log("job executed.");
			} catch(err) {
				//console.log("error executing job:");
				responseHandler.delayResponse = false; // override to send erro response back
				response = null;
				//console.log(err);
				//console.log("continuing with execution, response is null");
			}
			
			responseHandler.automaticResponse(response);
		};
		
		this.isAddressedToMe = function() {
			//console.log("isAddressedToMe");
			return (this.destinationMetaData.guid == $sis.myMetaData.guid);
		};
		
		this.isAddressedToSomeoneElse = function() {
			//console.log("isAddressedToSomeoneElse");
			return (!this.isAddressedToMe() && this.destinationMetaData.guid !=  null);
		};
		
		this.jobCanBeExecutedByMe = function() {
			//console.log("jobCanBeExecutedByMe");
			return (this.destinationMetaData.subsetMatch($sis.myMetaData));
		}
	}
	
	function deserialise_Notification(obj) {
		//console.log("deserialise_Notification");
		var retval = new Notification(null, null, null);
		
		for (var property in obj ) {
			switch(property) {
				case 'jobGuid':
				case 'payload':
					retval[property] = obj[property];
				break;
				
				case 'destinationMetaData':
				case 'originatingMetaData':
					retval[property] = deserialise_MetaData(obj[property]);
				break;
			}
		}
		return retval;
	}	
	
	function Notification(jobGuid, metadata, payload) {
		//console.log("new Notification");
		this.jobGuid = jobGuid;
		this.payload = payload;
		this.destinationMetaData = metadata;
		this.originatingMetaData = $sis.myMetaData;
		this.isForMe = function() {
			return ( this.destinationMetaData.guid === $sis.myMetaData.guid );
		}
	}
	
	function receivedJob(job) {
		//console.log("recieved a job : " + job.jobGuid + " from : " + job.originatingMetaData.guid + " to: " + job.destinationMetaData.guid);
		processJob(job);
	}
	
	function dispatchJobToOutgoingQueue(job) {
		//console.log("dispatchJobToOutgoingQueue");
		if ( ! knownHosts.containsHostOtherThanMe() ) {
			// show a warning message here
			//console.log("there are no other known hosts - placing job on outgoing queue, it may be there for some time...");
		}
		
		if ( job.destinationMetaData.guid == null ) { // find a exact host which can do the work...
			// this should never happen.... not handled...
			//var newDestination = knownHosts.findCapableHost(job.destinationMetaData);
		}
		
		/**
		if ( job.isAddressedToSomeoneElse() && job.originator == jobCameFrom.EXTERNAL ) {
			// the job came from somone else, and is addressed to someone elese - we are just the gateway.
			// ensure that job's return path meta data is OK.			
		}**/
		
		var msg = {
			type : messageTypeIs.JOB,
			message : job
		}
		outgoingQueue.push(msg);
	}
	
	function dispatchJobToOtherHost(job) {
		var retval = null;
		//console.log("dispatchJobToOtherHost");
		var newdestination = knownHosts.findCapableHostOtherThanOriginator(job);
		if ( newdestination != null ) {
			//console.log("new destination found, setting and dispatching");
			job.destinationMetaData = newdestination;
			dispatchJobToOutgoingQueue(job);
		} else {
			//console.log("can't dispatch job...");
			retval = job;
		}
		return retval;
	}
	
	function processJob(job) {
		//console.log("processing job");
		if ( job.isAddressedToMe() ) {
			//console.log("job is directly addressed to me");
			incommingQueue.push(job);
		} else if (job.isAddressedToSomeoneElse() ) {
			//console.log("this job has been addressed to someone else - dispatching");
			dispatchJobToOutgoingQueue(job);
		} else if ( job.jobCanBeExecutedByMe() ) {
			//console.log("job is not directly addressed to me, but I can deal with it");
			if ( incommingQueue.length < $sis.incommingJobThreshold ) {
				//console.log("job accepted");
				job.destinationMetaData = $sis.myMetaData;
				incommingQueue.push(job);
			} else if ( knownHosts.containsHostOtherThanMe() ) {
				//console.log("there are other hosts, checking to see if one of them can do it");
				var remainingJob = dispatchJobToOtherHost(job);
				if ( remainingJob != null )  { // we couldn't hand this to anyone else.. deal with it...
					//console.log("no other host can do it, I can, taking it anyway...");
					job.destinationMetaData = $sis.myMetaData;
					incommingQueue.push(job);
				} else {
					//console.log("the job was assigned to someone else");
				}
				
			} else { // we're full, but there is no other option, so we'll deal with it...
				//console.log("I don't know any other hosts, so I'll add this to my growing queue of work");
				incommingQueue.push(job);
			}		
		} else {
			//console.log("this task cannot be addressed by me, dispatching to someone else...");
			///.. assign to a matching host.. or place on pending queue???
			dispatchJobToOtherHost(job);
		}
	}
	
	function receivedNotification(data) {
		//console.log("receivedNotification :" + JSON.stringify(data));
		function reconstructNotification(data) {
			//console.log("reconstructNotification");
			//console.log("data.jobGuid:" + data.jobGuid);
			//console.log("data.destinationMetaData:" + JSON.stringify(data.destinationMetaData));
			//console.log("data.payload:" + data.payload);
			var retval = new Notification(data.jobGuid, data.destinationMetaData, data.payload);
			retval.originatingMetaData = data.originatingMetaData;
			//console.log("reconstructNotification will return :" + JSON.stringify(retval));
			return retval;			
		}
		var notification = reconstructNotification(data);
		notificationQueue.push(notification);
	}

	function processNotification(notificationQueue) { 
		//console.log("processNotification");
		var notification = notificationQueue.pop();
		//console.log("recevied a notification : " + JSON.stringify(notification));
		
		if (notification.isForMe() ) {
			//console.log("signalling notification.. ");
			notificationList.signal(notification);
		}
		else {
			//console.log("convert notification to message, remove url as it wa previously marked for me");
			var msg = {
				type : messageTypeIs.NOTIFICATION,
				message : notification
			};
			msg.message.destinationMetaData.url = null;
			outgoingQueue.push(msg);
		}
	}

	function processIncomingJob(incommingQueue) {
		//console.log("processIncomingJob");
		var job = incommingQueue.pop();
		job.execute();
	}
	
	function processOutgoingItem(outgoingQueue) {
		//console.log("processOutgoingItem");
		var msg = outgoingQueue.pop();	
		//console.log("got a message to send.. ");
		//console.log("messge is for : " + JSON.stringify(msg.message.destinationMetaData));
		communicationManager.sendMessage(msg.message.destinationMetaData, msg.type, msg.message, function(success) {
			switch(success)	{
				case resultIs.OK:
				break;
				
				case resultIs.BAD:
				break;
			}
		});
	}

	$sis.NodeType = {
		"CLIENT" : 1,
		"GATEWAY" : 2,
		"SERVER" : 3
	};
	
	$sis.incommingJobThreshold = 10;
	$sis.MetaData = MetaData;
	$sis.myMetaData = new MetaData();
	$sis.myMetaData.generateNewGuid();
	
	var knownHosts = new KnownHosts();	
	var communicationManager = new CommunicationManager(receivedJob, receivedNotification, knownHosts);
	var notificationList = new NotificationList(); // list of jobs submitted and awaiting response
	var notificationQueue = new Queue(processNotification); // queue of notifications waiting to be handled.
	var incommingQueue = new Queue(processIncomingJob);
	var outgoingQueue = new Queue(processOutgoingItem);
	
	$sis.task = function(func, metadata, payload) {
		// TODO: Defensive checking of function arguments here
		var deferred = Q.defer();
		var job = new Job(func, metadata, payload, false);
		notificationList.store(job, deferred);
		processJob(job);
		return deferred.promise;
	}
	
	$sis.fireTask = function(func, metadata, payload) {
		// TODO: Defensive checking of function arguments here
		var job = new Job(func, metadata, payload, true);		
		processJob(job);
	}
	
	$sis.fireTaskToAllMatching = function(func, metadata, payload) {
		// TODO: Defensive checking of function arguments here
		knownHosts.forall(function(host){
			if ( host.subsetMatch(metadata) ) {
				var job = new Job(func, host, payload, true);
				processJob(job);
			}
		});
	}
	
	function setupSisyphus(metadata_extension, extraHosts) {
		$sis.myMetaData.extended = metadata_extension;
		var existingChangeCallback = null;
		if ( typeof(knownHosts) != 'undefined' && knownHosts != null ) {
			existingChangeCallback = knownHosts.changeCallback;
		}
		knownHosts = new KnownHosts(extraHosts);
		knownHosts.changeCallback = existingChangeCallback;
	}
	
	$sis.configureAsClient = function(metadata_extension, extraHosts, socketioclient) {
		$sis.myMetaData.nodeType = $sis.NodeType.CLIENT;
		setupSisyphus(metadata_extension, extraHosts);
		communicationManager = new CommunicationManager(receivedJob, receivedNotification, knownHosts);
		communicationManager.startConnectionsToKnownHosts(socketioclient);
	}
	
	$sis.configureAsServer = function(metadata_extension, hostURL, socketioserver) {
		$sis.myMetaData.nodeType = $sis.NodeType.SERVER;
		$sis.myMetaData.url = hostURL;
		setupSisyphus(metadata_extension);
		communicationManager = new CommunicationManager(receivedJob, receivedNotification, knownHosts);
		communicationManager.startReceivingIncomingConnections(socketioserver);
			
	}
	
	$sis.configureAsGateway = function(metadata_extension, hostURL, extraHosts, socketioserver, socketioclient) {
		$sis.myMetaData.nodeType = $sis.NodeType.GATEWAY;
		$sis.myMetaData.url = hostURL;
		setupSisyphus(metadata_extension, extraHosts);
		communicationManager = new CommunicationManager(receivedJob, receivedNotification, knownHosts);
		communicationManager.startReceivingIncomingConnections(socketioserver);
		communicationManager.startConnectionsToKnownHosts(socketioclient);
	}

	$sis.updateMyMetaData = function(extended) {
		$sis.myMetaData.extended = extended;
		knownHosts.upsert([$sis.myMetaData]);
		communicationManager.clientUpdateOfAboutmeInfo();
	}
	
	$sis.notifyOnKnownHostChanges = function(callback) {
		knownHosts.changeCallback = callback; 
	}
	
	return $sis;
}();

//console.log("checking if we need to export $sis for node.js");
var typeof_exports = typeof(exports);
if ( typeof_exports != 'undefined' ) {
	//console.log("exporting $sis here");
	//console.log("function: " + typeof($sis.configureAsGateway) + " .");
	exports.$sis = $sis;
} else {
	//console.log("not running in node.js");	
}


