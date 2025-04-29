# Ambience Player

The Ambience Player is a simple audio player that provides ambient soundscapes to enhance the user experience.

## Architecture

The player now uses a simplified architecture:

1. **Atoms** (`src/application/atoms/ambiencePlayerAtom.ts`):

   - Defines available sounds
   - Manages persistent state with Jotai
   - Handles storage in localStorage

2. **UI Component** (`src/app/(ambience)/ambiencePlayer.tsx`):
   - Contains all audio handling logic directly
   - No separate audio service or hooks
   - Direct management of the audio element

## Behavior

- **Window Open**: Audio plays only when the window is open (showing UI)
- **Window Minimize**: Window minimization has no effect on audio playback
- **Window Close**: Audio stops completely when the window is closed
- **State Persistence**: Volume and selected sound are remembered between sessions

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
