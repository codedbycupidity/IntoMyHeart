import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Heart } from './components/Heart.js';
import { WebSocketClient } from './utils/WebSocketClient.js';
import { WaveformVisualizer } from './components/WaveformVisualizer.js';

// Hide loading indicator and placeholder once everything is loaded
window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
});

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e2e);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 2.5); // Even closer view

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Enhanced color output for more vibrant colors
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Add renderer to canvas container
const canvasContainer = document.getElementById('canvas-container');
canvasContainer.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 8;

// Create heart (Heart component adds its own lighting)
const heart = new Heart(scene);
let currentBPM = 0;

// Create waveform visualizer
const waveform = new WaveformVisualizer('waveform-canvas');

// WebSocket connection
const wsClient = new WebSocketClient('ws://localhost:8082');

wsClient.onMessage((data) => {
  const { bpm, raw, waveform: waveformValue } = data;

  // Update BPM when heartbeat is detected
  if (bpm !== undefined) {
    updateBPMDisplay(bpm);
    currentBPM = bpm;
    heart.setBPM(bpm);
  }

  // Update waveform with continuous data stream
  if (waveformValue !== undefined) {
    waveform.addDataPoint(waveformValue);
  }
  // Fallback to raw data if waveform not available (backward compatibility)
  else if (raw !== undefined) {
    waveform.addDataPoint(raw);
  }
});

wsClient.onConnect(() => {
  updateStatus(true);
});

wsClient.onDisconnect(() => {
  updateStatus(false);
});

// UI Elements
const bpmDisplay = document.getElementById('bpm-display');
const statusDisplay = document.getElementById('status');
const statusText = document.getElementById('status-text');
const statusDot = document.querySelector('.status-dot');
const wsStatus = document.getElementById('ws-status');
const arduinoStatus = document.getElementById('arduino-status');
const instructions = document.getElementById('instructions');

let wsConnected = false;
let arduinoConnected = false;
let lastDataTime = 0;

function updateBPMDisplay(bpm) {
  bpmDisplay.textContent = Math.round(bpm);

  // Mark Arduino as connected when we receive data
  lastDataTime = Date.now();
  if (!arduinoConnected) {
    arduinoConnected = true;
    updateConnectionStatus();
  }
}

function updateConnectionStatus() {
  // Update WebSocket status
  if (wsConnected) {
    wsStatus.textContent = 'Online';
    wsStatus.className = 'detail-status ok';
  } else {
    wsStatus.textContent = 'Offline';
    wsStatus.className = 'detail-status error';
  }

  // Update Arduino status
  if (arduinoConnected) {
    arduinoStatus.textContent = 'Online';
    arduinoStatus.className = 'detail-status ok';
  } else {
    arduinoStatus.textContent = 'Offline';
    arduinoStatus.className = 'detail-status error';
  }

  // Update main status
  if (wsConnected && arduinoConnected) {
    statusDisplay.className = 'connected';
    statusText.textContent = 'Connected';
    statusDot.className = 'status-dot green';
    if (instructions) instructions.style.display = 'none';
  } else if (wsConnected && !arduinoConnected) {
    statusDisplay.className = 'ws-only';
    statusText.textContent = 'WS Only';
    statusDot.className = 'status-dot orange';
    if (instructions) instructions.style.display = 'block';
  } else {
    statusDisplay.className = 'disconnected';
    statusText.textContent = 'Disconnected';
    statusDot.className = 'status-dot red';
    if (instructions) instructions.style.display = 'block';
  }
}

function updateStatus(connected) {
  wsConnected = connected;
  updateConnectionStatus();
}

// Check for Arduino timeout (no data for 5 seconds)
setInterval(() => {
  if (arduinoConnected && Date.now() - lastDataTime > 5000) {
    arduinoConnected = false;
    updateConnectionStatus();
  }
}, 1000);

// Simulate button
let simulationInterval = null;
let waveformSimulationInterval = null;
const simulateBtn = document.getElementById('simulate-btn');

simulateBtn.addEventListener('click', () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    clearInterval(waveformSimulationInterval);
    simulationInterval = null;
    waveformSimulationInterval = null;
    simulateBtn.textContent = 'Simulate Heartbeat';
    updateStatus(false);
    waveform.clear();
  } else {
    let simulatedBPM = 75;
    simulationInterval = setInterval(() => {
      // Vary BPM slightly for realism
      simulatedBPM = 70 + Math.random() * 10;
      updateBPMDisplay(simulatedBPM);
      currentBPM = simulatedBPM;
      heart.setBPM(simulatedBPM);
    }, 1000);

    // Simulate waveform at higher frequency (30 Hz)
    waveformSimulationInterval = setInterval(() => {
      waveform.simulateHeartbeat(simulatedBPM);
    }, 33);

    simulateBtn.textContent = 'Stop Simulation';
    updateStatus(true);
    if (instructions) instructions.style.display = 'none';
  }
});

// Reset button
document.getElementById('reset-btn').addEventListener('click', () => {
  controls.reset();
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  heart.update();
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}

animate();
