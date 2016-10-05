// real-time interactions are possible using websocket
// Notice the ws:. This is the new URL schema for WebSocket connections. 
// There is also wss: for secure WebSocket connection the same way 
// https: is used for secure HTTP connections.
// you can get it from Artik cloud documentation page
var wsUri = "wss://api.artik.cloud/v1.1/websocket?ack=true";
var device_id = "YOUR DEVICE ID HERE"; // Edison parking DEVICE ID
var device_token = "YOUR DEVICE TOKEN HERE"; //Intel Edison parking DEVICE TOKEN

var output;
var attributes_log;
var websocket;

function init() {
	// document.getElementById() write something to html page
    output = document.getElementById("output");
    attributes_log = document.getElementById("attributes_log");
    if (browserSupportsWebSockets() === false) {
		// check browser support websocket protocol or not
        writeToScreen("Sorry! your web browser does not support WebSockets. Try using Google Chrome or Firefox Latest Versions");

        var element = document.getElementById("websocketelements");
        element.parentNode.removeChild(element);

        return; //
    }
    //You open up a WebSocket connection simply by calling the WebSocket constructor
    websocket = new WebSocket(wsUri);
    //When the connection is open, function invoked automatically
    websocket.onopen = function() {		
        //writeAttributeValues('onOpen Event Fired');
        writeToScreen("Successfully connected to Parking System");
		// after connection is open, registration is required for secure data transmission
		register();
    };
    // invoked when new message received
    websocket.onmessage = function(evt) {
        onMessage(evt);
    };
    // when received error
	// You can handle any errors that occur by listening out for the error event.
    websocket.onerror = function(evt) {
        onError(evt);
    };
}

function onClose(evt) {
	// Once you’re done with your WebSocket you can terminate the connection using the close() method.
    websocket.close();
    //writeAttributeValues('onClose Event Fired');
    writeToScreen("DISCONNECTED");
}

// When a message is received the message event is fired. 
function onMessage(evt) {
    writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data + '</span>');
    //writeAttributeValues('onMessage Event Fired');
	handleRcvMsg(evt.data); //data is send to the function handleRcvMsg()
}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    //writeAttributeValues('onError Event Fired');
}

function doSend(message) {
	// To send a message through the WebSocket connection you call the send() method on your WebSocket instance
    websocket.send(message);
    //writeAttributeValues('onSend Event Fired');
    writeToScreen("SENT: " + message);
}

function writeAttributeValues(prefix) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = "INFO " + getCurrentDate() + " " + prefix + "<b> readyState: " + websocket.readyState + " bufferedAmount: " + websocket.bufferedAmount + "</b>";
    ;
    attributes_log.appendChild(pre);
}

function writeToScreen(message) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

function getCurrentDate() {
    var now = new Date();
    var datetime = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
    datetime += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    return datetime;
}

function browserSupportsWebSockets() {
    if ("WebSocket" in window)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function getTimeMillis(){
    return parseInt(Date.now().toString());
}

function register(){
    writeToScreen("Registering device on the WebSocket connection");
    try{
        var registerMessage = '{"type":"register", "sdid":"'+device_id+'", "Authorization":"bearer '+device_token+'", "cid":"'+getTimeMillis()+'"}';
        writeToScreen('Sending register message ' + registerMessage + '\n');
        websocket.send(registerMessage, {mask: true});
        isWebSocketReady = true;
		//document.getElementById("rainbow").innerHTML = "";
		//document.getElementById("rainbow").innerHTML = "Capacity:"+'<span style="color: red;">50</span> '+"Free Slot:"+'<span style="color: red;"></span>'+"50";
        //document.getElementById("indigo").innerHTML = "Capacity: 60,  Free Slot: 5";
	}
    catch (e) {
        writeToScreen('Failed to register messages. Error in registering message: ' + e.toString());
    }    
}

//data after receiving is sent here for processing
function handleRcvMsg(msg){
	// message is received as following string
	// {"actions":[{"name":"setText","parameters":{"text":"4", "text2": "5"}}]}
	// you have to parse it
    var msgObj = JSON.parse(msg);
    if (msgObj.type != "action") return; //Early return;

    var actions = msgObj.data.actions;
    var rainbowData = actions[0].parameters.text; 
	var indigoData = actions[0].parameters.text2; 
    console.log("The received action is " + actions);  
	document.getElementById("rainbow").innerHTML = "Capacity: 50,  Free Slot: "+rainbowData;
	document.getElementById("indigo").innerHTML = "Capacity: 60,  Free Slot: "+indigoData;
   
}