// Full-frame effects that don't need a face

type Ctx = CanvasRenderingContext2D;

const snapshot = (ctx: Ctx) => {
  const copy = document.createElement("canvas");
  copy.width = ctx.canvas.width;
  copy.height = ctx.canvas.height;
  copy.getContext("2d")?.drawImage(ctx.canvas, 0, 0);
  return copy;
};

// Left half mirrored onto the right half
export const fxMirrorTwin = (ctx: Ctx) => {
  const { width, height } = ctx.canvas;
  const half = Math.floor(width / 2);
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(ctx.canvas, 0, 0, half, height, 0, 0, half, height);
  ctx.restore();
};

export const fxKaleidoscope = (ctx: Ctx) => {
  const { width, height } = ctx.canvas;
  const source = snapshot(ctx);
  const slices = 8;
  const step = (Math.PI * 2) / slices;
  const radius = Math.hypot(width, height) / 2;
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < slices; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(i * step);
    if (i % 2) ctx.scale(1, -1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -step / 2 - 0.01, step / 2 + 0.01);
    ctx.closePath();
    ctx.clip();
    // Sample a wedge from the middle of the frame (where the face usually is)
    ctx.drawImage(source, -cx * 0.55, -cy);
    ctx.restore();
  }
  ctx.restore();
};

export const fxPixelate = (ctx: Ctx) => {
  const { width, height } = ctx.canvas;
  const block = Math.max(6, Math.round(width / 64));
  const small = document.createElement("canvas");
  small.width = Math.ceil(width / block);
  small.height = Math.ceil(height / block);
  small
    .getContext("2d")
    ?.drawImage(ctx.canvas, 0, 0, small.width, small.height);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, width, height);
  ctx.restore();
};

// Comic-book halftone: dot size follows darkness, colors are posterized
export const fxHalftone = (ctx: Ctx) => {
  const { width, height } = ctx.canvas;
  const cell = Math.max(6, Math.round(width / 90));
  const data = ctx.getImageData(0, 0, width, height).data;

  ctx.save();
  ctx.fillStyle = "#fff6e0";
  ctx.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += cell) {
    const offset = (y / cell) % 2 ? cell / 2 : 0;
    for (let x = offset; x < width; x += cell) {
      const i =
        (Math.min(height - 1, y + (cell >> 1)) * width +
          Math.min(width - 1, Math.floor(x + cell / 2))) *
        4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const radius = (cell / 2) * Math.sqrt(1 - lum) * 1.25;
      if (radius < 0.4) continue;
      const q = (v: number) => Math.round(v / 85) * 85;
      ctx.fillStyle = `rgb(${q(r)},${q(g)},${q(b)})`;
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

// Cozy café overlay: rising steam wisps, floating beans and a warm glow
export const fxCoffeeSteam = (ctx: Ctx, time: number) => {
  const { width, height } = ctx.canvas;
  ctx.save();

  const glow = ctx.createRadialGradient(
    width / 2,
    height,
    0,
    width / 2,
    height,
    height
  );
  glow.addColorStop(0, "rgba(255, 190, 120, 0.35)");
  glow.addColorStop(1, "rgba(255, 190, 120, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const baseX = width * (0.12 + i * 0.19);
    const phase = time / 900 + i * 1.7;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.05) {
      const y = height * (1 - t);
      const x = baseX + Math.sin(t * 6 + phase) * width * 0.03 * (0.5 + t);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Wisps fade in above the bottom edge and dissolve towards the top
    const fade = ctx.createLinearGradient(0, height, 0, 0);
    fade.addColorStop(0, "rgba(255, 255, 255, 0)");
    fade.addColorStop(0.35, "rgba(255, 255, 255, 0.22)");
    fade.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.strokeStyle = fade;
    ctx.lineWidth = width * 0.03;
    ctx.stroke();
  }

  // Coffee beans drifting down
  const beans = 10;
  const size = width * 0.022;
  for (let i = 0; i < beans; i++) {
    const speed = 0.04 + ((i * 7) % 5) * 0.01;
    const y =
      (((time / 1000) * speed + i / beans) % 1) * (height + size * 4) -
      size * 2;
    const x = width * (((i * 37) % 100) / 100);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time / 1500 + i);
    ctx.fillStyle = "#5a3418";
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b170a";
    ctx.lineWidth = size * 0.18;
    ctx.beginPath();
    ctx.moveTo(-size * 0.75, 0);
    ctx.quadraticCurveTo(0, -size * 0.35, size * 0.75, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
};
