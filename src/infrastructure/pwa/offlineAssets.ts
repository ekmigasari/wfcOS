export const OFFLINE_PACK_VERSION = "2026-03-31.1";
export const OFFLINE_PACK_VERSION_STORAGE_KEY = "wfcos-offline-pack-version";

export const DEFAULT_BACKGROUND_URL = "/background/bg-2.webp";

export const CORE_ICON_URLS = [
  "/icons/ambience.png",
  "/icons/board.png",
  "/icons/bookmark.png",
  "/icons/cafe.png",
  "/icons/camera.png",
  "/icons/clock.png",
  "/icons/coffee.png",
  "/icons/default.png",
  "/icons/doughnut.png",
  "/icons/music.png",
  "/icons/news.png",
  "/icons/notepad.png",
  "/icons/settings.png",
  "/icons/tips.png",
  "/icons/volume.png",
  "/icons/wallpaper.png",
] as const;

export const INTERACTION_SOUND_URLS = [
  "/sounds/click.mp3",
  "/sounds/close.mp3",
  "/sounds/keyboard.mp3",
  "/sounds/loading.mp3",
  "/sounds/minimize.mp3",
  "/sounds/open.mp3",
  "/sounds/timeup.mp3",
] as const;

export const BACKGROUND_URLS = [
  "/background/bg-1.webp",
  "/background/bg-2.webp",
  "/background/bg-3.webp",
  "/background/bg-4.webp",
  "/background/bg-5.webp",
  "/background/bg-6.webp",
  "/background/bg-7.webp",
  "/background/bg-8.webp",
  "/background/bg-9.webp",
  "/background/bg-10.webp",
  "/background/bg-11.webp",
  "/background/bg-12.webp",
  "/background/bg-13.webp",
  "/background/bg-14.webp",
  "/background/bg-15.webp",
  "/background/bg-16.webp",
  "/background/bg-17.webp",
] as const;

export const AMBIENCE_SOUND_URLS = [
  "/sounds/ambience/cafe.mp3",
  "/sounds/ambience/fireplace.mp3",
  "/sounds/ambience/forest.mp3",
  "/sounds/ambience/making-a-coffee-latte.mp3",
  "/sounds/ambience/night.mp3",
  "/sounds/ambience/ocean.mp3",
  "/sounds/ambience/park.mp3",
  "/sounds/ambience/rain.mp3",
  "/sounds/ambience/river.mp3",
  "/sounds/ambience/thunder.mp3",
] as const;

export const OFFLINE_PACK_URLS = [
  ...BACKGROUND_URLS.filter((url) => url !== DEFAULT_BACKGROUND_URL),
  ...AMBIENCE_SOUND_URLS,
] as const;
