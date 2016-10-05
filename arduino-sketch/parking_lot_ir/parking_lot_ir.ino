int irSensor1=0;
int irSensor2=0;
int irSensor3=0;
int irSensor4=0;
int irSensor = 0; // total sensor value
int total_car = 0;
int freeSlot = 0;
const int totalSlot = 4;

void setup() {
 Serial.begin(9600);
}

void loop() {
  // ir sensor value read as analog, maximum value can be 1024
  // value depends on the distance of obstacle
  irSensor1 = analogRead(A0);
  irSensor2 = analogRead(A1);
  irSensor3 = analogRead(A2);
  irSensor4 = analogRead(A3);
  // all four sensors values are added here to take decision easily 
  irSensor = irSensor1 + irSensor2 + irSensor3 + irSensor4;
  // these value may vary for your case
  // uncomment following line to check the value in terminal
  // Serial.println("total value = " +irSensor);
  if(irSensor>2700 && irSensor<3200)
      total_car = 1;
  if(irSensor>1900 && irSensor<2700)
      total_car = 2;
  if(irSensor>1200 && irSensor<1900)
      total_car = 3;
  if(irSensor>10 && irSensor<1200)
      total_car = 4;
  // total free slot can find from (total slotlot - total car)  
  freeSlot = totalSlot - total_car; 
  // number of free slot then sent to raspberry pi
  Serial.println(freeSlot);
  // update the value every 30 seconds
  delay(30000);
  total_car = 0;
  irSensor = 0;
}
