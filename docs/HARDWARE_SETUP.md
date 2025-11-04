# Hardware Setup Guide

## Overview

This guide will help you set up the Arduino pulse sensor hardware for the Into My Heart project. Follow these steps carefully to ensure proper connection and calibration.

## Required Components

### Essential
- **Arduino board** (Uno, Nano, Mega, or compatible)
- **Pulse sensor** (see recommendations below)
- **USB cable** (Arduino to computer)
- **Jumper wires** (3 wires: signal, power, ground)

### Optional
- **Breadboard** (for prototyping)
- **Velcro strap or elastic band** (to secure sensor to finger)
- **0.1µF capacitor** (for noise filtering)
- **LED** (for visual beat feedback, usually built into Arduino)

## Recommended Pulse Sensors

### 1. Pulse Sensor Amped (Recommended)
- **Cost**: ~$25
- **Type**: PPG (photoplethysmography)
- **Placement**: Fingertip or earlobe
- **Features**: Built-in amplification, good documentation
- **Where to buy**: Adafruit, SparkFun, Amazon
- **Link**: https://pulsesensor.com/

**Pros**: Easy to use, reliable, extensive community support
**Cons**: More expensive than alternatives

### 2. Grove Ear-clip Heart Rate Sensor
- **Cost**: ~$15
- **Type**: PPG with ear clip
- **Placement**: Earlobe only
- **Features**: Comfortable clip design, stable readings
- **Where to buy**: Seeed Studio, Amazon

**Pros**: Hands-free operation, stable readings
**Cons**: May require Grove connector adapter

### 3. MAX30102 Heart Rate Sensor
- **Cost**: ~$5-10
- **Type**: PPG with SpO2 capability
- **Placement**: Fingertip
- **Features**: I2C interface, very accurate
- **Where to buy**: Amazon, AliExpress

**Pros**: Very affordable, accurate, includes SpO2
**Cons**: Requires different code (I2C instead of analog)

### 4. DIY Photodiode Sensor
- **Cost**: ~$5
- **Type**: Basic PPG
- **Components**: Photodiode, LED, resistors, op-amp
- **Placement**: Fingertip

**Pros**: Cheapest option, good learning experience
**Cons**: Requires circuit building, more noise

## Wiring Diagram

### Basic Pulse Sensor Connection

```
┌─────────────────┐
│  Pulse Sensor   │
├─────────────────┤
│                 │
│   [●] Signal ───┼───> A0 (Analog Pin 0)
│   [●] VCC    ───┼───> 5V or 3.3V
│   [●] GND    ───┼───> GND
│                 │
└─────────────────┘
        │
        │ USB Cable
        ↓
┌─────────────────┐
│    Computer     │
└─────────────────┘
```

### Detailed Wiring Table

| Pulse Sensor | Arduino | Wire Color (typical) |
|--------------|---------|----------------------|
| Signal (S)   | A0      | Purple/Yellow        |
| VCC (+)      | 5V      | Red                  |
| GND (-)      | GND     | Black                |

### With Noise Filtering (Optional)

```
Pulse Sensor Signal → 0.1µF Capacitor → GND
                   ↓
                   A0
```

This capacitor filters high-frequency noise for cleaner signals.

## Step-by-Step Setup

### Step 1: Identify Sensor Pins

1. Look at your pulse sensor
2. Identify the three pins/pads:
   - **Signal**: Usually labeled 'S' or 'Signal' (purple wire)
   - **VCC**: Power, labeled '+' or 'VCC' (red wire)
   - **GND**: Ground, labeled '-' or 'GND' (black wire)

### Step 2: Connect Wires

1. **Signal Pin** → Arduino **A0**
   - This carries the analog pulse signal
   - Use analog pin A0 (can be changed in code)

2. **VCC Pin** → Arduino **5V**
   - Most sensors work with 5V
   - Some sensors require 3.3V (check datasheet)
   - **Important**: Don't reverse voltage and ground!

