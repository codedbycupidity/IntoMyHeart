import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// TODO: Import Heart component once created
// import { Heart } from './components/Heart.js';
import { WebSocketClient } from './utils/WebSocketClient.js';

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
camera.position.set(0, 0, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add renderer to canvas container
const canvasContainer = document.getElementById('canvas-container');
canvasContainer.appendChild(renderer.domElement);

// Hide placeholder heart when 3D scene is ready
const placeholder = document.getElementById('heart-placeholder');
if (placeholder) {
  placeholder.style.display = 'none';
}

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 10;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff4757, 1, 100);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x5f27cd, 0.5, 100);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// TODO: Create heart - placeholder for now
// const heart = new Heart(scene);
let currentBPM = 0;

// Temporary placeholder: Add a simple geometry for testing
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({
  color: 0xff4757,
  emissive: 0xff4757,
  emissiveIntensity: 0.3
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// WebSocket connection
const wsClient = new WebSocketClient('ws://localhost:8080');

wsClient.onMessage((data) => {
  const { bpm } = data;
  updateBPMDisplay(bpm);
  currentBPM = bpm;
  // TODO: Update heart component
  // heart.setBPM(bpm);
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
const instructions = document.getElementById('instructions');

function updateBPMDisplay(bpm) {
  bpmDisplay.textContent = Math.round(bpm);
}

function updateStatus(connected) {
  if (connected) {
    statusDisplay.textContent = 'Connected';
    statusDisplay.className = 'connected';
    if (instructions) instructions.style.display = 'none';
  } else {
    statusDisplay.textContent = 'Disconnected';
    statusDisplay.className = 'disconnected';
    if (instructions) instructions.style.display = 'block';
  }
}

// Simulate button
let simulationInterval = null;
const simulateBtn = document.getElementById('simulate-btn');

simulateBtn.addEventListener('click', () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    simulateBtn.textContent = 'Simulate Heartbeat';
    updateStatus(false);
  } else {
    let simulatedBPM = 75;
    simulationInterval = setInterval(() => {
      // Vary BPM slightly for realism
      simulatedBPM = 70 + Math.random() * 10;
      updateBPMDisplay(simulatedBPM);
      currentBPM = simulatedBPM;
      // TODO: Update heart component
      // heart.setBPM(simulatedBPM);
    }, 1000);
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

  // Rotate placeholder cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // TODO: Update heart component
  // heart.update();

  controls.update();
  renderer.render(scene, camera);
}

animate();
