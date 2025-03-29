import { createNoise3D } from "simplex-noise";

//#region Settings object for adjusting the behavior
const Settings = {
  ascii: {
    chars: " ·•*■@█", // Pay attention to order, chars get more dense as index increases
    fillStyleGenerators: [
      {
        light: (noise) => `rgba(0, 0, 0, 1)`,
        dark: (noise) => `rgba(255, 255, 255, 0.3)`,
      },
      {
        light: (noise) =>
          `hsl(${259 - 60 + normalize(noise, -1, 1, [0, 60])}, 80.2%, 78.2%)`,
        dark: (noise) =>
          `hsl(${259 - 60 + normalize(noise, -1, 1, [0, 60])}, 30%, 30%)`,
      },
      {
        light: (noise) =>
          `hsl(${
            177.75 - 60 + normalize(noise, -1, 1, [0, 60])
          }, 47.06%, 66.67%)`,
        dark: (noise) =>
          `hsl(${177.75 - 60 + normalize(noise, -1, 1, [0, 60])}, 30%, 30%)`,
      },
      {
        light: (noise) =>
          `hsl(${
            52.56 - 60 + normalize(noise, -1, 1, [0, 60])
          }, 82.17%, 69.22%)`,
        dark: (noise) =>
          `hsl(${52.56 - 60 + normalize(noise, -1, 1, [0, 60])}, 30%, 30%)`,
      },
      {
        light: (noise) =>
          `hsl(${14.25 - 60 + normalize(noise, -1, 1, [0, 60])}, 80%, 80.39%)`,
        dark: (noise) =>
          `hsl(${14.25 - 60 + normalize(noise, -1, 1, [0, 60])}, 30%, 30%)`,
      },
    ],
  },
  canvas: {
    elementId: "ascii-background",
    cellSize: 22,
    animationSpeed: 0.001,
  },
  parallax: {
    strength: 0.3,
  },
  mouseDistance: {
    influence: 0.001,
  },
};
//#endregion

const canvasNoise = createNoise3D();
let time = 0;
const canvas = document.getElementById(Settings.canvas.elementId);
const ctx = canvas.getContext("2d");

//#region Mouse object and mouse event listeners for updating its attributes
let Mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  parallaxX: 0,
  parallaxY: 0,
  canvasClick: Settings.ascii.fillStyleGenerators.length,
};
document.addEventListener("mousemove", (e) => {
  Mouse.x = e.clientX;
  Mouse.y = e.clientY;
});
canvas.addEventListener("click", (e) => {
  Mouse.canvasClick++;
});
//#endregion

//#region Light-Dark mode theming
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
let theme = colorScheme.matches ? "dark" : "light";
colorScheme.addEventListener("change", (e) => {
  theme = e.matches ? "dark" : "light";
});
//#endregion

resize();
addEventListener("resize", resize);
render();

//#region functions
function normalize(x, xmin = -1, xmax = 1, targetRange = [0, 1]) {
  return (
    ((x - xmin) / (xmax - xmin)) * (targetRange[1] - targetRange[0]) +
    targetRange[0]
  );
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Mouse.x = canvas.width / 2;
  Mouse.y = canvas.height / 2;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mouseNormalizedX = normalize(Mouse.x, 0, canvas.width, [-0.5, 0.5]);
  const mouseNormalizedY = normalize(Mouse.y, 0, canvas.height, [-0.5, 0.5]);
  Mouse.parallaxX +=
    mouseNormalizedX * Settings.parallax.strength - Mouse.parallaxX;
  Mouse.parallaxY +=
    mouseNormalizedY * Settings.parallax.strength - Mouse.parallaxY;

  const rowCellSize = Math.floor(canvas.width / Settings.canvas.cellSize);
  const colCellSize = Math.floor(canvas.height / Settings.canvas.cellSize);

  const cellWidth = canvas.width / rowCellSize;
  const cellHeight = canvas.height / colCellSize;

  for (let row = 0; row < rowCellSize; row++) {
    const x = row * cellWidth + cellWidth / 2;
    for (let col = 0; col < colCellSize; col++) {
      const y = col * cellHeight + cellHeight / 2;

      const distToMouse = normalize(
        Math.hypot(x - Mouse.x, y - Mouse.y),
        0,
        Math.hypot(canvas.width, canvas.height)
      );

      let noiseValue = canvasNoise(
        normalize(x, 0, canvas.width) + Mouse.parallaxX,
        normalize(y, 0, canvas.height) + Mouse.parallaxY,
        time * Settings.canvas.animationSpeed -
          Math.pow(Settings.mouseDistance.influence, distToMouse)
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `1rem Monaspace Neon`;
      ctx.fillStyle =
        Settings.ascii.fillStyleGenerators[
          Mouse.canvasClick % Settings.ascii.fillStyleGenerators.length
        ][theme](noiseValue);
      ctx.fillText(
        Settings.ascii.chars[
          Math.min(
            Math.floor(
              normalize(noiseValue, -1, 1, [0, Settings.ascii.chars.length])
            ),
            Settings.ascii.chars.length - 1
          )
        ],
        x,
        y
      );
    }
  }
  time++;

  requestAnimationFrame(render);
}
//#endregion
