import { createNoise3D } from "simplex-noise";

function rescale(x, min = -1, max = 1) {
  return (x - min) / (max - min);
}

const asciiGradient = [" ", ".", ":", "|", "+", "*", "$", "#", "@"];

const canvas = document.getElementById("hero__background");
const ctx = canvas.getContext("2d");
const noise = createNoise3D();
let time = 0;

let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  effectX: 0,
  effectY: 0,
};
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let elevationColors = [];
function updateElevationColors() {
  elevationColors = [...Array(10).keys()].map((_, i) =>
    getComputedStyle(document.documentElement).getPropertyValue(
      `--elevation-${i}`
    )
  );
}
updateElevationColors();
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
let theme = colorScheme.matches ? "dark" : "light";
colorScheme.addEventListener("change", (e) => {
  updateElevationColors();
  theme = e.matches ? "dark" : "light";
  noiseSmoothing =
    (theme === "dark" ? 1 : -1) * Math.abs(1 - noiseSmoothing) + 1;
});

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  mouse.x = canvas.width / 2;
  mouse.y = canvas.height / 2;
}

const cellSize = 15;
const timeSpeed = 0.0003;
let noiseSmoothing = (theme === "dark" ? 1 : -1) * 0.3 + 1;
const parallaxStrength = 0.1;
const easing = 0.1;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mouseNormalizedX = mouse.x / canvas.width - 0.5;
  const mouseNormalizedY = mouse.y / canvas.height - 0.5;
  mouse.effectX +=
    (mouseNormalizedX * parallaxStrength - mouse.effectX) * easing;
  mouse.effectY +=
    (mouseNormalizedY * parallaxStrength - mouse.effectY) * easing;

  const rowCellSize = Math.floor(canvas.width / cellSize);
  const colCellSize = Math.floor(canvas.height / cellSize);

  const cellWidth = canvas.width / rowCellSize;
  const cellHeight = canvas.height / colCellSize;

  for (let row = 0; row < rowCellSize; row++) {
    const x = row * cellWidth + cellWidth / 2;
    for (let col = 0; col < colCellSize; col++) {
      const y = col * cellHeight + cellHeight / 2;

      let noiseValue = Math.pow(
        rescale(
          noise(
            rescale(x, 0, canvas.width) + mouse.effectX,
            rescale(y, 0, canvas.height) + mouse.effectY,
            time * timeSpeed
          )
        ),
        noiseSmoothing
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `40px Monaspace Neon`;
      ctx.fillStyle =
        elevationColors[Math.floor(noiseValue * (elevationColors.length - 1))];
      ctx.fillText(
        asciiGradient[Math.floor(noiseValue * asciiGradient.length - 1)],
        x,
        y
      );
    }
  }
  time++;

  requestAnimationFrame(render);
}

resize();
addEventListener("resize", resize);

render();
