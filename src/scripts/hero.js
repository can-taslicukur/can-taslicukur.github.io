import { createNoise3D } from "simplex-noise";

function rescale(x, min = -1, max = 1) {
  return (x - min) / (max - min);
}

const asciiGradient = [" ", ".", ":", "-", "=", "+", "*", "#", "@"];

const canvas = document.getElementById("hero-background");
const ctx = canvas.getContext("2d");
const noise = createNoise3D();
let time = 0;
let mouse = {
  x: null,
  y: null,
};

const elevationColors = [...Array(10).keys()].map((_, i) =>
  getComputedStyle(canvas).getPropertyValue(`--elevation-${i}`)
);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function render(cellSize = 15, timeSpeed = 0.00015) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rowCellSize = Math.floor(canvas.width / cellSize);
  const colCellSize = Math.floor(canvas.height / cellSize);

  const cellWidth = canvas.width / rowCellSize;
  const cellHeight = canvas.height / colCellSize;

  for (let row = 0; row < rowCellSize; row++) {
    const x = row * cellWidth + cellWidth / 2;
    for (let col = 0; col < colCellSize; col++) {
      const y = col * cellHeight + cellHeight / 2;
      const noiseValue = rescale(
        noise(
          rescale(x, 0, canvas.width),
          rescale(y, 0, canvas.height),
          time * timeSpeed
        )
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle =
        elevationColors[Math.floor(noiseValue * (elevationColors.length - 1))];
      ctx.font = `40px Monaspace Neon`;
      ctx.fillText(
        asciiGradient[Math.floor(noiseValue * asciiGradient.length - 1)],
        x,
        y
      );
    }
  }
  time++;

  requestAnimationFrame(() => render(cellSize));
}

resize();
addEventListener("resize", resize);

render();
