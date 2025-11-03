# Into My Heart

A real-time 3D heart visualization project that displays your heartbeat from an Arduino sensor using Three.js.

## Project Overview

This project combines hardware and software to create an immersive heartbeat visualization:
- **Arduino**: Reads heartbeat data from a pulse sensor
- **Node.js Server**: Bridges serial communication to WebSocket
- **Three.js Web App**: Renders a beating 3D heart that syncs with your actual heartbeat

## Hardware Requirements

- Arduino board (Uno, Nano, or compatible)
- Pulse sensor (e.g., Pulse Sensor Amped, Grove Ear-clip Heart Rate Sensor)
- USB cable to connect Arduino to computer
- Jumper wires

## Pulse Sensor Wiring

Connect your pulse sensor to the Arduino:
- **Signal (Purple/Red)** → A0 (Analog Pin 0)
- **VCC (Red)** → 5V or 3.3V
- **GND (Black)** → GND

## Software Requirements

- Arduino IDE (for uploading code to Arduino)
- Node.js (v16 or higher)
- Modern web browser (Chrome, Firefox, Edge)

## Installation

### 1. Arduino Setup

1. Open the Arduino IDE
2. Open the file: `arduino/heartbeat_sensor.ino`
3. Connect your Arduino via USB
4. Select your board and port from Tools menu
5. Adjust the `THRESHOLD` value (line 7) based on your sensor readings:
   - Open Serial Monitor (Tools → Serial Monitor, set to 115200 baud)
   - Upload the sketch and observe the analog readings
   - Set THRESHOLD to a value between the high and low readings
6. Upload the sketch to your Arduino

### 2. Web Application Setup

```bash
cd web
npm install
```

### 3. Configure Serial Port

Edit `web/server.js` and update the serial port path (line 47):

```javascript
const SERIAL_PORT_PATH = '/dev/cu.usbmodem1101'; // UPDATE THIS!
```

To find your Arduino's port:
- **macOS**: Look for `/dev/cu.usbmodem*` or `/dev/cu.usbserial*`
- **Windows**: Look for `COM3`, `COM4`, etc. (check Device Manager)
- **Linux**: Look for `/dev/ttyACM0` or `/dev/ttyUSB0`

The server will list available ports when you run it.

## Running the Project

### Option 1: With Real Arduino Data

1. Make sure your Arduino is connected and the serial port is configured
2. Start the backend server (in terminal 1):
   ```bash
   cd web
   npm run server
   ```
   **Note**: Server runs on port 3001 by default. If port is in use: `PORT=3002 npm run server`
3. Start the frontend dev server (in terminal 2):
   ```bash
   cd web
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`

### Option 2: Simulation Mode (No Arduino Required)

1. Start only the frontend:
   ```bash
   cd web
   npm run dev
   ```
2. Open your browser to `http://localhost:5173`
3. Click "Simulate Heartbeat" button to see the heart beat with simulated data

## How It Works

### Data Flow

```
Arduino Sensor → Serial USB → Node.js Server → WebSocket → Browser → Three.js Visualization
```

1. **Arduino** reads analog values from the pulse sensor at 50Hz
2. Detects beats using threshold crossing detection
3. Calculates BPM (beats per minute)
4. Sends JSON data via serial: `{"bpm": 75, "timestamp": 12345}`
5. **Node.js server** reads serial data and broadcasts to WebSocket clients
6. **Browser** receives real-time BPM data via WebSocket
7. **Three.js** animates the 3D heart to beat at the received BPM

### Arduino Algorithm

- Samples pulse sensor every 20ms
- Detects heartbeat when signal crosses threshold
- Calculates BPM based on time between beats
- Filters out noise (beats must be >250ms apart)
- Constrains BPM to reasonable range (40-200)

### 3D Heart Animation

- Heart shape created using Bezier curves
- Scale pulses based on BPM timing
- Emissive glow synced with heartbeat
- Particle system for visual effect
- Smooth interpolation for natural animation

## Project Structure

```
IntoMyHeart/
├── arduino/
│   └── heartbeat_sensor.ino    # Arduino code for pulse sensor
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   └── Heart.js        # Three.js heart 3D model
│   │   ├── utils/
│   │   │   └── WebSocketClient.js  # WebSocket connection handler
│   │   └── main.js             # Main application entry
│   ├── public/                 # Static assets (if needed)
│   ├── index.html              # Main HTML file
│   ├── package.json            # Dependencies
│   ├── server.js               # Serial → WebSocket bridge
│   └── vite.config.js          # Vite configuration
├── docs/                       # Additional documentation
├── .gitignore
└── README.md
```

## Troubleshooting

### Serial Port Issues

- **Permission denied**: On Linux, add your user to the dialout group:
  ```bash
  sudo usermod -a -G dialout $USER
  ```
  Then log out and back in.

- **Port not found**: Check if Arduino IDE can see the port. If yes, copy the exact port path to `server.js`.

### Sensor Not Detecting Beats

- Check wiring connections
- Adjust `THRESHOLD` value in Arduino code
- Ensure good contact with skin (for clip/finger sensors)
- Try different placement locations

### WebSocket Connection Failed

- Ensure Node.js server is running
- Check browser console for errors
- Verify WebSocket URL in `main.js` matches server port

### Heart Not Beating

- Check browser console for errors
- Verify BPM data is being received (check network tab)
- Try simulation mode to test visualization independently

## Customization

### Change Heart Color

Edit `web/src/components/Heart.js` line 40:
```javascript
color: 0xff1744,  // Change this hex color code
```

### Adjust Beat Animation

Edit `web/src/components/Heart.js` line 116:
```javascript
this.targetScale = 1.15;  // Increase for stronger beat
```

### Change Sensor Pin

Edit `arduino/heartbeat_sensor.ino` line 6:
```cpp
const int PULSE_SENSOR_PIN = A0;  // Change to different analog pin
```

## Future Enhancements

- [ ] Add heart rate variability (HRV) analysis
- [ ] Record and playback heartbeat sessions
- [ ] Multiple visualization modes
- [ ] Mobile app support
- [ ] Export data to CSV
- [ ] Real-time heartbeat sound effects
- [ ] Multiple user support

## License

MIT

## Credits

- Three.js for 3D rendering
- Arduino community for pulse sensor libraries
- Web Serial API and SerialPort for communication
