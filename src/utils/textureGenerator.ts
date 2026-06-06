import * as THREE from 'three';

export function generatePlanetTexture(
  baseColor: string,
  options: {
    noiseScale?: number;
    noiseIntensity?: number;
    bandCount?: number;
    craters?: boolean;
    clouds?: boolean;
    seed?: number;
  } = {}
): THREE.CanvasTexture {
  const {
    noiseScale = 50,
    noiseIntensity = 0.3,
    bandCount = 0,
    craters = false,
    clouds = false,
    seed = Math.random() * 10000,
  } = options;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const baseColorObj = new THREE.Color(baseColor);

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      let noise = 0;
      for (let octave = 0; octave < 4; octave++) {
        const frequency = Math.pow(2, octave) / noiseScale;
        const amplitude = Math.pow(0.5, octave);
        noise +=
          amplitude *
          (Math.sin((x + seed) * frequency) *
            Math.cos((y + seed * 1.3) * frequency) *
            0.5 +
            0.5);
      }

      let r = baseColorObj.r * 255;
      let g = baseColorObj.g * 255;
      let b = baseColorObj.b * 255;

      const variation = (noise - 0.5) * 2 * noiseIntensity;
      r = Math.max(0, Math.min(255, r * (1 + variation)));
      g = Math.max(0, Math.min(255, g * (1 + variation * 0.9)));
      b = Math.max(0, Math.min(255, b * (1 + variation * 0.8)));

      if (bandCount > 0) {
        const bandY = Math.sin((y / height) * bandCount * Math.PI);
        const bandFactor = 0.15 * bandY;
        r = Math.max(0, Math.min(255, r * (1 + bandFactor)));
        g = Math.max(0, Math.min(255, g * (1 + bandFactor * 0.8)));
        b = Math.max(0, Math.min(255, b * (1 - bandFactor * 0.3)));
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (craters) {
    const craterCount = 80 + Math.floor(Math.random() * 60);
    for (let i = 0; i < craterCount; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = 2 + Math.random() * 15;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      gradient.addColorStop(0, 'rgba(80, 60, 40, 0.5)');
      gradient.addColorStop(0.7, 'rgba(120, 100, 80, 0.3)');
      gradient.addColorStop(1, 'rgba(120, 100, 80, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(60, 40, 20, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  if (clouds) {
    for (let i = 0; i < 15; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = 30 + Math.random() * 80;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cr, cr * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

export function generateSunTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const seed = Math.random() * 10000;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      let noise = 0;
      for (let octave = 0; octave < 5; octave++) {
        const frequency = Math.pow(2, octave) / 30;
        const amplitude = Math.pow(0.5, octave);
        noise +=
          amplitude *
          (Math.sin((x + seed) * frequency) *
            Math.cos((y + seed * 1.3) * frequency) *
            0.5 +
            0.5);
      }

      const turbulence = (noise - 0.5) * 2;

      const r = 255;
      const g = Math.max(180, Math.min(255, 200 + turbulence * 60));
      const b = Math.max(50, Math.min(150, 80 + turbulence * 50));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  for (let i = 0; i < 30; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const cr = 5 + Math.random() * 25;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    gradient.addColorStop(0, 'rgba(255, 255, 220, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

export function generateRingTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let x = 0; x < width; x++) {
    const radiusFactor = x / width;
    const gapFactor =
      Math.sin(radiusFactor * 25) * 0.5 +
      0.5 +
      Math.sin(radiusFactor * 7) * 0.2;

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;

      const verticalFactor = 1 - Math.abs((y / height - 0.5) * 2);
      const alpha = gapFactor * verticalFactor * 0.85;

      const noise = Math.random() * 0.3;

      data[idx] = Math.floor(220 + noise * 35);
      data[idx + 1] = Math.floor(200 + noise * 35);
      data[idx + 2] = Math.floor(170 + noise * 40);
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}
