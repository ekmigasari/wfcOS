import {
  alongUp,
  FACE_OVAL,
  type FaceGeometry,
  mid,
  withFaceSpace,
} from "./faceGeometry";

// All prop drawings use face-local units (1 = face width, y grows down the face).
// Hats are drawn with their bottom edge at y = 0 and anchored at the forehead.

type Ctx = CanvasRenderingContext2D;

// Landmark 10 sits at the upper forehead, below the hairline, so head
// accessories are lifted and scaled up to sit on top of the hair.
const HEAD_LIFT = 0.1; // Extra lift, as a fraction of face height
const HEAD_SCALE = 1.3;

const hatAnchor = (face: FaceGeometry, lift = 0.02) =>
  alongUp(face.top, face, face.faceHeight * (lift + HEAD_LIFT));

// Face space anchored above the forehead and scaled for head accessories
const withHeadSpace = (
  ctx: Ctx,
  face: FaceGeometry,
  lift: number,
  draw: () => void
) =>
  withFaceSpace(ctx, face, hatAnchor(face, lift), () => {
    ctx.scale(HEAD_SCALE, HEAD_SCALE);
    draw();
  });

// Half of the eye spacing in face units
const eyeOffset = (face: FaceGeometry) => face.eyeDistance / face.faceWidth / 2;

const circle = (ctx: Ctx, x: number, y: number, r: number, fill: string) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
};

const outline = (ctx: Ctx, color = "rgba(0,0,0,0.35)", width = 0.012) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.stroke();
};

// --- Hats -------------------------------------------------------------

export const drawPartyHat = (ctx: Ctx, face: FaceGeometry) =>
  withHeadSpace(ctx, face, 0.02, () => {
    ctx.rotate(-0.18);
    const w = 0.62;
    const h = 0.8;
    const cone = new Path2D();
    cone.moveTo(-w / 2, 0);
    cone.lineTo(0, -h);
    cone.lineTo(w / 2, 0);
    cone.quadraticCurveTo(0, 0.08, -w / 2, 0);
    cone.closePath();
    ctx.save();
    ctx.clip(cone);
    ctx.fillStyle = "#ff5d8f";
    ctx.fillRect(-w, -h - 0.1, w * 2, h + 0.3);
    ctx.strokeStyle = "#ffd23f";
    ctx.lineWidth = 0.07;
    for (let i = -6; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 0.16, 0.1);
      ctx.lineTo(i * 0.16 + 0.5, -h);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.012;
    ctx.lineJoin = "round";
    ctx.stroke(cone);
    // Zigzag trim
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const x = -w / 2 + (w * i) / 10;
      ctx.lineTo(x, i % 2 ? -0.02 : 0.05);
    }
    ctx.strokeStyle = "#3ec1d3";
    ctx.lineWidth = 0.035;
    ctx.stroke();
    circle(ctx, 0, -h, 0.075, "#ffd23f");
    circle(ctx, -0.02, -h - 0.02, 0.03, "#fff3b0");
  });

export const drawCrown = (ctx: Ctx, face: FaceGeometry) =>
  withHeadSpace(ctx, face, 0.01, () => {
    const w = 0.78;
    const h = 0.38;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    const spikes = 5;
    for (let i = 0; i <= spikes * 2; i++) {
      const x = -w / 2 + (w * i) / (spikes * 2);
      ctx.lineTo(x, i % 2 ? -h * 0.55 : -h);
    }
    ctx.lineTo(w / 2, 0);
    ctx.closePath();
    const gold = ctx.createLinearGradient(0, -h, 0, 0);
    gold.addColorStop(0, "#fff1a8");
    gold.addColorStop(0.5, "#f7c948");
    gold.addColorStop(1, "#c98a0c");
    ctx.fillStyle = gold;
    ctx.fill();
    outline(ctx, "#8a5a00", 0.014);
    ctx.fillStyle = "#c98a0c";
    ctx.fillRect(-w / 2, -0.09, w, 0.09);
    const gems = ["#e63946", "#2a9df4", "#2ec27e", "#2a9df4", "#e63946"];
    // Pearls on each spike tip, gems along the band
    for (let i = 0; i <= spikes; i++) {
      circle(ctx, -w / 2 + (w * i) / spikes, -h, 0.03, "#fff8e1");
    }
    gems.forEach((color, i) => {
      circle(ctx, -w / 2 + (w * (i + 0.5)) / spikes, -0.045, 0.028, color);
    });
  });

