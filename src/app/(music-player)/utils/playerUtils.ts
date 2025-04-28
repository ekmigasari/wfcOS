/**
 * Music Player utility functions
 */

// Format time as MM:SS or HH:MM:SS
export const formatTime = (seconds: number): string => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

// Get YouTube ID from URL
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Create a song title from YouTube ID if no title provided
export const createSongTitle = (videoId: string, title?: string): string => {
  if (title && title.trim() !== "") return title;
  return `YouTube Song (${videoId})`;
};

// Generate a background style gradient from played progress
export const createProgressGradient = (
  playedSeconds: number,
  duration: number
): string => {
  const percentage = (playedSeconds / (duration || 100)) * 100;
  return `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--muted) ${percentage}%, var(--muted) 100%)`;
}; 