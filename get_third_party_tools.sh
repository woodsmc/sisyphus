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


###############################################################################
# (c) Copyright 2013 Intel Performance Learning Solutions Ltd, Intel Corporation
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
	print "Getting third party libraries not checked into git"
	print "=================================================="
}

print_title
step "Step 1: creating thirdparty directory..."
mkdir -p thirdparty
pushd thirdparty
step_done

step "Step 2: getting Q..."
wget https://s3-us-west-1.amazonaws.com/q-releases/q.min.js
mv q.min.js ./q.js
step_done

step "Step 3: getting jquery version 1.10.2..."
wget http://code.jquery.com/jquery-1.10.2.min.js
mv ./jquery-1.10.2.min.js ./jquery.js
step_done

# Not needed for demo purposes
# step "Step 4: getting testharness.js from githib"
# git clone https://github.com/jgraham/testharness.js.git
# step_done

echo -e "\e[36mComplete\e[0m"
