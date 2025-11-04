# API Documentation

## Overview

This document describes the API for the Into My Heart heartbeat visualization system, including data protocols, component interfaces, and customization options.

## Data Protocol

### Arduino → Server (Serial)

**Format**: JSON over serial (115200 baud)

**Message Structure**:
```json
{
  "bpm": 75,
  "timestamp": 12345678
}
```

**Fields**:
- `bpm` (number): Beats per minute (40-200)
- `timestamp` (number): Milliseconds since Arduino started

**Frequency**: Variable (sent on each detected heartbeat)

**Example**:
```json
{"bpm":72,"timestamp":5234}
{"bpm":75,"timestamp":6045}
{"bpm":73,"timestamp":6856}
```

### Server → Browser (WebSocket)

**WebSocket URL**: `ws://localhost:8080`

**Message Structure**:
```json
{
  "bpm": 75,
  "timestamp": 12345678
}
```

**Connection Behavior**:
- Auto-reconnect every 3 seconds if disconnected
- Broadcasts to all connected clients
- No authentication required (local only)
- JSON format only

## Heart Component API

### Constructor

```javascript
import { Heart } from './components/Heart.js';

const heart = new Heart(scene);
```

**Parameters**:
- `scene` (THREE.Scene): The Three.js scene to add the heart to

**Returns**: Heart instance

### Methods

#### `setBPM(bpm)`

Set the heart's beating rate.

```javascript
heart.setBPM(75);
```

**Parameters**:
- `bpm` (number): Beats per minute (recommended: 40-200)

**Effects**:
- Updates internal beat interval
- Next beat will occur at new rate
- Formula: `beatInterval = 60000 / bpm` milliseconds

#### `update()`

Update the heart animation (call in animation loop).

```javascript
function animate() {
  requestAnimationFrame(animate);
  heart.update();
  TWEEN.update();
  renderer.render(scene, camera);
}
```

**Effects**:
- Checks if it's time for next beat based on BPM
- Triggers beat animation via TWEEN.js
- Must be called every frame

#### `triggerBeat()`

Manually trigger a single heartbeat animation.

```javascript
heart.triggerBeat();
```

**Effects**:
- Expands heart scale to 1.08 over 200ms
- Contracts back to 1.0 over 300ms
- Uses easing for smooth animation

#### `startBeating()`

Resume heartbeat animation.

```javascript
heart.startBeating();
```

#### `stopBeating()`

Pause heartbeat animation and reset scale.

```javascript
heart.stopBeating();
```

#### `toggleBeating()`

Toggle heartbeat animation on/off.

```javascript
heart.toggleBeating();
```

### Properties

```javascript
heart.bpm              // Current BPM (number)
heart.beatInterval     // Time between beats in ms (number)
heart.heartGroup       // THREE.Group containing the model
heart.isBeating        // Whether heart is currently beating (boolean)
heart.isLoaded         // Whether 3D model has loaded (boolean)
heart.beatScale        // Current animation scale object
```

## WebSocket Client API

### Constructor

```javascript
import { WebSocketClient } from './utils/WebSocketClient.js';

const wsClient = new WebSocketClient('ws://localhost:8080');
```

**Parameters**:
- `url` (string): WebSocket server URL

### Methods

#### `onMessage(handler)`

Register callback for incoming messages.

```javascript
wsClient.onMessage((data) => {
  console.log('BPM:', data.bpm);
  console.log('Timestamp:', data.timestamp);
});
```

**Parameters**:
- `handler` (function): Callback function receiving parsed JSON data

#### `onConnect(handler)`

Register callback for connection events.

```javascript
wsClient.onConnect(() => {
  console.log('Connected to server');
  updateUIStatus(true);
});
```

#### `onDisconnect(handler)`

Register callback for disconnection events.

```javascript
wsClient.onDisconnect(() => {
  console.log('Disconnected from server');
  updateUIStatus(false);
});
```

#### `send(data)`

Send data to server (if connected).

```javascript
wsClient.send({
  command: 'start_recording',
  duration: 60000
});
```

**Parameters**:
- `data` (object): Data to send (will be JSON stringified)

#### `disconnect()`

Manually disconnect from server.

```javascript
wsClient.disconnect();
```

## Configuration

### Environment Variables

Create `.env` file in `web/` directory:

```env
SERIAL_PORT=/dev/cu.usbmodem1101
SERIAL_BAUD_RATE=115200
WS_PORT=8080
HTTP_PORT=3001
```

### Server Configuration

```javascript
// In server.js

const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 8080;
const SERIAL_PORT_PATH = process.env.SERIAL_PORT || '/dev/cu.usbmodem1101';
```

### Heart Model Configuration

