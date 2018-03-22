# SERVER-SETUP-README.MD

This file explains how to setup Sisyphus and the accompanying example code.

# Copyright Notice & License
(c) Copyright 2013 Intel Performance Learning Solutions Ltd, Intel Corporation  

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at :

[http://www.apache.org/licenses/LICENSE-2.0]

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

# Version History
| Version  | Date         | Author              |  Comment              |
| ---------|--------------|---------------------|-----------------------|
| 1.0      | 14 Aug 2013  | Chris Woods (Intel) | Initial documentation |
| 1.1      | 26 Nov 2013  | Chris Woods (Intel) | Updated and revised   |
| 1.2      | 09 Dec 2013  | Chris Woods (Intel) | Prep for Release 3    |


# Cloud Requirements
Sisyphus is a software grid of client devices (running CDI), and cloud based devices running linux. The following outlines the hardware and software requirements for the cloud (server) components.

## Hardware Requirements - Server
The cloud (server) requirements for a Sisyphus is as follows:  
* RAM: 512 megs
* CPU: 1 core
* Hard Drive: 8 Gig (used 1.7G, including development tools not needed for a simply deployment)

## Software Requirements - Server
Sisyphus and the example application are node.js scripts which requires the following software components:
* Ubuntu 12.04 LTS (32bit)
* Node.js
* Socket.io
* Socket.io-client
* The "q" promise framework
* jQuery ( needed for development & example code )
* Express ( needed for development & example code )

# Software Environment Setup - Server
The following provides instructions on how to install the required software environment. These instructions should be run on an Ubuntu 12.04 LTS (32bit) based system. Thes steps are explained in detail below, and a set of shell scripts are also provided which help to automate this.

## Get Sisyphus on the Server
The exact same code base which runs on a CDI based client device, runs on the server as a server node. The code for the server can be obtained by simply obtaining a copy CDI from source forge using the following:

	git clone git://git.code.sf.net/p/connecteddeviceinterface/code connecteddeviceinterface-code

## Installing Dependencies
Sisyphus requires Node.js and Socket.io, Socket.io-client, Express and 'Q'. It is possible to install these by hand, and instructions are given below. Alternatively the git repository contains a simple script file which will do all the hard work for you: `cdi/sis/install_sisyphys_server.sh`
  
### Manual Install of node.js and dependencies

	sudo apt-get update
	sudo apt-get install python-software-properties python g++ make git
	sudo add-apt-repository ppa:chris-lea/node.js
	sudo apt-get update
	sudo apt-get install nodejs

[From github.com...Installing-Node](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

### Manual Install express:  

	sudo npm install express
	
### Manual Install socket.io:  

	sudo npm install socket.io 
	sudo npm install socket.io-client

### Manual Install 'Q' for node.js

	sudo npm install q

	
## Install thirdparty software, jQuery and Q for clients
Sisyphys relies on some third party software to be present for some of the test environments. The shell script `cdi/sis/get_thirdparty_tools.sh` will download the third party tools and setup the environment for you. Alternatively you can manually downlaod the thrid party tools using the steps below:

### Manual Install of Q, and jQuery
The test application (only) requires jQuery. Specifically it requires jQuery, and the client side (browser) version of 'Q'. Both of these can be downloaded via wget:

	wget https://s3-us-west-1.amazonaws.com/q-releases/q.min.js
	wget http://code.jquery.com/jquery-1.10.2.min.js

Some of the unit and functional test supplied with CDI rely on these files being, renamed and placed in a `thirdparty` directory. The following diagram illustrates where the `thirdparty` directory should be located:

	.
	├── connecteddeviceinterface-code
	│   ├── cdi
	│   │   ├── pds
	│   │   ├── sensors
	│   │   └── sis
	│   ├── DocumentationExamples
	│   │   └── cdi-geolocation-helloworld
	│   ├── endtoendtests
	│   ├── testing
	│   │   └── sisyphus_testing
	│   └── unit-tests
	└── thirdparty

The files should be renamed as follows:
* `q.min.js` renamed to `q.js`
* `jquery-1.10.2.min.js` renamed to `jquery.js`


## Development Installation
The shell script `cdi/sis/install_additional_development_tools.sh` will install some tools which are useful for developers working on Sisyphus, or creating applications which use Sisyphys. You can install the same packages manually using the following command: 

	sudo apt-get install chromium-browser meld vim-gtk vim kate


## Sisyphus Functional Testing
To run the Sisyphus functional tests, open a terminal and navigate to the `testing/sisyphus_testing` directory. Then execute the following command:  

	sudo node ./testapp.js

**NB**: *Note that this demo will base its self of the first IP address it can find on the system, excluding localhost. If no IP address is available it will select localhost, 127.0.0.1.*  

After Sisyphus is started the console output will contain a line explaining what IP address has been selected:  

	my local ip is being used:192.168.15.12

Using your web browser visit the IP address listed by the Sisyphus server, in the above example this is `192.168.15.12`. This should display the Sisyphus functional testing application.
