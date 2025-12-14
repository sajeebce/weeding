/**
 * Operating Hours Configuration
 * This can be fetched from API/database in the future
 */

export interface OperatingHoursConfig {
  enabled: boolean;
  timezone: string;
  schedule: {
    [key: string]: {
      enabled: boolean;
      start: string; // "09:00"
      end: string;   // "18:00"
    };
  };
}

// Default configuration - matches the settings UI defaults
// Set enabled: false to always show as online (useful for testing)
const DEFAULT_CONFIG: OperatingHoursConfig = {
  enabled: false, // Set to true in production to enforce operating hours
  timezone: "Asia/Dhaka",
  schedule: {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: true, start: "09:00", end: "15:00" },
    sunday: { enabled: false, start: "", end: "" },
  },
};

/**
 * Check if current time is within operating hours
 */
export function isWithinOperatingHours(config?: OperatingHoursConfig): boolean {
  // Get config from localStorage if not provided
  const activeConfig = config || getCurrentOperatingHours();

  // If operating hours are disabled, always return true (always online)
  if (!activeConfig.enabled) {
    return true;
  }

  // Get current time in the configured timezone
  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = dayNames[now.getDay()];

  const dayConfig = activeConfig.schedule[currentDay];

  // If day is disabled, return false (offline)
  if (!dayConfig || !dayConfig.enabled) {
    return false;
  }

  // Check if current time is within the day's operating hours
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // Parse start time
  const [startHours, startMinutes] = dayConfig.start.split(":").map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;

  // Parse end time
  const [endHours, endMinutes] = dayConfig.end.split(":").map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;

  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
}

/**
 * Get the default operating hours config
 */
export function getDefaultOperatingHours(): OperatingHoursConfig {
  return DEFAULT_CONFIG;
}

/**
 * Get the current operating hours config from localStorage or use default
 */
export function getCurrentOperatingHours(): OperatingHoursConfig {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIG;
  }

  try {
    const saved = localStorage.getItem("operating_hours_config");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }

  return DEFAULT_CONFIG;
}

/**
 * Save operating hours config to localStorage
 */
export function saveOperatingHours(config: OperatingHoursConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("operating_hours_config", JSON.stringify(config));
  } catch {
    // Ignore errors
  }
}

/**
 * Toggle operating hours enabled/disabled
 */
export function toggleOperatingHours(enabled: boolean): void {
  const config = getCurrentOperatingHours();
  config.enabled = enabled;
  saveOperatingHours(config);
}
