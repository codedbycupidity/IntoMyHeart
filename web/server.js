const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

// Configuration
const SERIAL_PORT_PATH = '/dev/cu.usbmodem11401'; // Arduino USB port
const BAUD_RATE = 115200;
const WS_PORT = 8082;

// Create WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);

// Track connected clients
let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Open serial port
const port = new SerialPort({
  path: SERIAL_PORT_PATH,
  baudRate: BAUD_RATE
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log(`Serial port ${SERIAL_PORT_PATH} opened at ${BAUD_RATE} baud`);
});

port.on('error', (err) => {
  console.error('Serial port error:', err.message);
  console.log('\nTroubleshooting:');
  console.log('1. Check if Arduino is connected');
  console.log('2. Verify port path (try: ls /dev/cu.* or ls /dev/tty.*)');
  console.log('3. Close Arduino Serial Monitor if open');
  console.log('4. Make sure no other program is using the port');
});

// Parse incoming serial data
parser.on('data', (data) => {
  const line = data.trim();

  // Only process JSON messages (heartbeat data)
  if (line.startsWith('{')) {
    try {
      const heartbeatData = JSON.parse(line);
      console.log('Heartbeat:', heartbeatData);

      // Broadcast to all connected clients
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(heartbeatData));
        }
      });
    } catch (error) {
      // Ignore parse errors (debug output)
    }
  } else {
    // Log debug output
    console.log('Debug:', line);
  }
});

console.log('\nWaiting for Arduino data...');
console.log('Open http://localhost:5175/ to view the 3D heart visualization\n');
