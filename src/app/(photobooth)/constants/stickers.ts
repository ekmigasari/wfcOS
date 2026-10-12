export const EMOJI_STICKERS = [
  "☕",
  "🍩",
  "🥐",
  "🧁",
  "🍰",
  "🍪",
  "🧋",
  "🍵",
  "❤️",
  "💖",
  "💕",
  "✨",
  "⭐",
  "🌟",
  "🔥",
  "💯",
  "😎",
  "😍",
  "🥰",
  "😂",
  "🤪",
  "😘",
  "🥳",
  "🤓",
  "👑",
  "🎀",
  "🌸",
  "🌈",
  "☁️",
  "🦋",
  "🐱",
  "🐶",
  "🎉",
  "🎈",
  "📸",
  "🎧",
  "💻",
  "📚",
  "✌️",
  "👍",
];

// Pixel icons already shipped in public/icons
export const ICON_STICKERS = [
  "/icons/coffee.png",
  "/icons/cafe.png",
  "/icons/cake.png",
  "/icons/doughnut.png",
  "/icons/camera.png",
  "/icons/music.png",
  "/icons/ambience.png",
  "/icons/books.png",
  "/icons/notepad.png",
  "/icons/board.png",
  "/icons/bookmark.png",
  "/icons/clock.png",
  "/icons/coin.png",
  "/icons/tips.png",
  "/icons/globe.png",
  "/icons/phone.png",
  "/icons/news.png",
  "/icons/search.png",
  "/icons/settings.png",
  "/icons/volume.png",
  "/icons/wallpaper.png",
  "/icons/default.png",
];

export const TEXT_FONTS = [
  { id: "sans", name: "Sans", css: "'Trebuchet MS', Arial, sans-serif" },
  { id: "serif", name: "Serif", css: "Georgia, 'Times New Roman', serif" },
  { id: "mono", name: "Mono", css: "'Courier New', Courier, monospace" },
  { id: "bold", name: "Impact", css: "Impact, 'Arial Black', sans-serif" },
  {
    id: "script",
    name: "Script",
    css: "'Brush Script MT', 'Segoe Script', cursive",
  },
  {
    id: "fun",
    name: "Fun",
    css: "'Comic Sans MS', 'Comic Neue', 'Chalkboard SE', cursive",
  },
];

export const getFontCss = (id: string | undefined): string =>
  TEXT_FONTS.find((font) => font.id === id)?.css ?? TEXT_FONTS[0].css;

export const TEXT_COLORS = [
  "#2f2010",
  "#ffffff",
  "#000000",
  "#a65330",
  "#e11d48",
  "#f59e0b",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#ec4899",
];

export const EMOJI_FONT_STACK =
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
