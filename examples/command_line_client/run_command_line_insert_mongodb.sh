#!/bin/bash

###############################################################################
# (c) Copyright 2018 Mind-Flip Limited
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not 
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
################################################################################


function print {
	echo -e "\e[36m$1\e[0m"
}

function print_green {
	echo -e "\e[92m$1\e[0m"
}



function step {
	LAST_STEP="$1"
	print "$1"
}

function step_done {
	print_green "$LAST_STEP finished."
}

function print_title {
	print "Running Sisyphus Distributed Compute as Gateway"
	print "=================================================="
	print "Notes:"
	print "  * Running 'nodejs' (based on Ubuntu)."
	print "Please ensure that the installation steps outlined"
	print "in the readme.md file within the 'sis' directory "
	print "have been followed. "
}

print_title

nodejs ./command_line_insert_mongodb.js