export const drawCowboyHat = (ctx: Ctx, face: FaceGeometry) =>
  withHeadSpace(ctx, face, 0.06, () => {
    const leather = ctx.createLinearGradient(0, -0.55, 0, 0.05);
    leather.addColorStop(0, "#b07a44");
    leather.addColorStop(1, "#6b4423");
    // Crown with a center dent
    ctx.beginPath();
    ctx.moveTo(-0.36, 0);
    ctx.bezierCurveTo(-0.42, -0.35, -0.3, -0.52, -0.12, -0.5);
    ctx.quadraticCurveTo(0, -0.42, 0.12, -0.5);
    ctx.bezierCurveTo(0.3, -0.52, 0.42, -0.35, 0.36, 0);
    ctx.closePath();
    ctx.fillStyle = leather;
    ctx.fill();
    outline(ctx, "#3d2410");
    ctx.fillStyle = "#3d2410";
    ctx.fillRect(-0.37, -0.12, 0.74, 0.08);
    // Brim curling up at both ends
    ctx.beginPath();
    ctx.moveTo(-0.78, -0.16);
    ctx.quadraticCurveTo(-0.6, 0.02, 0, 0.03);
    ctx.quadraticCurveTo(0.6, 0.02, 0.78, -0.16);
    ctx.quadraticCurveTo(0.55, 0.12, 0, 0.12);
    ctx.quadraticCurveTo(-0.55, 0.12, -0.78, -0.16);
    ctx.closePath();
    ctx.fillStyle = "#8a5a30";
    ctx.fill();
    outline(ctx, "#3d2410");
  });

export const drawBeanie = (ctx: Ctx, face: FaceGeometry) =>
  withHeadSpace(ctx, face, -0.06, () => {
    const dome = new Path2D();
    dome.ellipse(0, 0, 0.56, 0.62, 0, Math.PI, Math.PI * 2);
    dome.closePath();
    ctx.fillStyle = "#e85d3a";
    ctx.fill(dome);
    ctx.save();
    ctx.clip(dome);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.025;
    for (let x = -0.5; x <= 0.5; x += 0.08) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x * 0.6, -0.62);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.012;
    ctx.stroke(dome);
    // Folded cuff
    ctx.beginPath();
    ctx.roundRect(-0.6, -0.08, 1.2, 0.2, 0.08);
    ctx.fillStyle = "#c2412a";
    ctx.fill();
    outline(ctx);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.02;
    for (let x = -0.54; x <= 0.54; x += 0.06) {
      ctx.beginPath();
      ctx.moveTo(x, -0.06);
      ctx.lineTo(x, 0.1);
      ctx.stroke();
    }
    // Pompom
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      circle(
        ctx,
        Math.cos(a) * 0.06,
        -0.66 + Math.sin(a) * 0.06,
        0.07,
        "#fff4dc"
      );
    }
    circle(ctx, 0, -0.66, 0.08, "#fffaf0");
  });

export const drawBaristaCap = (ctx: Ctx, face: FaceGeometry) =>
  withHeadSpace(ctx, face, -0.03, () => {
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.52, 0.5, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#4a2c12";
    ctx.fill();
    outline(ctx, "#1f1208");
    // Panel seams + button
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.015;
    [-0.25, 0, 0.25].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x * 1.6, 0);
      ctx.quadraticCurveTo(x, -0.35, 0, -0.5);
      ctx.stroke();
    });
    circle(ctx, 0, -0.5, 0.035, "#2f1a08");
    // Brim
    ctx.beginPath();
    ctx.moveTo(-0.56, 0.0);
    ctx.quadraticCurveTo(0, -0.06, 0.56, 0.0);
    ctx.quadraticCurveTo(0.5, 0.16, 0, 0.17);
    ctx.quadraticCurveTo(-0.5, 0.16, -0.56, 0.0);
    ctx.fillStyle = "#2f1a08";
    ctx.fill();
    // Coffee cup logo
    ctx.fillStyle = "#ecdcaf";
    ctx.beginPath();
    ctx.roundRect(-0.09, -0.26, 0.16, 0.14, [0, 0, 0.05, 0.05]);
    ctx.fill();
    ctx.lineWidth = 0.022;
    ctx.strokeStyle = "#ecdcaf";
    ctx.beginPath();
    ctx.arc(0.085, -0.2, 0.035, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.lineWidth = 0.015;
    [-0.05, 0.01].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, -0.3);
      ctx.quadraticCurveTo(x + 0.03, -0.34, x, -0.38);
      ctx.stroke();
    });
  });