```javascript
// In Heart.js

// Model paths
const modelsPath = '/models/';

// Scale
object.scale.set(0.5, 0.5, 0.5);

// Position
object.position.set(0, 0, 0);

// Rotation
object.rotation.x = -Math.PI / 2;

// Beat animation
const expandDuration = 200;    // ms
const contractDuration = 300;  // ms
const maxScale = 1.08;         // 8% expansion
```

### Lighting Configuration

```javascript
// In Heart.js

// Ambient light
const ambient = new THREE.AmbientLight(0x444444);

// Directional lights (6 directions)
const light = new THREE.DirectionalLight(0xffeedd, 1.0);
// Positions: front, back, left, right, top, bottom
```

### Renderer Configuration

```javascript
// In main.js

// Enhanced color output
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
```

### Camera Configuration

```javascript
// In main.js

// Camera position
camera.position.set(0, 0, 2.5);

// Controls
controls.minDistance = 1;
controls.maxDistance = 8;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
```

## Arduino Configuration

### Pin Configuration

```cpp
// In heartbeat_sensor.ino

const int PULSE_SENSOR_PIN = A0;  // Analog input
const int LED_PIN = 13;            // LED feedback
```

### Detection Parameters

```cpp
const int THRESHOLD = 550;              // Adjust for your sensor
const int SAMPLE_INTERVAL = 20;         // 20ms = 50Hz
const unsigned long WINDOW_SIZE = 10000; // 10 second averaging
```

### BPM Calculation

```cpp
// Instantaneous BPM
BPM = 60000 / timeSinceLastBeat;

// Constraints
if (BPM > 40 && BPM < 200) {
  // Valid BPM
}
```

## Customization Examples

### Change Beat Strength

```javascript
// In Heart.js triggerBeat()
const maxScale = 1.15; // Stronger beat (was 1.08)
```

### Adjust Beat Speed

```javascript
// In Heart.js triggerBeat()
const expandDuration = 150;   // Faster (was 200)
const contractDuration = 250; // Faster (was 300)
```

### Change Heart Size

```javascript
// In Heart.js createHeart()
object.scale.set(0.7, 0.7, 0.7); // Larger (was 0.5)
```

### Add Custom Lighting

```javascript
// In Heart.js or main.js
const spotLight = new THREE.SpotLight(0xff0000, 1);
spotLight.position.set(10, 10, 10);
scene.add(spotLight);
```

### Modify Camera View

```javascript
// In main.js
camera.position.set(2, 1, 3); // Angled view
camera.lookAt(0, 0, 0);        // Look at heart
```

## Events and Hooks

### Model Loading Events

```javascript
// In Heart.js
const onProgress = (xhr) => {
  if (xhr.lengthComputable) {
    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log('Loading:', percentComplete + '%');
  }
};

const onError = (error) => {
  console.error('Error loading model:', error);
};
```

### Beat Events

```javascript
// Custom beat event
heart.triggerBeat = function() {
  // Custom logic before beat
  console.log('Beat triggered!');

  // Original beat animation
  // ... tween code ...

  // Custom logic after beat
  updateUI();
};
```

## Error Handling

### Serial Port Errors

```javascript
serialPort.on('error', (err) => {
  console.error('Serial error:', err.message);
  // Continue running - visualization still works
});
```

### WebSocket Errors

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Auto-reconnect handled by onclose
};
```

### Model Loading Errors

```javascript
const onError = (error) => {
  console.error('Failed to load heart model:', error);
  // Could show error message to user
  // Could load fallback model
};
```

## Performance Optimization

### Reduce Polygon Count

Use lower-poly model for better performance on slower devices.

### Adjust Shadow Quality

```javascript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

### Limit Frame Rate

```javascript
let lastTime = 0;
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

function animate(currentTime) {
  requestAnimationFrame(animate);

  if (currentTime - lastTime >= frameInterval) {
    lastTime = currentTime;
    // Render frame
  }
}
```

## Testing

### Test Without Hardware

```javascript
// Simulate heartbeat data
setInterval(() => {
  const simulatedBPM = 70 + Math.random() * 10;
  heart.setBPM(simulatedBPM);
}, 1000);
```

### Test Serial Communication

```bash
# List available ports
node -e "require('serialport').SerialPort.list().then(console.log)"

# Test serial read
node -e "const s = new (require('serialport').SerialPort)({path:'/dev/cu.usbmodem1101', baudRate:115200}); s.on('data', d => console.log(d.toString()))"
```

## Future API Extensions

These features are planned for future versions:

### Heart Rate Variability (HRV)

```javascript
{
  "bpm": 75,
  "hrv": 45,  // ms variance between beats
  "timestamp": 12345678
}
```

### Signal Quality

```javascript
{
  "bpm": 75,
  "quality": 0.95,  // 0-1 scale
  "timestamp": 12345678
}
```

### Multiple Sensors

```javascript
{
  "sensor_id": "sensor_1",
  "bpm": 75,
  "timestamp": 12345678
}
```
