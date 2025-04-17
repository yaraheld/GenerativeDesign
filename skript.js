const canvas = document.getElementById("gradientCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Farben
const colorPalette = ["#ff0080", "#7FF0F3", "#3E54AE", "#3CFFA1", "#C933FF"];

// Maus-Tracking
const mouse = { x: -9999, y: -9999 };
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let originalImageData = null;

// Blob zeichnen
function drawBlob(x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// Farbige Blobs generieren
function drawColorfulGradient() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const blobCount = 15;

  for (let i = 0; i < blobCount; i++) {
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    const minRadius = canvas.width * 0.3;
    const maxRadius = canvas.width * 0.6;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);

    drawBlob(x, y, radius, color);
  }
}

// Grain
function drawGrain(opacity = 0.08) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = Math.random() * 30;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
    // Alpha bleibt
  }

  ctx.putImageData(imageData, 0, 0);
}

// Smudge-/Verzerrungseffekt
function distortAroundMouse(radius = 100, strength = 0.15) {
  if (!originalImageData) return;

  const newImageData = ctx.createImageData(originalImageData);
  const src = originalImageData.data;
  const dst = newImageData.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let srcX = x;
      let srcY = y;

      if (dist < radius) {
        const pullFactor = (1 - dist / radius) * strength;
        srcX = Math.floor(x - dx * pullFactor);
        srcY = Math.floor(y - dy * pullFactor);
      }

      srcX = Math.max(0, Math.min(canvas.width - 1, srcX));
      srcY = Math.max(0, Math.min(canvas.height - 1, srcY));

      const srcIndex = (srcY * canvas.width + srcX) * 4;
      const dstIndex = (y * canvas.width + x) * 4;

      dst[dstIndex]     = src[srcIndex];
      dst[dstIndex + 1] = src[srcIndex + 1];
      dst[dstIndex + 2] = src[srcIndex + 2];
      dst[dstIndex + 3] = src[srcIndex + 3];
    }
  }

  ctx.putImageData(newImageData, 0, 0);
}

// Gesamtrender
function render() {
  drawColorfulGradient();
  drawGrain();
  originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Animation
function animate() {
  requestAnimationFrame(animate);
  distortAroundMouse(100, 0.2);
}

document.getElementById("regenButton").addEventListener("click", () => {
  render();
});

// Initial
render();
animate();