// --- Eyes / face accessories -----------------------------------------

export const drawSunglasses = (ctx: Ctx, face: FaceGeometry) =>
  withFaceSpace(ctx, face, face.eyeCenter, () => {
    const e = eyeOffset(face);
    const lensW = e * 1.8;
    const lensH = e * 1.15;
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(-e + lensW / 2, -0.02);
    ctx.quadraticCurveTo(0, -0.07, e - lensW / 2, -0.02);
    ctx.moveTo(-e - lensW / 2, -0.04);
    ctx.lineTo(-0.5, -0.06);
    ctx.moveTo(e + lensW / 2, -0.04);
    ctx.lineTo(0.5, -0.06);
    ctx.stroke();
    [-e, e].forEach((x) => {
      const lens = ctx.createLinearGradient(0, -lensH / 2, 0, lensH / 2);
      lens.addColorStop(0, "#3a3a3a");
      lens.addColorStop(1, "#050505");
      ctx.beginPath();
      ctx.roundRect(x - lensW / 2, -lensH / 2, lensW, lensH, [
        lensH * 0.2,
        lensH * 0.2,
        lensH * 0.5,
        lensH * 0.5,
      ]);
      ctx.fillStyle = lens;
      ctx.fill();
      outline(ctx, "#000", 0.025);
      ctx.beginPath();
      ctx.moveTo(x - lensW * 0.3, -lensH * 0.25);
      ctx.lineTo(x - lensW * 0.1, -lensH * 0.25);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 0.02;
      ctx.stroke();
    });
  });

const heartPath = (ctx: Ctx, x: number, y: number, size: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(
    x - size,
    y - size * 0.3,
    x - size * 0.4,
    y - size,
    x,
    y - size * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.4,
    y - size,
    x + size,
    y - size * 0.3,
    x,
    y + size * 0.35
  );
  ctx.closePath();
};

export const drawHeartGlasses = (ctx: Ctx, face: FaceGeometry) =>
  withFaceSpace(ctx, face, face.eyeCenter, () => {
    const e = eyeOffset(face);
    const size = e * 1.2;
    ctx.strokeStyle = "#d6336c";
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(-e * 0.4, -0.04);
    ctx.quadraticCurveTo(0, -0.08, e * 0.4, -0.04);
    ctx.moveTo(-e - size * 0.8, -0.05);
    ctx.lineTo(-0.5, -0.07);
    ctx.moveTo(e + size * 0.8, -0.05);
    ctx.lineTo(0.5, -0.07);
    ctx.stroke();
    [-e, e].forEach((x) => {
      heartPath(ctx, x, 0.02, size);
      ctx.fillStyle = "rgba(255, 105, 160, 0.82)";
      ctx.fill();
      outline(ctx, "#d6336c", 0.03);
      circle(
        ctx,
        x - size * 0.35,
        -size * 0.25,
        size * 0.1,
        "rgba(255,255,255,0.7)"
      );
    });
  });

export const drawMustache = (ctx: Ctx, face: FaceGeometry) => {
  const anchor = mid(face.noseBottom, face.mouthCenter);
  withFaceSpace(ctx, face, anchor, () => {
    const w = (face.mouthWidth / face.faceWidth) * 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -0.02);
    ctx.bezierCurveTo(w * 0.4, -0.08, w * 0.8, -0.02, w, 0.0);
    ctx.bezierCurveTo(w * 1.25, 0.01, w * 1.3, -0.12, w * 1.12, -0.14);
    ctx.bezierCurveTo(w * 1.3, -0.06, w * 1.1, 0.07, w * 0.75, 0.05);
    ctx.bezierCurveTo(w * 0.45, 0.04, w * 0.2, 0.05, 0, 0.03);
    ctx.bezierCurveTo(-w * 0.2, 0.05, -w * 0.45, 0.04, -w * 0.75, 0.05);
    ctx.bezierCurveTo(-w * 1.1, 0.07, -w * 1.3, -0.06, -w * 1.12, -0.14);
    ctx.bezierCurveTo(-w * 1.3, -0.12, -w * 1.25, 0.01, -w, 0.0);
    ctx.bezierCurveTo(-w * 0.8, -0.02, -w * 0.4, -0.08, 0, -0.02);
    ctx.closePath();
    ctx.fillStyle = "#2b1b10";
    ctx.fill();
  });
};

