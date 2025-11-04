# Quick Start Guide

Get up and running with Into My Heart in 5 minutes!

## Prerequisites

- Node.js v16 or higher
- Modern web browser (Chrome, Firefox, Edge)
- Arduino IDE (if using hardware sensor)

## Option 1: Software Only (Simulation Mode)

**Perfect for**: Testing the visualization without hardware

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Open Browser

Open http://localhost:5173 (or the port shown in terminal)

### 4. Start Simulation

Click the **"Simulate Heartbeat"** button

**Done!** You should see a 3D heart beating at ~75 BPM

### Controls
- **Mouse drag**: Rotate heart
- **Mouse wheel**: Zoom in/out
- **Right-click drag**: Pan camera
- **Simulate button**: Toggle simulation on/off
- **Reset button**: Reset camera view

---

## Option 2: With Arduino Sensor

**Perfect for**: Real-time heartbeat visualization from your pulse

### 1. Hardware Setup (5 minutes)

Connect pulse sensor to Arduino:

```
Pulse Sensor → Arduino
─────────────────────
Signal → A0
VCC    → 5V
GND    → GND
```

### 2. Upload Arduino Code (2 minutes)

1. Open Arduino IDE
2. Open `arduino/heartbeat_sensor.ino`
3. Select your board and port in **Tools** menu
4. Click **Upload** (→ button)
5. Open **Serial Monitor** (set to 115200 baud)
6. You should see: `{"bpm":0,"timestamp":...}`

### 3. Calibrate Sensor (2 minutes)

1. Place sensor on fingertip
2. Watch Serial Monitor values
3. Note the high and low values
4. Calculate: `THRESHOLD = (high + low) / 2`
5. Update line 7 in `heartbeat_sensor.ino`:
   ```cpp
   const int THRESHOLD = 550; // Your calculated value
   ```
6. Re-upload code

### 4. Configure Serial Port (1 minute)

Edit `web/server.js` line 51:

```javascript
const SERIAL_PORT_PATH = '/dev/cu.usbmodem1101'; // Your Arduino port
```

**Find your port**:
- Mac: `/dev/cu.usbmodem*`
- Windows: `COM3`, `COM4`, etc.
- Linux: `/dev/ttyACM0`

### 5. Install Web Dependencies

```bash
cd web
npm install
```

### 6. Start Backend Server

```bash
npm run server
```

You should see:
```
HTTP Server running on http://localhost:3001
WebSocket server running on ws://localhost:8080
Serial port /dev/cu.usbmodem1101 opened
```

### 7. Start Frontend (New Terminal)

```bash
npm run dev
```

### 8. Open Browser

Open http://localhost:5173

**Done!** Your heart should now beat in sync with your pulse!

---

## Troubleshooting

### "Port already in use"

```bash
# Use different port
PORT=3002 npm run server
```

### "Serial port error"

1. Check Arduino is connected via USB
2. Verify port path in `server.js`
3. On Linux: `sudo chmod 666 /dev/ttyACM0`

### Heart not beating

1. Check browser console (F12) for errors
2. Verify WebSocket connection (should show "Connected")
3. Try simulation mode to test visualization

### Heart too small

1. Open `web/src/components/Heart.js`
2. Line 72: Increase scale: `object.scale.set(0.7, 0.7, 0.7)`

### Can't see Arduino port

```bash
# List ports
ls /dev/cu.*        # Mac
ls /dev/tty*        # Linux
# Check Device Manager on Windows
```

---

## Project Structure

```
IntoMyHeart/
├── arduino/
│   └── heartbeat_sensor.ino    # Upload this to Arduino
├── web/
│   ├── src/
│   │   ├── components/Heart.js # 3D heart component
│   │   └── main.js             # Main app
│   ├── server.js               # Backend server
│   └── index.html              # UI
└── docs/                       # Documentation
```

---

## What's Next?

### Customize Your Heart

- [Change heart size](../README.md#adjust-heart-size)
- [Adjust beat strength](../README.md#adjust-beat-animation-strength)
- [Modify camera view](../README.md#adjust-camera-distance)

### Learn More

- [Full Setup Guide](../README.md)
- [Hardware Documentation](HARDWARE_SETUP.md)
- [API Reference](API.md)

### Need Help?

- Check [Troubleshooting](../README.md#troubleshooting) in README
- Review [Hardware Setup Guide](HARDWARE_SETUP.md) for sensor issues
- Open an issue on GitHub

---

## Commands Reference

### Development

```bash
cd web
npm run dev          # Start frontend dev server
npm run server       # Start backend + WebSocket server
npm run build        # Build for production
```

### Custom Ports

```bash
PORT=3002 npm run server           # HTTP port
WS_PORT=8081 npm run server        # WebSocket port
PORT=3002 WS_PORT=8081 npm run server  # Both
```

---

## Quick Tips

- **Test first**: Use simulation mode before connecting hardware
- **Keep still**: Movement affects sensor readings
- **Good contact**: Ensure sensor touches skin properly
- **Warm hands**: Cold fingers give weaker signals
- **Check console**: Browser console (F12) shows helpful errors

---

## Minimum Example (No Arduino)

Want to see it work right now?

```bash
cd web
npm install
npm run dev
```

Open browser → Click "Simulate Heartbeat" → Done! 

---

**Enjoy your heartbeat visualization!**
