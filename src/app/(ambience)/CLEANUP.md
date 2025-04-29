# Cleanup Instructions

After the ambience player refactoring, these files are no longer used and can be safely deleted:

1. **`src/infrastructure/lib/audioService.ts`**

   - This file has been replaced by direct audio handling in the AmbiencePlayer component
   - All audio functionality is now contained within the component

2. **`src/application/hooks/useAmbiencePlayer.ts`**
   - This hook is no longer needed as all logic is integrated into the component
   - State management is handled via Jotai atoms and component effects

## Verification Steps

Before deletion, ensure:

1. The ambience player works correctly when opened
2. Audio stops completely when the window is closed
3. Audio continues playing when the window is minimized
4. Volume and track selection persist between sessions

## Implementation Details

The refactored ambience player now:

1. Uses a direct reference to the Audio API via `new Audio()`
2. Manages its lifecycle within the component
3. Cleans up resources when unmounted (window closed)
4. Uses simplified Jotai atoms for state persistence
