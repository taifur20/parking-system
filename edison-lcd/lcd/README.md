Demonstration of code to drive an LCD
=====================================

This example drives a JHD1313m1 LCD as found in the Grive Starter Kit. This connects
to an i2c buss.

The code can be used in either of two ways. By default, it will use the upm module. This
is much the simpler way to drive a upm supported device. 

By commenting out the call to the upm code and uncommenting the useLcd call, you can also
drive the device directly using the lcd module. The purpose of this is to demonstrate 
driving the i2c buss directly from Javascript. Notice that we need delays between some
of the bus transactions. There is no direct equivalent to "wait" in Javascript. Instead
we have to set up a callback on a timer. So lcd.js creates a queue driven execution
engine for i2c devices.

The advantage of this is that you can do other things while waiting for the buss to respond. 
For some applications this may be important but for most, the blocking waits used by upm will
not cause problems.


Intel(R) XDK
-------------------------------------------
This template is part of the Intel(R) XDK IoT Edition.
Download the Intel(R) XDK at http://software.intel.com/en-us/html5. To see the technical details of the sample,
please visit the sample article page at https://software.intel.com/en-us/xdk-sample-creating-lcd-display-app.


Important App Files
---------------------------
* main.js
* lcd.js
* package.json
* README.md

License Information Follows
---------------------------
Copyright (c) 2015, Intel Corporation. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

- Neither the name of Intel Corporation nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

mraa
--------------------------------------------
* Included on the IoTDevkit Linux Image

* source:  https://github.com/intel-iot-devkit/mraa
* license:  https://github.com/intel-iot-devkit/mraa/blob/9d488c8e869e59e1dff2c68218a8f38e9b959cd7/cmake/modules/LICENSE_1_0.txt

upm
--------------------------------------------
* Included on the IoTDevkit Linux Image

* source: https://github.com/intel-iot-devkit/upm
* license: https://github.com/intel-iot-devkit/upm/LICENSE
