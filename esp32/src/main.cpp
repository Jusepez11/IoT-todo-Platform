#include <Arduino.h>

int result = 0;
void setup() {
  Serial.begin(115200);
}


void loop() {
  Serial.println(result);
  delay(100);
}

