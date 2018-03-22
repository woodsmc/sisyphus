# Setting up the Sisyphus Server Environment

This file explains how to setup Sisyphus and the accompanying example code.

# Version History
| Version | Date        | Author              | Comment               |
| ------- | ----------- | ------------------- | --------------------- |
| 1.0     | 14 Aug 2013 | Chris Woods (Intel) | Initial documentation |
| 1.1     | 26 Nov 2013 | Chris Woods (Intel) | Updated and revised   |
| 1.2     | 09 Dec 2013 | Chris Woods (Intel) | Prep for Release 3    |
| 2.0     | 21 Mar 29   |                     |                       |


# Requirements

## Hardware Requirements - Server
The cloud (server) requirements for a Sisyphus is as follows:  
* RAM: 512 megs
* CPU: 1 core
* Hard Drive: 8 Gig (used 1.7G, including development tools not needed for a simply deployment)

## Software Requirements - Server
Sisyphus and the example application are node.js scripts which requires the following software components:
* Ubuntu 12.04 LTS (32bit) or better
* Node.js
* Socket.io
* Socket.io-client
* The "q" promise framework
* jQuery ( needed for development & example code )
* Express ( needed for development & example code )

# Software Environment Setup - Server
The following provides instructions on how to install the required software environment. These instructions should be run on an Ubuntu 12.04 LTS (32bit) based system. Thes steps are explained in detail below, and a set of shell scripts are also provided which help to automate this.

## Node.js
This guide assumes that you have installed node.js on your server. It is typically available via most distributions package management solutions. Alternatively [a guide is available from joyent's git repository here.](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager). A full node.js installation guide is out of scope of this document.

## Installing NPM Dependencies
Sisyphus requires Socket.io, Socket.io-client, Express and 'Q'. It is possible to install these by hand, and instructions are given below. You can install the additional npm modules by executing the `sis/install_npm_packages.sh` script.

## Install thirdparty software, jQuery and Q for clients
Sisyphys relies on some third party software to be present for some of the test environments. The shell script `get_thirdparty_tools.sh` will download the third party tools and place them in a  `thirdparty` directory.


# Copyright Notice & License

## Mind-Flip Limited
(c) Copyright 2018 Mind-Flip Limited
Based on the original content from Intel (see below).

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at :

[http://www.apache.org/licenses/LICENSE-2.0]

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and  
limitations under the License.  

## Intel Performance Learning Solutions Ltd
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
