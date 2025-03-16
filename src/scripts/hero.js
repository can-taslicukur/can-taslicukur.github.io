import { spline } from "@georgedoescode/spline";
import { createNoise2D } from "simplex-noise";

function rescale(x, xRange, targetRange) {
  return (
    ((x - xRange[0]) / (xRange[1] - xRange[0])) *
      (targetRange[1] - targetRange[0]) +
    targetRange[0]
  );
}

class Blob {
  constructor(
    nPoints = 6,
    radius = 75,
    noiseFun = createNoise2D(),
    noiseStep = 0.005
  ) {
    this.nPoints = nPoints;
    this.radius = radius;
    this.noise = noiseFun;
    this.noiseStep = noiseStep;
    this.angleStep = (Math.PI * 2) / this.nPoints;
    this.points = Array.from({ length: nPoints }, (_, i) => {
      const theta = i * this.angleStep;

      const x = 100 + Math.cos(theta) * this.radius;
      const y = 100 + Math.sin(theta) * this.radius;

      return {
        x: x,
        y: y,
        originX: x,
        originY: y,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
      };
    });
  }
  applyNoise(noiseMultiplier = 20) {
    this.points.forEach((point, i, arr) => {
      const nX = this.noise(point.noiseOffsetX, point.noiseOffsetX);
      const nY = this.noise(point.noiseOffsetY, point.noiseOffsetY);

      const x = rescale(
        nX,
        [-1, 1],
        [point.originX - noiseMultiplier, point.originX + noiseMultiplier]
      );
      const y = rescale(
        nY,
        [-1, 1],
        [point.originY - noiseMultiplier, point.originY + noiseMultiplier]
      );

      point.x = x;
      point.y = y;

      point.noiseOffsetX += this.noiseStep;
      point.noiseOffsetY += this.noiseStep;
    });
  }
  stretch(mouse, elasticity) {}
}

const mouse = { x: 0, y: 0 };
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const path = document.querySelector(".hero__visual svg path");
const noiseFun = createNoise2D();
const nPoints = 6;
const radius = 75;
const noiseMultiplier = 20;
const noiseStep = 0.003;
const hueNoiseOffsetStep = noiseStep / 6;

const blob = new Blob(nPoints, radius, noiseFun, noiseStep);
let hueNoiseOffset = 0;

(function animate() {
  path.setAttribute("d", spline(blob.points, 1, true));
  blob.applyNoise(noiseMultiplier);

  const hueNoise = noiseFun(hueNoiseOffset, hueNoiseOffset);
  const hue = rescale(hueNoise, [-1, 1], [0, 360]);

  document.documentElement.style.setProperty(
    "--startColor",
    `hsl(${hue}, 100%, 75%)`
  );
  document.documentElement.style.setProperty(
    "--stopColor",
    `hsl(${hue + 60}, 100%, 75%)`
  );

  hueNoiseOffset += hueNoiseOffsetStep;

  requestAnimationFrame(animate);
})();
