export interface Session {
  id: string; // Unique identifier for the session
  taskId: string | null; // ID of the linked task, if any
  startTime: number; // Unix timestamp (milliseconds)
  endTime: number; // Unix timestamp (milliseconds)
  duration: number; // Duration in minutes (or seconds, to be consistent with timer)
  date: string; // YYYY-MM-DD format
}
