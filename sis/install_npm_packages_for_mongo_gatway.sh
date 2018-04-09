#!/bin/bash

function print {
	echo -e "\e[36m$1\e[0m"
}

print "Install express" 
npm install express --save
print "Install socket.io"
npm install socket.io --save
npm install socket.io-client --save
print "Installing Q, for node"
npm install q --save

print "Adding MongoDB"
npm install mongodb 

