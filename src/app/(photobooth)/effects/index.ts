import type { FaceGeometry } from "./faceGeometry";
import {
  fxCoffeeSteam,
  fxHalftone,
  fxKaleidoscope,
  fxMirrorTwin,
  fxPixelate,
} from "./photoFx";
import {
  drawAlien,
  drawBaristaCap,
  drawBeanie,
  drawBunny,
  drawCat,
  drawCowboyHat,
  drawCrown,
  drawDevilHorns,
  drawFoamBeard,
  drawHeartGlasses,
  drawMustache,
  drawPartyHat,
  drawSunglasses,
} from "./props";
import {
  warpBigEyes,
  warpBigNose,
  warpSquish,
  warpSwirl,
  warpTinyFace,
  warpWideMouth,
} from "./warps";

export type EffectCategory = "props" | "creatures" | "warps" | "fx";

type Ctx = CanvasRenderingContext2D;

export interface PhotoEffect {
  id: string;
  name: string;
  icon: string; // Emoji shown in the picker
  category: EffectCategory;
  needsFace: boolean;
  apply: (ctx: Ctx, faces: FaceGeometry[], time: number) => void;
}

export const EFFECT_CATEGORIES: { id: EffectCategory; name: string }[] = [
  { id: "props", name: "Props" },
  { id: "creatures", name: "Creatures" },
  { id: "warps", name: "Funny Face" },
  { id: "fx", name: "Photo FX" },
];

const perFace =
  (draw: (ctx: Ctx, face: FaceGeometry, time: number) => void) =>
  (ctx: Ctx, faces: FaceGeometry[], time: number) =>
    faces.forEach((face) => draw(ctx, face, time));

const faceEffect = (
  id: string,
  name: string,
  icon: string,
  category: EffectCategory,
  draw: (ctx: Ctx, face: FaceGeometry, time: number) => void
): PhotoEffect => ({
  id,
  name,
  icon,
  category,
  needsFace: true,
  apply: perFace(draw),
});

const frameEffect = (
  id: string,
  name: string,
  icon: string,
  apply: (ctx: Ctx, time: number) => void
): PhotoEffect => ({
  id,
  name,
  icon,
  category: "fx",
  needsFace: false,
  apply: (ctx, _faces, time) => apply(ctx, time),
});

export const NO_EFFECT_ID = "none";

export const PHOTO_EFFECTS: PhotoEffect[] = [
  faceEffect("party-hat", "Party Hat", "🥳", "props", drawPartyHat),
  faceEffect("crown", "Crown", "👑", "props", drawCrown),
  faceEffect("cowboy", "Cowboy", "🤠", "props", drawCowboyHat),
  faceEffect("beanie", "Beanie", "🧶", "props", drawBeanie),
  faceEffect("barista-cap", "Barista Cap", "🧢", "props", drawBaristaCap),
  faceEffect("sunglasses", "Shades", "😎", "props", drawSunglasses),
  faceEffect("heart-glasses", "Heart Eyes", "😍", "props", drawHeartGlasses),
  faceEffect("mustache", "Mustache", "🧔", "props", drawMustache),
  faceEffect("foam-beard", "Foam Beard", "☕", "props", drawFoamBeard),

  faceEffect("alien", "Alien", "👽", "creatures", drawAlien),
  faceEffect("cat", "Cat", "🐱", "creatures", drawCat),
  faceEffect("devil", "Devil", "😈", "creatures", drawDevilHorns),
  faceEffect("bunny", "Bunny", "🐰", "creatures", drawBunny),

  faceEffect("big-eyes", "Big Eyes", "👀", "warps", warpBigEyes),
  faceEffect("tiny-face", "Tiny Face", "🐜", "warps", warpTinyFace),
  faceEffect("big-nose", "Big Nose", "👃", "warps", warpBigNose),
  faceEffect("wide-mouth", "Wide Mouth", "😁", "warps", warpWideMouth),
  faceEffect("squish", "Squish", "😖", "warps", warpSquish),
  faceEffect("swirl", "Swirl", "🌀", "warps", warpSwirl),

  frameEffect("mirror-twin", "Mirror Twin", "👯", fxMirrorTwin),
  frameEffect("kaleidoscope", "Kaleido", "🔮", fxKaleidoscope),
  frameEffect("pixelate", "Pixel", "👾", fxPixelate),
  frameEffect("halftone", "Comic", "💥", fxHalftone),
  frameEffect("coffee-steam", "Café Steam", "♨️", fxCoffeeSteam),
];

export const getEffect = (id: string | undefined): PhotoEffect | null =>
  PHOTO_EFFECTS.find((effect) => effect.id === id) ?? null;
