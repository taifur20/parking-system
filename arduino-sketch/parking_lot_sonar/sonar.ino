#define echoPin1 2 // Echo Pin for sonar 1
#define trigPin1 3 // Trigger Pin for sonar 1
#define echoPin2 4 // Echo Pin for sonar 2 
#define trigPin2 5 // Trigger Pin for sonar 2
#define echoPin3 6 // Echo Pin for sonar 3
#define trigPin3 7 // Trigger Pin for sonar 3
#define echoPin4 9 // Echo Pin for sonar 4
#define trigPin4 8 // Trigger Pin for sonar 4


long duration1, distance1; // Duration used to calculate distance
long duration2, distance2;
long duration3, distance3;
long duration4, distance4; 

int count=0;
int freeSlot =0;

void setup() {
 Serial.begin (9600); // initiate serial communication to raspberry pi
 pinMode(trigPin1, OUTPUT); // trigger pin as output
 pinMode(echoPin1, INPUT);  // echo pin as input
 pinMode(trigPin2, OUTPUT);
 pinMode(echoPin2, INPUT);
 pinMode(trigPin3, OUTPUT);
 pinMode(echoPin3, INPUT);
 pinMode(trigPin4, OUTPUT);
 pinMode(echoPin4, INPUT);
 
}

void loop() {
/* The following trigPin/echoPin cycle is used to determine the
 distance of the nearest object by bouncing soundwaves off of it. */ 

/* At least 10 microsecond high level signal is required to trigger 
 * pin. 
 *               _____
 *              |     |
 * -------------!     !---------
 *         .....|10us |........
 * the module then produce eight 40KHz pulse signal and waits to receive echo
 */
 digitalWrite(trigPin1, LOW); 
 delayMicroseconds(2); 
 digitalWrite(trigPin1, HIGH);
 delayMicroseconds(10); 
 digitalWrite(trigPin1, LOW);
 // pulseIn( ) function determines a pulse width in time
 // duration of pulse is proportional to distance of obstacle
 duration1 = pulseIn(echoPin1, HIGH);

 digitalWrite(trigPin2, LOW);
 delayMicroseconds(2); 
 digitalWrite(trigPin2, HIGH);
 delayMicroseconds(10); 
 digitalWrite(trigPin2, LOW);
 duration2 = pulseIn(echoPin2, HIGH);
 
 digitalWrite(trigPin3, LOW);
 delayMicroseconds(2); 
 digitalWrite(trigPin3, HIGH);
 delayMicroseconds(10); 
 digitalWrite(trigPin3, LOW);
 duration3 = pulseIn(echoPin3, HIGH);

 digitalWrite(trigPin4, LOW);
 delayMicroseconds(2); 
 digitalWrite(trigPin4, HIGH);
 delayMicroseconds(10); 
 digitalWrite(trigPin4, LOW);
 duration4 = pulseIn(echoPin4, HIGH);
 
 //  distance = (high level time×velocity of sound (340M/S) / 2, 
 //  in centimeter = uS/58
 distance1 = duration1/58.2;
 if(distance1<10)
   distance1 = 1;
 else distance1 = 0;
 
 distance2 = duration2/58.2;
 if(distance2<10)
   distance2 = 1;
 else distance2 = 0;
 
 distance3 = duration3/58.2;
 if(distance3<10)
   distance3 = 1;
 else distance3 = 0;

 distance4 = duration4/58.2;
 if(distance4<10)
   distance4 = 1;
 else distance4 = 0;

 // add the result from all sensor to count total car
 count = distance1 + distance2 + distance3 + distance4;;

 // free slot = total slot - total car
 freeSlot = 4 - count;
 // number of total slot is sent to raspberry pi using usb
 Serial.println(freeSlot);
 // the status is updated every 30 seconds.
 delay(30000);
 freeSlot = 0;
 distance1 = 0;
 distance2 = 0;
 distance3 = 0;
 distance4 = 0;
}