3. **GND Pin** → Arduino **GND**
   - Any GND pin on Arduino works

### Step 3: Verify Connections

Before powering on:
- Check no wires are crossed
- Verify signal goes to A0
- Verify power goes to 5V (not 3.3V unless sensor requires it)
- Verify ground goes to GND
- Look for any loose connections

### Step 4: Upload Arduino Code

1. Open Arduino IDE
2. Open `arduino/heartbeat_sensor.ino`
3. Select your board: **Tools → Board → Arduino Uno** (or your model)
4. Select your port: **Tools → Port → /dev/cu.usbmodem...** (or COM port)
5. Click **Upload** button (→)

### Step 5: Test Connection

1. Open Serial Monitor: **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see JSON output:
   ```json
   {"bpm":0,"timestamp":1234}
   ```

If you see output, connection is successful!

## Sensor Placement

### Fingertip Placement (Most Common)

1. **Clean your finger**: Remove any lotion or dirt
2. **Position sensor**: Place sensor pad on fingertip
3. **Apply gentle pressure**: Don't squeeze too hard
4. **Secure it**: Use elastic band or medical tape
5. **Keep still**: Movement causes noise

**Best fingers**: Index or middle finger
**Avoid**: Thumb (too much movement)

### Earlobe Placement

1. **Clean earlobe**: Wipe with alcohol pad
2. **Attach clip**: If using ear-clip sensor
3. **Verify contact**: Ensure good skin contact
4. **Wait 30 seconds**: Let sensor stabilize

**Pros**: Hands-free, stable readings
**Cons**: May be uncomfortable for extended use

### Wrist Placement (Advanced)

1. **Find pulse point**: Feel for radial artery on wrist
2. **Position sensor**: Place over pulse point
3. **Secure firmly**: Use watch strap or velcro band
4. **May need sensitivity adjustment**: Wrist signals are weaker

## Calibration

### Step 1: Find Baseline Values

