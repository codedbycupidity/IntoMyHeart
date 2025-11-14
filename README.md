# Into My Heart

A real-time 3D heart visualization project that displays your heartbeat from an Arduino pulse sensor using Three.js. Watch an anatomical heart beat in perfect sync with your actual pulse.

## Project Overview

This project combines hardware and software to create an immersive heartbeat visualization:
- **Arduino**: Reads heartbeat data from a pulse sensor with advanced signal processing
- **Node.js Server**: Bridges serial communication to WebSocket for real-time updates
- **Three.js Web App**: Renders a detailed anatomical 3D heart that syncs with your actual heartbeat
- **OLED Display**: Shows real-time BPM and waveform directly on the Arduino

## Hardware Requirements

- Arduino board (Uno, Nano, or compatible)
- Pulse sensor (e.g., Pulse Sensor Amped, Grove Ear-clip Heart Rate Sensor)
- OLED display (SSD1306, 128x64, I2C)
- USB cable to connect Arduino to computer
- Jumper wires

## Pulse Sensor Wiring

Connect your pulse sensor and OLED display to the Arduino:

**Pulse Sensor:**
- **Signal (Purple/Red)** → A0 (Analog Pin 0)
- **VCC (Red)** → 5V (recommended for better signal quality)
- **GND (Black)** → GND

**OLED Display (I2C):**
- **VCC** → 5V or 3.3V
- **GND** → GND
- **SDA** → A4 (on Uno) or SDA pin
- **SCL** → A5 (on Uno) or SCL pin

## Software Requirements

- Arduino IDE (for uploading code to Arduino)
- Node.js (v16 or higher)
- Modern web browser (Chrome, Firefox, Edge)

## Installation

### 1. Arduino Setup

1. **Install Required Libraries**:
   - Open Arduino IDE
   - Go to Sketch → Include Library → Manage Libraries
   - Search and install:
     - `Adafruit GFX Library`
     - `Adafruit SSD1306`

2. **Upload the Code**:
   - Open the file: `arduino/heartbeat_sensor/heartbeat_sensor.ino`
   - Connect your Arduino via USB
   - Select your board and port from Tools menu
   - Upload the sketch to your Arduino

3. **Verify It Works**:
   - Open Serial Monitor (Tools → Serial Monitor, set to 115200 baud)
   - Place finger on pulse sensor
   - You should see JSON messages like: `{"bpm":72,"timestamp":12345,"raw":450}`
   - OLED display should show live BPM and waveform

**Note**: The code uses advanced signal processing with adaptive thresholding and automatic noise filtering - no manual threshold adjustment needed!

### 2. Web Application Setup

```bash
cd web
npm install
```

### 3. Configure Serial Port

Edit `web/server.js` and update the serial port path (line 6):

```javascript
const SERIAL_PORT_PATH = '/dev/cu.usbmodem11401'; // UPDATE THIS!
```

To find your Arduino's port:
- **macOS**: Run `ls /dev/cu.*` and look for `/dev/cu.usbmodem*`
- **Windows**: Look for `COM3`, `COM4`, etc. (check Device Manager)
- **Linux**: Run `ls /dev/tty*` and look for `/dev/ttyACM0` or `/dev/ttyUSB0`

## Running the Project

### Option 1: With Real Arduino Data

1. **Close Arduino Serial Monitor** (if open - the server needs exclusive access to the port)

2. **Start the WebSocket backend server** (in terminal 1):
   ```bash
   cd web
   npm run server
   ```
   You should see:
   ```
   WebSocket server started on ws://localhost:8082
   Serial port /dev/cu.usbmodem11401 opened at 115200 baud
   Waiting for Arduino data...
   ```

3. **Start the frontend dev server** (in terminal 2):
   ```bash
   cd web
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5175` (or the port shown by Vite)

5. **Check the connection status panel**:
   - **Green "Connected"** = Fully operational
   - **Orange "WS Only"** = WebSocket connected, but Arduino not sending data (close Serial Monitor!)
   - **Red "Disconnected"** = Backend server not running

6. **Place your finger on the sensor** and watch the 3D heart beat with your pulse!

### Option 2: Simulation Mode (No Arduino Required)

1. Start only the frontend:
   ```bash
   cd web
   npm run dev
   ```
2. Open your browser to the displayed URL
3. Click "Simulate Heartbeat" button to see the heart beat with simulated data at 70-80 BPM

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

The Arduino code uses advanced signal processing for accurate heartbeat detection:

- **8-sample moving average** for noise reduction
- **Adaptive threshold calculation** - automatically adjusts to signal strength
- **Dynamic min/max tracking** with fast decay (0.9) for quick adaptation
- **Rising edge detection** - triggers on upward threshold crossing
- **6-beat BPM averaging** for stable display
- **Timing validation** - only accepts beats between 600-1400ms apart (43-100 BPM)
- **Automatic reset** - BPM returns to 0 when no finger detected (signal range < 40)
- **Real-time waveform display** on OLED with scrolling visualization
- **Dual output** - JSON for WebSocket and debug messages for serial monitor

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
│   └── heartbeat_sensor/
│       └── heartbeat_sensor.ino    # Arduino code with OLED & advanced signal processing
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   └── Heart.js            # Three.js heart 3D model component
│   │   ├── utils/
│   │   │   ├── WebSocketClient.js  # WebSocket connection handler
│   │   │   ├── OBJLoader.js        # Three.js OBJ model loader
│   │   │   └── MTLLoader.js        # Three.js MTL material loader
│   │   └── main.js                 # Main application entry
│   ├── public/
│   │   ├── models/                 # 3D heart models and textures
│   │   │   ├── heart1.obj          # 3D heart geometry
│   │   │   ├── heart1.mtl          # Material definitions
│   │   │   └── heart1.jpg          # Texture map
│   │   └── Tween.js                # Animation library
│   ├── index.html                  # Main HTML file with connection status UI
│   ├── package.json                # Dependencies
│   ├── server.js                   # Serial → WebSocket bridge
│   └── vite.config.js              # Vite configuration
├── docs/                           # Additional documentation
│   ├── API.md                      # API reference
│   ├── HARDWARE_SETUP.md           # Hardware setup guide
│   └── QUICKSTART.md               # Quick start guide
├── .gitignore
└── README.md
```

## Troubleshooting

### Serial Port Issues

- **"Resource busy" error**: Close the Arduino Serial Monitor - it blocks the port. The WebSocket server needs exclusive access.

- **Permission denied** (Linux): Add your user to the dialout group:
  ```bash
  sudo usermod -a -G dialout $USER
  ```
  Then log out and back in.

- **Port not found**:
  - Run `ls /dev/cu.*` (macOS) or `ls /dev/tty*` (Linux) to list ports
  - Verify Arduino is connected and recognized by your OS
  - Update the port path in `web/server.js`

### Sensor Not Detecting Beats (Showing 0 BPM)

- **Check physical connections** - Loose wires are the most common issue
- **Verify sensor placement** - Place fingertip gently on sensor (don't press too hard)
- **Check signal range** on OLED - Should show 150-300 with finger, <40 without
- **Keep hand still** - Movement causes noise
- **Use 5V power** - Better signal quality than 3.3V
- **Check OLED display** - Should show waveform scrolling across screen

### Connection Status Colors

- **Green "Connected"**: Everything working - WebSocket and Arduino both online
- **Orange "WS Only"**: WebSocket connected but Arduino not sending data (close Serial Monitor!)
- **Red "Disconnected"**: Backend server not running

### Heart Not Beating in Browser

- Check connection status panel - must be green
- Check browser console (F12) for errors
- Verify you see heartbeat messages in the server terminal
- Try simulation mode to test if visualization works independently

## Customization

### Adjust Heart Size

Edit `web/src/components/Heart.js` line 72:
```javascript
object.scale.set(0.5, 0.5, 0.5); // Adjust scale (0.5 = medium size)
```

### Adjust Camera Distance

Edit [web/src/main.js:23](web/src/main.js#L23):
```javascript
camera.position.set(0, 0, 2.5); // Lower number = closer view
```

### Adjust Beat Animation Strength

Edit [web/src/components/Heart.js:110](web/src/components/Heart.js#L110):
```javascript
const maxScale = 1.08; // Change to 1.15 for stronger beat
```

### Change Light Intensity

Edit [web/src/components/Heart.js:40](web/src/components/Heart.js#L40):
```javascript
const light = new THREE.DirectionalLight(0xffeedd, 1.0); // Adjust 1.0 to 0.5-2.0
```

### Change Sensor Pin

Edit [arduino/heartbeat_sensor/heartbeat_sensor.ino:14](arduino/heartbeat_sensor/heartbeat_sensor.ino#L14):
```cpp
#define sensor A0  // Change to different analog pin (A1, A2, etc.)
```

### Adjust BPM Smoothing

Edit [arduino/heartbeat_sensor/heartbeat_sensor.ino:33](arduino/heartbeat_sensor/heartbeat_sensor.ino#L33):
```cpp
const int BPM_AVERAGE_SIZE = 6;  // Increase for more stable, slower updating BPM
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

- Real-time heartbeat visualization with detailed anatomical 3D heart model
- Arduino pulse sensor integration with OLED display
- Advanced signal processing with adaptive thresholding and noise filtering
- WebSocket communication for real-time browser updates
- Live connection status indicator (WebSocket + Arduino)
- Simulation mode for testing without hardware
- Interactive 3D controls (rotate, zoom, pan with mouse)
- BPM display with 6-beat rolling average for stability
- Smooth heartbeat animations with TWEEN.js
- Enhanced rendering with tone mapping for vibrant colors
- Responsive design that works on any screen size
- Automatic reconnection and error recovery

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
