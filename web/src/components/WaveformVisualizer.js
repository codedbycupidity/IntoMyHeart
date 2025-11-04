export class WaveformVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas not found:', canvasId);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Waveform data buffer - fewer points for wider, more spaced out waves
    this.dataPoints = [];
    this.maxPoints = 100; // Fewer points = wider peaks

    // Visual settings
    this.lineColor = '#ff4757'; // Red heartbeat color
    this.gridColor = 'rgba(255, 255, 255, 0.1)';
    this.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // Data range (from Arduino sensor)
    this.minValue = 0;
    this.maxValue = 1023;

    // Auto-scaling
    this.runningMin = 1023;
    this.runningMax = 0;

    this.init();
  }

  init() {
    // Initialize with flat line in middle
    for (let i = 0; i < this.maxPoints; i++) {
      this.dataPoints.push(512);
    }
    this.draw();
  }

  addDataPoint(value) {
    // Add new data point (directly from Arduino every 50ms)
    this.dataPoints.push(value);

    // Remove oldest point if buffer is full
    if (this.dataPoints.length > this.maxPoints) {
      this.dataPoints.shift();
    }

    // Update running min/max for auto-scaling with decay
    if (value > this.runningMax) {
      this.runningMax = value;
    } else {
      this.runningMax = this.runningMax * 0.98 + value * 0.02;
    }

    if (value < this.runningMin) {
      this.runningMin = value;
    } else {
      this.runningMin = this.runningMin * 0.98 + value * 0.02;
    }

    this.draw();
  }

  draw() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw grid lines
    this.drawGrid();

    // Draw waveform
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const range = this.runningMax - this.runningMin;
    const effectiveMin = range > 50 ? this.runningMin : this.runningMin - 25;
    const effectiveMax = range > 50 ? this.runningMax : this.runningMax + 25;
    const effectiveRange = effectiveMax - effectiveMin;

    for (let i = 0; i < this.dataPoints.length; i++) {
      const x = (i / this.maxPoints) * this.width;

      // Map data point to canvas height (inverted because canvas Y is top-down)
      // Reduce amplitude by using only 40% of canvas height
      const normalizedValue = (this.dataPoints[i] - effectiveMin) / effectiveRange;
      const waveHeight = (this.height - 40) * 0.4; // Use only 40% of available height
      const centerY = this.height / 2;
      const y = centerY - (normalizedValue - 0.5) * waveHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw current value indicator
    if (this.dataPoints.length > 0) {
      const lastValue = this.dataPoints[this.dataPoints.length - 1];
      const normalizedValue = (lastValue - effectiveMin) / effectiveRange;
      const y = this.height - (normalizedValue * (this.height - 20)) - 10;

      // Draw pulse dot at the end
      ctx.fillStyle = this.lineColor;
      ctx.beginPath();
      ctx.arc(this.width - 1, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;

    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * this.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Vertical grid lines (every 30 pixels)
    for (let x = 0; x < this.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }

    // Draw center line (baseline)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.height / 2);
    ctx.lineTo(this.width, this.height / 2);
    ctx.stroke();
  }

  clear() {
    this.dataPoints = [];
    for (let i = 0; i < this.maxPoints; i++) {
      this.dataPoints.push(512);
    }
    this.runningMin = 1023;
    this.runningMax = 0;
    this.draw();
  }

  // Simulate heartbeat waveform for testing
  simulateHeartbeat(bpm) {
    // Generate a realistic heartbeat waveform pattern
    const beatsPerSecond = bpm / 60;
    const samplesPerBeat = Math.floor(60 / beatsPerSecond);

    // Simple sine wave with double peak (P-QRS-T complex simulation)
    const phase = (Date.now() / 1000) * beatsPerSecond * Math.PI * 2;

    // Baseline with small variations
    let value = 512 + Math.sin(phase * 5) * 20;

    // Add main heartbeat spike
    const beatPhase = phase % (Math.PI * 2);
    if (beatPhase < Math.PI / 4) {
      value += Math.sin(beatPhase * 4) * 200;
    }

    this.addDataPoint(value);
  }
}
