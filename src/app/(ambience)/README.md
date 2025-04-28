# Ambience Player

The Ambience Player is a background audio player that provides ambient soundscapes to enhance the user experience.

## Architecture

The player has been refactored into several components:

1. **Audio Service** (`src/infrastructure/lib/audioService.ts`):

   - Manages the global audio element
   - Handles audio operations safely with a queue
   - Provides utility functions for audio control

2. **Custom Hook** (`src/application/hooks/useAmbiencePlayer.ts`):

   - Manages player state and behavior logic
   - Handles audio lifecycle
   - Provides a clean API for components

3. **UI Component** (`src/app/(ambience)/ambiencePlayer.tsx`):
   - Renders the player interface
   - Uses the custom hook for all logic
   - Focuses solely on UI concerns

## Behavior

- **Window Close**: When the player window is closed, audio playback stops completely.
- **Window Minimize**: When the player window is minimized but not closed, audio continues to play in the background.
- **Page Unload**: Audio stops when the page unloads (navigation away or closing browser).

## State Management

State is managed through Jotai atoms in `src/application/atoms/ambiencePlayerAtom.ts`:

- Player state is persisted to local storage
- State is restored when the player is reopened

## Usage

```tsx
// Import the component
import AmbiencePlayer from "@/app/(ambience)/ambiencePlayer";

// Use in your layout or page
const YourComponent = () => {
  return (
    <div>
      <AmbiencePlayer />
    </div>
  );
};
```

## Available Sounds

The ambience player includes several ambient soundscapes:

- Gentle Rain
- Forest Sounds
- Flowing River
- Ocean Waves
- Thunderstorm
- Calm Night
- Fireplace
- Coffee Shop
- Park Ambience
- Making a coffee
