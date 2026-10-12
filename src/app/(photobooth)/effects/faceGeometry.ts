import type { FaceLandmarks, Point } from "./faceTracker";

// MediaPipe face mesh landmark indices
const LM = {
  foreheadTop: 10,
  chin: 152,
  faceLeft: 234,
  faceRight: 454,
  noseTip: 1,
  noseBottom: 2,
  upperLip: 13,
  lowerLip: 14,
  mouthLeft: 61,
  mouthRight: 291,
  eyeAOuter: 33,
  eyeAInner: 133,
  eyeBInner: 362,
  eyeBOuter: 263,
  irisA: 468,
  irisB: 473,
} as const;

// Ordered outline of the face, used for skin effects (alien tint)
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];

export interface FaceGeometry {
  points: FaceLandmarks;
  eyeLeft: Point; // Eye on the left side of the image
  eyeRight: Point;
  eyeCenter: Point;
  eyeDistance: number;
  roll: number; // Head tilt in radians
  up: Point; // Unit vector towards the top of the head
  faceWidth: number;
  faceHeight: number;
  faceCenter: Point;
  top: Point;
  chin: Point;
  nose: Point;
  noseBottom: Point;
  mouthCenter: Point;
  mouthWidth: number;
  mouthOpen: number;
}

export const mid = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const getFaceGeometry = (points: FaceLandmarks): FaceGeometry => {
  const hasIris = points.length > LM.irisB;
  const eyeA = hasIris
    ? points[LM.irisA]
    : mid(points[LM.eyeAOuter], points[LM.eyeAInner]);
  const eyeB = hasIris
    ? points[LM.irisB]
    : mid(points[LM.eyeBInner], points[LM.eyeBOuter]);
  const [eyeLeft, eyeRight] = eyeA.x <= eyeB.x ? [eyeA, eyeB] : [eyeB, eyeA];
  const roll = Math.atan2(eyeRight.y - eyeLeft.y, eyeRight.x - eyeLeft.x);
  const top = points[LM.foreheadTop];
  const chin = points[LM.chin];
  const mouthLeft = points[LM.mouthLeft];
  const mouthRight = points[LM.mouthRight];

  return {
    points,
    eyeLeft,
    eyeRight,
    eyeCenter: mid(eyeLeft, eyeRight),
    eyeDistance: dist(eyeLeft, eyeRight),
    roll,
    up: { x: Math.sin(roll), y: -Math.cos(roll) },
    faceWidth: dist(points[LM.faceLeft], points[LM.faceRight]),
    faceHeight: dist(top, chin),
    faceCenter: mid(top, chin),
    top,
    chin,
    nose: points[LM.noseTip],
    noseBottom: points[LM.noseBottom],
    mouthCenter: mid(points[LM.upperLip], points[LM.lowerLip]),
    mouthWidth: dist(mouthLeft, mouthRight),
    mouthOpen: dist(points[LM.upperLip], points[LM.lowerLip]),
  };
};

// Moves a point along the head's "up" axis (negative = down)
export const alongUp = (
  p: Point,
  face: FaceGeometry,
  amount: number
): Point => ({
  x: p.x + face.up.x * amount,
  y: p.y + face.up.y * amount,
});

/**
 * Runs `draw` in a face-local space: origin at `anchor`, rotated with the head,
 * and scaled so 1 unit = face width. Positive y points down the face.
 */
export const withFaceSpace = (
  ctx: CanvasRenderingContext2D,
  face: FaceGeometry,
  anchor: Point,
  draw: () => void
) => {
  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.rotate(face.roll);
  ctx.scale(face.faceWidth, face.faceWidth);
  draw();
  ctx.restore();
};
