const canvas = document.getElementById('gradientCanvas');
const ctx = canvas.getContext('2d');
    // Automatisch Größe anpassen
function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Farbpalette definieren (HEX-Farben)
const colorPalette = [
      "#ff0080",
      "#7FF0F3", 
      "#3E54AE",
      "#3CFFA1",
      "#C933FF"
    ];

    // HEX → RGB konvertieren
function hexToRGB(hex) {
      const bigint = parseInt(hex.replace("#", ""), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    }

    // Funktion: Farb-Blob an zufälliger Position
function drawBlob(x, y, radius, color) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Zeichne mehrere überlappende Farb-Blobs
function drawColorfulGradient() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const minBlobs = 5;
      const maxBlobs = 10;
      const blobCount = minBlobs + Math.floor(Math.random() * (maxBlobs - minBlobs + 1));      // Anzahl der Blobs

      for (let i = 0; i < blobCount; i++) {
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        // ▶ Hier: Mindest- und Maximalgröße der Blobs
        const minRadius = canvas.width * 0.4;  // min. 20% der Breite
        const maxRadius = canvas.width * 0.8;  // max. 50% der Breite
        const radius = minRadius + Math.random() * (maxRadius - minRadius);

        drawBlob(x, y, radius, color);
      }
    }

    // Grain hinzufügen
function drawGrain(opacity = 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random()) * 50; //wie stark der Grain ist zwischen 10 & 50 ist ganz nice
        data[i] += grain;     // R
        data[i + 1] += grain; // G
        data[i + 2] += grain; // B
        data[i + 3] = Math.min(255, data[i + 3] + opacity * 255); // A
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // Gesamt-Render-Funktion
function render() {
      drawColorfulGradient();
      drawGrain();
    }

    // ▶ Klick auf Button löst neues Rendering aus
    document.getElementById('regenButton').addEventListener('click', () => {
      render();
});

    // Beim ersten Laden rendern
render();