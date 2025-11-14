import * as THREE from 'three';
import { MTLLoader } from '../utils/MTLLoader.js';
import { OBJLoader } from '../utils/OBJLoader.js';

export class Heart {
  constructor(scene) {
    this.scene = scene;
    this.bpm = 75; // Default BPM
    this.beatInterval = 0;
    this.lastBeatTime = 0;
    this.heartGroup = null;
    this.isBeating = true;
    this.beatScale = { value: 1.0 };
    this.heartbeatTween = null;
    this.isLoaded = false;

    this.createHeart();
  }

  createHeart() {
    // Create a group to hold the heart model
    this.heartGroup = new THREE.Group();
    this.scene.add(this.heartGroup);

    // Add ambient lighting for the heart
    const ambient = new THREE.AmbientLight(0x444444);
    this.scene.add(ambient);

    // Add directional lights from all angles
    const lightPositions = [
      [0, 0, 1],
      [0, 0, -1],
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0]
    ];

    lightPositions.forEach(pos => {
      const light = new THREE.DirectionalLight(0xffeedd, 1.0); // Increased from 0.7 to 1.0
      light.position.set(pos[0], pos[1], pos[2]).normalize();
      this.scene.add(light);
    });

    // Load the heart model
    const onProgress = (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
      }
    };

    const onError = (error) => {
      console.error('Error loading heart model:', error);
    };

    // Use local models path
    const modelsPath = '/models/';

    // Load closed heart model
    new MTLLoader()
      .setPath(modelsPath)
      .load('heart1.mtl', (materials) => {
        materials.preload();
        new OBJLoader()
          .setMaterials(materials)
          .setPath(modelsPath)
          .load('heart1.obj', (object) => {
            // Position and rotate the heart
            object.position.set(0, 0, 0);
            object.rotation.x = -Math.PI / 2; // Rotate to stand upright
            object.scale.set(0.5, 0.5, 0.5); // Even bigger!
            object.name = 'heartModel';
            this.heartGroup.add(object);
            this.isLoaded = true;
            console.log('Heart model loaded successfully');
          }, onProgress, onError);
      });
  }

  setBPM(bpm) {
    this.bpm = bpm;
    this.beatInterval = 60000 / bpm; // Convert BPM to milliseconds
  }

  // Trigger beat manually (called when Arduino detects heartbeat)
  beat() {
    if (this.isLoaded && this.isBeating) {
      this.triggerBeat();
    }
  }

  update() {
    // No automatic beating - now triggered by actual heartbeat events
  }

  triggerBeat() {
    // Stop any existing tween
    if (this.heartbeatTween) {
      TWEEN.remove(this.heartbeatTween);
    }

    // Create heartbeat animation using TWEEN - more dramatic
    const expandDuration = 150; // Faster expansion (systole)
    const contractDuration = 250; // Slower contraction (diastole)
    const maxScale = 1.20; // 20% expansion - much more noticeable

    this.heartbeatTween = new TWEEN.Tween(this.beatScale)
      .to({ value: maxScale }, expandDuration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        if (this.heartGroup) {
          this.heartGroup.scale.set(
            this.beatScale.value,
            this.beatScale.value,
            this.beatScale.value
          );
        }
      })
      .chain(
        new TWEEN.Tween(this.beatScale)
          .to({ value: 1.0 }, contractDuration)
          .easing(TWEEN.Easing.Quadratic.In)
          .onUpdate(() => {
            if (this.heartGroup) {
              this.heartGroup.scale.set(
                this.beatScale.value,
                this.beatScale.value,
                this.beatScale.value
              );
            }
          })
      )
      .start();
  }

  toggleBeating() {
    this.isBeating = !this.isBeating;

    if (!this.isBeating && this.heartbeatTween) {
      TWEEN.remove(this.heartbeatTween);
      // Reset to original scale
      if (this.heartGroup) {
        this.heartGroup.scale.set(1.0, 1.0, 1.0);
      }
    }
  }

  startBeating() {
    this.isBeating = true;
  }

  stopBeating() {
    this.isBeating = false;
    if (this.heartbeatTween) {
      TWEEN.remove(this.heartbeatTween);
    }
    if (this.heartGroup) {
      this.heartGroup.scale.set(1.0, 1.0, 1.0);
    }
  }
}
