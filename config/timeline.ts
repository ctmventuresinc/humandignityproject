// Timeline step timing configuration
export const TIMELINE_TIMINGS = {
  // Countdown steps (3, 2, 1)
  COUNTDOWN_DURATION: 1000, // 1 second per countdown number
  
  // Scanning step
  SCANNING_DURATION: 3000, // 3 seconds for scan line animation
  
  // Calculating step  
  CALCULATING_DURATION: 1000, // 1 second for calculating
  
  // Result display step
  RESULT_DISPLAY_DURATION: 3000, // 3 seconds to show mogged/mogging result
  
  // Waiting for input step (pause before loop restart)
  LOOP_PAUSE_DURATION: 2000, // 2 seconds pause before restarting
  
  // Waiting step (auto restart)
  WAITING_DURATION: 1000, // 1 second before auto-restarting loop
  
  // Scan line animation
  SCAN_LINE_DURATION: 3000, // Should match SCANNING_DURATION for smooth animation
} as const;

// Other timeline-related constants
export const TIMELINE_CONFIG = {
  // Auto-advance behavior
  AUTO_ADVANCE_ENABLED: true,
  
  // Debug mode (shows step controls)
  DEBUG_MODE: true,
} as const;
