/*
 * Heart pulse sensor with Arduino
 * MAXIMUM smoothing and adaptive filtering
 * Works with OLED display AND web app
 */

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display = Adafruit_SSD1306(128, 64, &Wire);

#define sensor A0
#define LED_PIN 13

int sX = 0;
int sY = 60;
int x = 0;
int Svalue;
int value;
int BPM = 0;
unsigned long lastBeatTime = 0;
unsigned long lastDebugTime = 0;

// Balanced smoothing for noise reduction and responsiveness
const int SMOOTH_SIZE = 8;
int smoothBuffer[SMOOTH_SIZE];
int smoothIndex = 0;
int smoothed = 0;

// BPM averaging - track last 6 beat intervals for smoother display
const int BPM_AVERAGE_SIZE = 6;
int bpmHistory[BPM_AVERAGE_SIZE];
int bpmHistoryIndex = 0;
int bpmHistoryCount = 0;

// Adaptive threshold
int runningMax = 0;
int runningMin = 1023;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  delay(1000);
  display.clearDisplay();

  // Initialize smoothing
  for (int i = 0; i < SMOOTH_SIZE; i++) {
    smoothBuffer[i] = 512;
  }

  // Initialize BPM history
  for (int i = 0; i < BPM_AVERAGE_SIZE; i++) {
    bpmHistory[i] = 0;
  }
}

void loop() {
  // Read sensor
  Svalue = analogRead(sensor);

  // Add to smoothing buffer
  smoothBuffer[smoothIndex] = Svalue;
  smoothIndex = (smoothIndex + 1) % SMOOTH_SIZE;

  // Calculate heavily smoothed average
  long sum = 0;
  for (int i = 0; i < SMOOTH_SIZE; i++) {
    sum += smoothBuffer[i];
  }
  smoothed = sum / SMOOTH_SIZE;

  // Very fast-moving min/max tracking for better beat detection
  if (smoothed > runningMax) {
    runningMax = smoothed;
  } else {
    runningMax = runningMax * 0.9 + smoothed * 0.1; // Decay very fast
  }

  if (smoothed < runningMin) {
    runningMin = smoothed;
  } else {
    runningMin = runningMin * 0.9 + smoothed * 0.1; // Decay very fast
  }

  // Calculate threshold
  int threshold = (runningMax + runningMin) / 2;
  int signalRange = runningMax - runningMin;

  // Require minimum signal strength - if range is too small, no finger is present
  const int MIN_SIGNAL_RANGE = 40; // Lowered to catch weaker beats

  static bool lastAboveThreshold = false;
  static unsigned long lastBeatDecayTime = 0;

  // Only detect beats if we have a strong enough signal
  if (signalRange >= MIN_SIGNAL_RANGE) {
    // Simple threshold crossing at midpoint
    bool currentAboveThreshold = (smoothed > threshold);

    // Detect rising edge (crossing threshold going up)
    if (currentAboveThreshold && !lastAboveThreshold) {
      unsigned long currentTime = millis();
      unsigned long timeSinceLastBeat = currentTime - lastBeatTime;

      // Valid heartbeat timing (600ms to 1400ms = 43-100 BPM)
      // Tighter range to filter out false detections
      if (timeSinceLastBeat > 600 && timeSinceLastBeat < 1400) {
        int newBPM = 60000 / timeSinceLastBeat;

        // Realistic BPM range
        if (newBPM >= 50 && newBPM <= 110) {
          // Add to BPM history for averaging
          bpmHistory[bpmHistoryIndex] = newBPM;
          bpmHistoryIndex = (bpmHistoryIndex + 1) % BPM_AVERAGE_SIZE;
          if (bpmHistoryCount < BPM_AVERAGE_SIZE) {
            bpmHistoryCount++;
          }

          // Calculate average BPM from history
          long bpmSum = 0;
          for (int i = 0; i < bpmHistoryCount; i++) {
            bpmSum += bpmHistory[i];
          }
          BPM = bpmSum / bpmHistoryCount;

          lastBeatTime = currentTime;
          lastBeatDecayTime = currentTime;
          digitalWrite(LED_PIN, HIGH);

          // Send JSON for web app
          Serial.print("{\"bpm\":");
          Serial.print(BPM);
          Serial.print(",\"timestamp\":");
          Serial.print(currentTime);
          Serial.print(",\"raw\":");
          Serial.print(smoothed);
          Serial.println("}");

          delay(100);
          digitalWrite(LED_PIN, LOW);
        }
      } else if (timeSinceLastBeat >= 1400) {
        // First beat or reset after long pause
        lastBeatTime = currentTime;
        lastBeatDecayTime = currentTime;
      }
    }
    lastAboveThreshold = currentAboveThreshold;
  } else {
    // No finger detected - reset BPM after 3 seconds
    if (millis() - lastBeatDecayTime > 3000) {
      BPM = 0;
      bpmHistoryCount = 0; // Reset history
    }
    lastAboveThreshold = false;
  }

  // Debug output
  if (millis() - lastDebugTime > 1000) {
    Serial.print("Smooth:");
    Serial.print(smoothed);
    Serial.print(" Min:");
    Serial.print((int)runningMin);
    Serial.print(" Max:");
    Serial.print((int)runningMax);
    Serial.print(" Thresh:");
    Serial.print(threshold);
    Serial.print(" Range:");
    Serial.println(signalRange);
    lastDebugTime = millis();
  }

  // Map for OLED waveform
  value = map(smoothed, 0, 1024, 0, 45);
  int y = 60 - value;

  if (x > 128) {
    x = 0;
    sX = 0;
    display.clearDisplay();
  }

  // Draw waveform
  display.drawLine(sX, sY, x, y, WHITE);
  sX = x;
  sY = y;
  x++;

  // Display on OLED
  display.setCursor(0, 0);
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE, SSD1306_BLACK);
  display.print("BPM:");
  display.print(BPM);
  display.println("  ");
  display.setTextSize(1);
  display.print("S:");
  display.print(smoothed);
  display.print(" R:");
  display.print(signalRange);
  display.display();

  delay(10);
}
