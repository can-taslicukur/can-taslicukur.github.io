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
    centerX = 100,
    centerY = 100,
    nPoints = 6,
    radius = 75,
    noiseFun = createNoise2D(),
    noiseStep = 0.005
  ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.nPoints = nPoints;
    this.radius = radius;
    this.noise = noiseFun;
    this.noiseStep = noiseStep;
    this.angleStep = (Math.PI * 2) / this.nPoints;
    this.points = Array.from({ length: nPoints }, (_, i) => {
      const theta = i * this.angleStep;

      const x = this.centerX + Math.cos(theta) * this.radius;
      const y = this.centerY + Math.sin(theta) * this.radius;

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
  applyNoise(noiseMultiplier = 20, minDistanceFactor = 0.75) {
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
  stretch(mouse, elasticity = 0.5) {
    function normalizeAngle(angle) {
      return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    const svgElement = document.querySelector(".hero__visual svg");
    const svgRect = svgElement.getBoundingClientRect();
    const svgX = ((mouse.x - svgRect.left) / svgRect.width) * 200;
    const svgY = ((mouse.y - svgRect.top) / svgRect.height) * 200;

    const dx = svgX - this.centerX;
    const dy = svgY - this.centerY;
    const mouseDistance = Math.sqrt(dx * dx + dy * dy);
    const mouseAngle = Math.atan2(dy, dx);

    this.points.forEach((point) => {
      const pointAngle = Math.atan2(
        point.originY - this.centerY,
        point.originX - this.centerX
      );

      const angleDiff = normalizeAngle(pointAngle - mouseAngle);

      const distanceFactor = Math.max(
        minDistanceFactor,
        this.radius / Math.max(mouseDistance, this.radius)
      );
      const alignmentFactor = Math.pow(Math.cos(angleDiff), 2);

      const stretchAmount = distanceFactor * elasticity * alignmentFactor;

      const dirX = Math.cos(mouseAngle);
      const dirY = Math.sin(mouseAngle);

      if (Math.abs(angleDiff) < Math.PI / 2) {
        point.x += dirX * stretchAmount;
        point.y += dirY * stretchAmount;
      } else {
        point.x -= dirX * stretchAmount * 0.2;
        point.y -= dirY * stretchAmount * 0.2;
      }
    });
  }
}

// blob params
const centerX = 100;
const centerY = 100;
const nPoints = 6;
const radius = 45;
const noiseFun = createNoise2D();
const noiseStep = 0.003;
const blob = new Blob(centerX, centerY, nPoints, radius, noiseFun, noiseStep);

// blob.applyNoise params
const noiseMultiplier = radius / 3;

// blob.stretch params
const mouse = { x: 0, y: 0 };
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
const elasticity = radius / 2;
const minDistanceFactor = 0.75;

// gradient params
const hueNoiseOffsetStep = noiseStep / 2;
let hueNoiseOffset = 0;

const path = document.querySelector(".hero__visual svg path");

(function animate() {
  path.setAttribute("d", spline(blob.points, 1, true));
  blob.applyNoise(noiseMultiplier);
  blob.stretch(mouse, elasticity, minDistanceFactor);

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