// Latte-foam beard following the jaw line
const JAW = [
  93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397,
  288, 361, 323,
];

// Beard area: jaw line, then back along the lower lip so the mouth stays visible
const BEARD_TOP = [323, 291, 314, 17, 84, 61, 93];

export const drawFoamBeard = (ctx: Ctx, face: FaceGeometry) => {
  const outline = new Path2D();
  [...JAW, ...BEARD_TOP].forEach((index, i) => {
    const p = face.points[index];
    if (i === 0) outline.moveTo(p.x, p.y);
    else outline.lineTo(p.x, p.y);
  });
  outline.closePath();

  // Fill the area with overlapping foam puffs on a jittered grid
  const r = face.faceWidth * 0.06;
  const xs = [...JAW, ...BEARD_TOP].map((i) => face.points[i].x);
  const ys = [...JAW, ...BEARD_TOP].map((i) => face.points[i].y);
  const puffs: { x: number; y: number; size: number }[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let y = Math.min(...ys) - r; y <= Math.max(...ys) + r; y += r * 0.9) {
    for (let x = Math.min(...xs) - r; x <= Math.max(...xs) + r; x += r * 0.9) {
      const px = x + (rand() - 0.5) * r * 0.6;
      const py = y + (rand() - 0.5) * r * 0.6;
      if (ctx.isPointInPath(outline, px, py)) {
        puffs.push({ x: px, y: py, size: r * (0.85 + rand() * 0.45) });
      }
    }
  }
  // Puffy edge along the jaw so it bulges past the face outline
  JAW.forEach((index) => {
    const p = face.points[index];
    puffs.push({ x: p.x, y: p.y, size: r * (1 + rand() * 0.3) });
  });

  // Shadow layer, foam layer, then a soft highlight on each puff
  ctx.fillStyle = "#d9b98c";
  puffs.forEach(({ x, y, size }) => {
    ctx.beginPath();
    ctx.arc(x, y + size * 0.25, size * 1.05, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#fbf3e4";
  puffs.forEach(({ x, y, size }) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  puffs.forEach(({ x, y, size }) => {
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  });
  // Cinnamon sprinkle
  ctx.fillStyle = "#8b5a2b";
  puffs.forEach(({ x, y, size }, i) => {
    if (i % 3) return;
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

// --- Creatures --------------------------------------------------------

const traceFaceOval = (ctx: Ctx, face: FaceGeometry) => {
  ctx.beginPath();
  FACE_OVAL.forEach((index, i) => {
    const p = face.points[index];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
};

export const drawAlien = (ctx: Ctx, face: FaceGeometry, time: number) => {
  // Green skin: recolor the face while keeping its shading
  ctx.save();
  traceFaceOval(ctx, face);
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = "#52e05a";
  ctx.fill();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(90, 255, 120, 0.6)";
  ctx.fill();
  ctx.restore();

  // Huge slanted eyes
  [face.eyeLeft, face.eyeRight].forEach((eye, i) => {
    withFaceSpace(ctx, face, eye, () => {
      const tilt = i === 0 ? -0.5 : 0.5;
      ctx.beginPath();
      ctx.ellipse(
        i === 0 ? -0.02 : 0.02,
        -0.01,
        0.2,
        0.11,
        tilt,
        0,
        Math.PI * 2
      );
      const glossy = ctx.createRadialGradient(-0.04, -0.05, 0.01, 0, 0, 0.2);
      glossy.addColorStop(0, "#3a3a4a");
      glossy.addColorStop(1, "#000");
      ctx.fillStyle = glossy;
      ctx.fill();
      circle(
        ctx,
        i === 0 ? -0.07 : -0.03,
        -0.05,
        0.03,
        "rgba(255,255,255,0.85)"
      );
    });
  });

  // Wobbly antennae
  withHeadSpace(ctx, face, -0.08, () => {
    const wobble = Math.sin(time / 250) * 0.04;
    [-1, 1].forEach((side) => {
      const tipX = side * 0.28 + wobble;
      const tipY = -0.5;
      ctx.beginPath();
      ctx.moveTo(side * 0.12, 0.02);
      ctx.quadraticCurveTo(side * 0.1, -0.3, tipX, tipY);
      ctx.strokeStyle = "#2fbf3a";
      ctx.lineWidth = 0.035;
      ctx.lineCap = "round";
      ctx.stroke();
      circle(ctx, tipX, tipY, 0.065, "#7cff6b");
      circle(ctx, tipX - 0.02, tipY - 0.02, 0.022, "#eaffd9");
    });
  });
};

export const drawCat = (ctx: Ctx, face: FaceGeometry) => {
  withHeadSpace(ctx, face, 0.02, () => {
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(side * 0.12, 0.04);
      ctx.lineTo(side * 0.36, -0.42);
      ctx.lineTo(side * 0.5, 0.06);
      ctx.closePath();
      ctx.fillStyle = "#3b2a20";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(side * 0.2, 0.02);
      ctx.lineTo(side * 0.36, -0.3);
      ctx.lineTo(side * 0.44, 0.03);
      ctx.closePath();
      ctx.fillStyle = "#ff9fb5";
      ctx.fill();
    });
  });
  withFaceSpace(ctx, face, face.nose, () => {
    ctx.beginPath();
    ctx.moveTo(-0.06, -0.03);
    ctx.lineTo(0.06, -0.03);
    ctx.lineTo(0, 0.04);
    ctx.closePath();
    ctx.fillStyle = "#ff6f91";
    ctx.fill();
    outline(ctx, "#b03a5b", 0.01);
    ctx.strokeStyle = "rgba(30,20,15,0.85)";
    ctx.lineWidth = 0.012;
    ctx.lineCap = "round";
    [-1, 1].forEach((side) => {
      [-0.05, 0.02, 0.09].forEach((dy, i) => {
        ctx.beginPath();
        ctx.moveTo(side * 0.12, 0.06 + i * 0.025);
        ctx.quadraticCurveTo(
          side * 0.3,
          0.04 + dy,
          side * 0.48,
          0.02 + dy * 1.6
        );
        ctx.stroke();
      });
    });
  });
};

export const drawDevilHorns = (ctx: Ctx, face: FaceGeometry) =>
  withHeadSpace(ctx, face, 0.0, () => {
    [-1, 1].forEach((side) => {
      const horn = ctx.createLinearGradient(side * 0.2, 0, side * 0.42, -0.4);
      horn.addColorStop(0, "#9b111e");
      horn.addColorStop(1, "#ff3b3b");
      ctx.beginPath();
      ctx.moveTo(side * 0.14, 0.04);
      ctx.quadraticCurveTo(side * 0.2, -0.22, side * 0.44, -0.4);
      ctx.quadraticCurveTo(side * 0.36, -0.14, side * 0.34, 0.06);
      ctx.closePath();
      ctx.fillStyle = horn;
      ctx.fill();
      outline(ctx, "#5c0a12", 0.012);
    });
  });

export const drawBunny = (ctx: Ctx, face: FaceGeometry) => {
  withHeadSpace(ctx, face, -0.02, () => {
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * 0.2, -0.05);
      ctx.rotate(side * 0.16);
      ctx.beginPath();
      ctx.ellipse(0, -0.42, 0.12, 0.44, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#fbfbfb";
      ctx.fill();
      outline(ctx, "rgba(0,0,0,0.2)");
      ctx.beginPath();
      ctx.ellipse(0, -0.42, 0.06, 0.33, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#ffb3c7";
      ctx.fill();
      ctx.restore();
    });
  });
  withFaceSpace(ctx, face, face.nose, () => {
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.05, 0.035, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ff8fab";
    ctx.fill();
  });
  // Buck teeth just under the upper lip
  withFaceSpace(ctx, face, face.points[13], () => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.008;
    [-0.052, 0.002].forEach((x) => {
      ctx.beginPath();
      ctx.roundRect(x, -0.01, 0.05, 0.09, [0, 0, 0.015, 0.015]);
      ctx.fill();
      ctx.stroke();
    });
  });
};