1. Upload code and open Serial Monitor
2. Place sensor on finger (don't squeeze)
3. **Important**: Keep very still and breathe normally
4. Observe the raw analog values scrolling by

You should see values fluctuating in a pattern:
```
Raw: 512, 515, 520, 530, 545, 540, 530, 520, 510, 505, 512...
       ↑____________↑ peak          ↑____________↑ valley
```

### Step 2: Identify Peaks and Valleys

- **Valleys** (lowest values): Blood flowing away
- **Peaks** (highest values): Blood pulse arrives

Example readings:
- Valleys: 500-510
- Peaks: 530-550
- **Range**: 50 points

### Step 3: Calculate Threshold

The threshold should be **midpoint** between peaks and valleys:

```
Threshold = (Peak + Valley) / 2
Threshold = (550 + 510) / 2 = 530
```

### Step 4: Update Code

Edit `arduino/heartbeat_sensor.ino` line 7:

```cpp
const int THRESHOLD = 530;  // Your calculated value
```

### Step 5: Test Detection

1. Re-upload code
2. Place finger on sensor
3. Watch onboard LED (pin 13)
4. LED should blink with each heartbeat

If LED doesn't blink:
- Threshold might be wrong
- Check wiring
- Try different finger placement

## Troubleshooting

### Problem: No Signal / Flat Line

**Symptoms**: All values are the same (e.g., always 512)

**Solutions**:
1. Check signal wire is connected to A0
2. Check sensor is powered (VCC to 5V)
3. Verify ground connection
4. Try different sensor (may be broken)
5. Check if sensor LED is on (if equipped)

### Problem: Erratic / Noisy Readings

**Symptoms**: Values jump randomly, no pattern

**Solutions**:
1. Keep finger and hand very still
2. Reduce ambient light (cover sensor)
3. Add 0.1µF capacitor filter
4. Use shielded wires
5. Move away from fluorescent lights
6. Increase `SAMPLE_INTERVAL` from 20ms to 50ms

### Problem: BPM Too High (e.g., 150 when resting)

**Symptoms**: Double-counting beats

**Solutions**:
1. Increase THRESHOLD value
2. Check for signal noise
3. Verify debounce time (250ms minimum)
4. Don't press sensor too hard

### Problem: BPM Too Low or Zero

**Symptoms**: Missing beats

**Solutions**:
1. Decrease THRESHOLD value
2. Ensure good skin contact
3. Warm up your hands (cold reduces signal)
4. Try different finger
5. Clean sensor surface

### Problem: Inconsistent Detection

**Symptoms**: Works then stops working

**Solutions**:
1. Secure sensor with elastic band
2. Check for loose wires
3. Verify USB cable quality
4. Keep hand elevated at heart level
5. Reduce movement

### Problem: No USB Connection

**Symptoms**: Arduino IDE can't find port

**Solutions**:
1. Check USB cable (try different cable)
2. Install Arduino drivers
3. Try different USB port
4. On Linux: `sudo chmod 666 /dev/ttyACM0`
5. On Linux: Add user to dialout group

## Advanced Configuration

### Fine-Tuning Detection

```cpp
// In heartbeat_sensor.ino

const int THRESHOLD = 550;        // Detection threshold
const int SAMPLE_INTERVAL = 20;   // Sampling rate (ms)
const int MIN_BPM = 40;           // Minimum valid BPM
const int MAX_BPM = 200;          // Maximum valid BPM
const int DEBOUNCE_TIME = 250;    // Min time between beats (ms)
```

### Adding Signal Smoothing

```cpp
// Simple moving average
const int SMOOTHING = 5;
int readings[SMOOTHING];
int readIndex = 0;
int total = 0;
int average = 0;

void loop() {
  total = total - readings[readIndex];
  readings[readIndex] = analogRead(PULSE_SENSOR_PIN);
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % SMOOTHING;
  average = total / SMOOTHING;

  // Use 'average' instead of raw signal
}
```

### Using Different Pin

```cpp
// Change from A0 to A1
const int PULSE_SENSOR_PIN = A1;  // Use analog pin 1
```

## Power Considerations

### USB Power
- **Sufficient for**: Most sensors
- **Voltage**: 5V regulated
- **Current**: Up to 500mA
- **Pros**: Simple, no extra hardware
- **Cons**: Tethered to computer

### External Battery
- **Use**: 9V battery or USB power bank
- **Voltage**: 7-12V input to Arduino
- **Pros**: Portable, untethered
- **Cons**: Need to manage battery

### Power Consumption
- Arduino: ~50mA
- Pulse sensor: ~5-20mA
- **Total**: ~70mA (very low)
- **9V battery**: Lasts ~6 hours
- **USB power bank**: Lasts many hours

## Safety Notes

**Important Safety Information**

- This is for **educational purposes only**
- **Not a medical device**
- Do not use for diagnosis or treatment
- Do not rely on readings for medical decisions
- Consult healthcare provider for medical concerns
- Verify all connections before powering on
- Do not operate near water
- Use proper voltage (5V or 3.3V as specified)
- Do not modify while powered on

## Testing Without Sensor

### Method 1: Potentiometer Simulation

1. Connect potentiometer to A0
2. Turn knob rhythmically (1-2 times per second)
3. System will detect "heartbeats"

### Method 2: Code Simulation

```cpp
// In Arduino code, replace analogRead with:
int simulatedBPM = 75;
unsigned long beatInterval = 60000 / simulatedBPM;

if (millis() - lastSendTime > beatInterval) {
  Serial.print("{\"bpm\":");
  Serial.print(simulatedBPM);
  Serial.print(",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");
  lastSendTime = millis();
}
```

## Next Steps

After successful hardware setup:

1. Verify sensor readings in Serial Monitor
2. Calibrate threshold for your sensor
3. Test with simulation mode in web app
4. Connect to web app via WebSocket
5. Enjoy real-time 3D heart visualization!

For software setup, see the main [README.md](../README.md).

For API documentation, see [API.md](API.md).
