//rainbow parking data transfer
var webSocketUrl = "wss://api.artik.cloud/v1.1/websocket?ack=true";
var device_id = "Your Device ID Here"; // Rainbow parking DEVICE ID
var device_token = "Your Device Token Here"; //Rainbow parking DEVICE TOKEN
// require websocket module to connect 
// execute following two commands to your pi's terminal
// sudo apt-get update
// npm install websocket
var WebSocket = require('ws');
var isWebSocketReady = false;
var data="";
var ws = null;
// require serialport module to raspberry pi 
// execute following command to terminal
// npm install serialport
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var sp = new SerialPort("/dev/ttyACM0", { //for serial communication with arduino 
    baudrate: 9600,  
// we are using UNO so baudrate is 9600, you might need to change according to your model
    parser: serialport.parsers.readline("\n")
});

var parking_state=0;// variable to check for parking state_gate

/**
 * Gets the current time in millis
 */
function getTimeMillis(){
    return parseInt(Date.now().toString());
}

/**
 * Create a /websocket connection and setup GPIO pin
 */
function start() {
    //Create the WebSocket connection
    isWebSocketReady = false;
    ws = new WebSocket(webSocketUrl);
	// this function invoked on successful connection
    ws.on('open', function() {
        console.log("WebSocket connection is open ....");
		// you must register for successful data transmission
		// registration is for authentication or secure data transfer
        register();
    });
    ws.on('message', function(data) {
      //this loop is called whenever the client sends some message
         handleRcvMsg(data); //data is send to the function handleRcvMsg()
    });
    ws.on('close', function() {
        console.log("WebSocket connection is closed ....");

    });      
    
}

/**
 * Sends a register message to /websocket endpoint
 */
//Client will only work when device gets registered from here
function register(){
    console.log("Registering device on the WebSocket connection");
    try{
        var registerMessage = '{"type":"register", "sdid":"'+device_id+'", "Authorization":"bearer '+device_token+'", "cid":"'+getTimeMillis()+'"}';
        console.log('Sending register message ' + registerMessage + '\n');
        ws.send(registerMessage, {mask: true});
        isWebSocketReady = true;
    }
    catch (e) {
        console.error('Failed to register messages. Error in registering message: ' + e.toString());
    }    
}


//data after receiving is sent here for processing
// in our case this function will not be used as we will not receive any action
// in raspberry pi. This is for future modification.
function handleRcvMsg(msg){
	// you have to parse the received string
    var msgObj = JSON.parse(msg);
    if (msgObj.type != "action") return; //Early return;

    var actions = msgObj.data.actions;
    var actionName = actions[0].name; 
    console.log("The received action is " + actionName);
  
    //you must know your registered actions in order to perform accordinlgy
    if (actionName.toLowerCase() == "parking_state") 
    { 
        // do something here after receiving 'parking_state'
    }
    else {
         //this loop executes if some unregistered action is received
         //so you must register every action in cloud
        console.log('Do nothing since receiving unrecognized action ' + actionName);
        return;
    }
   
}



/**
 * Send one message to ARTIK Cloud
 */
//This function is responsible for sending commands to cloud
//function sendStateToArtikCloud(parking) sends number of free parking slot to artik cloud
function sendStateToArtikCloud(parking){
    try{
        ts = ', "ts": '+getTimeMillis();
        var data = {
            "rainbowlot": parking
            //setting the parking value from argument to our cloud variable "parking_value"

            };
        var payload = '{"sdid":"'+device_id+'"'+ts+', "data": '+JSON.stringify(data)+', "cid":"'+getTimeMillis()+'"}';
        console.log('Sending payload ' + payload + '\n');
        ws.send(payload, {mask: true});
    } catch (e) {
        console.error('Error in sending a message: ' + e.toString() +'\n');
    }    
}



function exitClosePins() {
    
        console.log('Exit and destroy all pins!');
        process.exit();
    
}


start();
//exectes every time when data is received from arduino (30 sec programmed delay from arduino)
sp.on("open", function () {
    sp.on('data', function(data) {
            console.log("Serial port received data:" + data);
            //sendStateToArtikCloud(data);//free parking slot
            sendStateToArtikCloud(data);
           
    });
});

process.on('SIGINT', exitClosePins);
