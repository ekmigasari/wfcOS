// Timer Web Worker
// This worker runs in a separate thread and continues even when the tab is inactive

let timerId = null;
let startTime = null;
let pausedTimeRemaining = null;
let isRunning = false;

// Handle messages from the main thread
self.onmessage = function (e) {
  const { command, timeRemaining } = e.data;

  switch (command) {
    case "start":
      // Start or resume the timer
      startTimer(timeRemaining);
      break;

    case "pause":
      // Pause the timer
      pauseTimer();
      break;

    case "reset":
      // Reset the timer
      resetTimer();
      break;

    case "check":
      // Check and report current time remaining
      reportTimeRemaining();
      break;
  }
};

// Start the timer with given time remaining in seconds
function startTimer(timeRemaining) {
  // Clear any existing timer
  if (timerId) {
    clearInterval(timerId);
  }

  isRunning = true;
  startTime = Date.now();
  pausedTimeRemaining = timeRemaining;

  // Send initial time
  self.postMessage({
    type: "tick",
    timeRemaining: pausedTimeRemaining,
  });

  // Set up interval to update time remaining
  timerId = setInterval(() => {
    if (isRunning) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const newTimeRemaining = Math.max(
        0,
        pausedTimeRemaining - elapsedSeconds
      );

      // Send updated time to main thread
      self.postMessage({
        type: "tick",
        timeRemaining: newTimeRemaining,
      });

      // If timer completed
      if (newTimeRemaining === 0) {
        self.postMessage({ type: "complete" });
        resetTimer();
      }
    }
  }, 1000);
}

// Pause the timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;

    // Calculate time remaining at pause point
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    pausedTimeRemaining = Math.max(0, pausedTimeRemaining - elapsedSeconds);

    // Report the paused time
    self.postMessage({
      type: "paused",
      timeRemaining: pausedTimeRemaining,
    });

    // Clear the interval
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
}

// Reset the timer
function resetTimer() {
  isRunning = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  startTime = null;
  pausedTimeRemaining = null;

  self.postMessage({ type: "reset" });
}

// Report current time without changing state
function reportTimeRemaining() {
  if (isRunning && startTime && pausedTimeRemaining !== null) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const currentTimeRemaining = Math.max(
      0,
      pausedTimeRemaining - elapsedSeconds
    );

    self.postMessage({
      type: "status",
      timeRemaining: currentTimeRemaining,
      isRunning,
    });
  } else if (pausedTimeRemaining !== null) {
    self.postMessage({
      type: "status",
      timeRemaining: pausedTimeRemaining,
      isRunning,
    });
  } else {
    self.postMessage({
      type: "status",
      timeRemaining: 0,
      isRunning: false,
    });
  }
}
