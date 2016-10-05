// Libmraa is a C/C++ library with bindings to Java, Python and JavaScript
// to interface with the IO on Galileo, Edison & other platforms, 
// with a structured and sane API where port names/numbering matches the board that you are on.
var mraa = require('mraa');
// Hitachi HD44780 LCD driver for Linux boards
var lcd = require('./lcd');

var version = mraa.getVersion();
var display = new lcd.LCD(0);
// mqtt is a client library for the MQTT protocol, written in JavaScript for node.js and the browser.
var mqtt = require('mqtt');
// Node implements File I/O using simple wrappers around standard POSIX functions. 
// The Node File System (fs) module is imported using the following line
var fs = require('fs');
// mqtt connection endpoint is define in ARTIK Cloud documantation page
var PROTOCOL = 'mqtts';
var BROKER ='api.artik.cloud';
var PORT = 8883;

var URL = PROTOCOL + '://' + BROKER;
URL += ':' + PORT;
// device id and device token is used for authentication 
var deviceID = '4368e28eb8db4adfa368e5e0120932fa';
var deviceTOKEN = '655eac98350f42858e7df90cd270550a';
// use device id as username & device token as password
var requireds = { username: deviceID, password: deviceTOKEN };
var mqttConfig = { 'url': URL, 'requireds': requireds };
// Connects to the broker specified by the given url and options and returns a Client.
var client = mqtt.connect(mqttConfig.url, mqttConfig.requireds);
// topic for client
var pubTOPIC = '/v1.1/messages/'+deviceID;
// topic for subscriber
var subTOPIC = '/v1.1/actions/'+deviceID;

if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') ok');
}
else {
    console.log('meaa version(' + version + ') is old - this code may not work');
}

// Emitted automatically on successful connection 
client.on('connect', function () {
  console.log('connected');
  // set backlight color for RGB lcd
  display.setColor(255, 255, 255);
  display.setCursor(0,0);
  display.write('Connected');
  // subscribe to the topic
  client.subscribe(subTOPIC);  
});

// Emitted when the client receives a publish packet 
// topic is topic of the received packet
// message payload of the received packet
client.on('message', function (topic, message) {
  // message is Buffer 
  // parses the received string as JSON
  var msgObj = JSON.parse(message);
  var rainbowData = msgObj.actions[0].parameters.text; 
  var indigoData = msgObj.actions[0].parameters.text2; 
  // the values then print to lcd display
  display.setCursor(0,0);
  display.write('RainbowFSlot: '+rainbowData); 
  display.setCursor(1,0);
  display.write('IndigoFrSlot: '+indigoData); 
  console.log(rainbowData);
  console.log(message.toString())
  //client.end()
});