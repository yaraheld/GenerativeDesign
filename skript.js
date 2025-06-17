const canvas = document.getElementById("gradientCanvas");
    const canvasContext = canvas.getContext("2d");

    // Canvas-Größe an Fenster anpassen
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Farbpalette
    const colorPalette = ["#ff0080", "#7FF0F3", "#3E54AE", "#3CFFA1", "#C933FF"];

    // Maus-Position speichern
    const mouse = { x: -9999, y: -9999 };
    canvas.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Ursprüngliches Bild (für Verzerrungseffekte)
    let originalImageData = null;

    // Slider-Elemente
    const grainSlider = document.getElementById('grainSlider');
    const blobSlider = document.getElementById('blobSlider');


    
    // Einzelnen Farb-Blob zeichnen
    function drawBlob(x, y, radius, color) {
      const gradient = canvasContext.createRadialGradient(x, y, 0, x, y, radius); 
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "transparent");

      canvasContext.fillStyle = gradient; 
      canvasContext.beginPath(); 
      canvasContext.arc(x, y, radius, 0, Math.PI * 2); 
      canvasContext.fill(); 
    }

    // Mehrere zufällige Blobs auf dem Canvas verteilen
    function drawColorfulGradient(blobCount) { // Nimmt blobCount als Parameter
      canvasContext.clearRect(0, 0, canvas.width, canvas.height); 

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

    // Leichten "Grain" Effekt hinzufügen
    function drawGrain(strength) { // Nimmt strength als Parameter
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height); 
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const grain = Math.random() * strength; 
        data[i] += grain;     // Rot
        data[i + 1] += grain; // Grün
        data[i + 2] += grain; // Blau
        // Alpha bleibt erhalten
      }

      canvasContext.putImageData(imageData, 0, 0); 
    }

    // Tasten-Status speichern
    let isSpacePressed = false;
    let isInverted = false; 

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') isSpacePressed = true; 
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') isSpacePressed = false; 
    });

    // Verzerrungseffekt (Magnet-Effekt)
    function distortAroundMouse(radius = 100, strength = 0.2) {
      if (!originalImageData) return;

      const newImageData = canvasContext.createImageData(originalImageData);
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

            if (isSpacePressed) {
              srcX = Math.floor(x - dx * pullFactor);
              srcY = Math.floor(y - dy * pullFactor);
            }
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

      canvasContext.putImageData(newImageData, 0, 0); 
    }

    // Gesamtes Rendering (Blobs + Grain)
    function render(grainStrength, blobCount) { // Nimmt nun die Werte als Parameter
      drawColorfulGradient(blobCount);
      drawGrain(grainStrength);
      originalImageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height); 
    }

    // Animationsschleife
    function animate() {
      requestAnimationFrame(animate);

      if (isSpacePressed) {
        distortAroundMouse(100, 0.2);
        originalImageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height); 
      }
    }

    // Button "Regenerate" → neuen Hintergrund generieren
    document.getElementById('regenButton').addEventListener('click', () => {
      // Beim Klick auf Regenerate die aktuellen Slider-Werte auslesen
      const currentGrainStrength = parseFloat(grainSlider.value);
      const currentBlobCount = parseInt(blobSlider.value);
      render(currentGrainStrength, currentBlobCount); // Mit den ausgelesenen Werten rendern
    });

    // Beim Start einmal rendern mit den Initialwerten der Slider
    render(parseFloat(grainSlider.value), parseInt(blobSlider.value));
    animate();