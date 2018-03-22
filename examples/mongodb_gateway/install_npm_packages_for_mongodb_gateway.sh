#!/bin/bash

function print {
	echo -e "\e[36m$1\e[0m"
}

print "Install express" 
sudo npm install express
print "Install socket.io"
sudo npm install socket.io
sudo npm install socket.io-client
print "Installing Q, for node"
sudo npm install q
print "Installing mongodb for node"
sudo npm install mongodb

