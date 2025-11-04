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

- Anatomical heart model loaded from OBJ file format
- Realistic textures and materials using MTL files
- Scale pulses based on BPM timing using TWEEN.js
- Smooth expansion and contraction (systole/diastole)
- Interactive 3D controls (rotate, zoom, pan)
- Enhanced rendering with tone mapping for vibrant colors

## Project Structure

```
IntoMyHeart/
├── arduino/
│   └── heartbeat_sensor.ino    # Arduino code for pulse sensor
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   └── Heart.js        # Three.js heart 3D model component
│   │   ├── utils/
│   │   │   ├── WebSocketClient.js  # WebSocket connection handler
│   │   │   ├── OBJLoader.js    # Three.js OBJ model loader
│   │   │   └── MTLLoader.js    # Three.js MTL material loader
│   │   └── main.js             # Main application entry
│   ├── public/
│   │   ├── models/             # 3D heart models and textures
│   │   │   ├── heart1.obj      # 3D heart geometry
│   │   │   ├── heart1.mtl      # Material definitions
│   │   │   └── heart1.jpg      # Texture map
│   │   └── Tween.js            # Animation library
│   ├── index.html              # Main HTML file
│   ├── package.json            # Dependencies
│   ├── server.js               # Serial → WebSocket bridge
│   └── vite.config.js          # Vite configuration
├── docs/                       # Additional documentation
│   ├── API.md                  # API reference
│   └── HARDWARE_SETUP.md       # Hardware setup guide
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

### Adjust Heart Size

Edit `web/src/components/Heart.js` line 72:
```javascript
object.scale.set(0.5, 0.5, 0.5); // Adjust scale (0.5 = medium size)
```

### Adjust Camera Distance

Edit `web/src/main.js` line 23:
```javascript
camera.position.set(0, 0, 2.5); // Lower number = closer view
```

### Adjust Beat Animation Strength

Edit `web/src/components/Heart.js` around line 112:
```javascript
const maxScale = 1.08; // Change to 1.15 for stronger beat
```

### Change Light Intensity

Edit `web/src/components/Heart.js` line 40:
```javascript
const light = new THREE.DirectionalLight(0xffeedd, 1.0); // Adjust 1.0 to 0.5-2.0
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

## Features

- Real-time heartbeat visualization with anatomical 3D heart model
- Arduino pulse sensor integration via WebSocket
- Simulation mode for testing without hardware
- Interactive 3D controls (rotate, zoom, pan with mouse)
- BPM display and connection status
- Smooth heartbeat animations with TWEEN.js
- Enhanced rendering with tone mapping for vibrant colors
- Responsive design that works on any screen size

## Technologies Used

- **Three.js** - 3D rendering and visualization
- **TWEEN.js** - Smooth animation interpolation
- **Vite** - Fast development server and build tool
- **WebSocket** - Real-time communication
- **SerialPort (Node.js)** - Arduino serial communication
- **Arduino** - Microcontroller for pulse sensor
- **OBJ/MTL Loaders** - 3D model loading

## Credits

- Three.js for 3D rendering engine
- Original heart 3D model from [mattschroyer/heart](https://github.com/mattschroyer/heart)
- Arduino community for pulse sensor libraries
- TWEEN.js for animation library
