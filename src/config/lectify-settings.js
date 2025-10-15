// Configuration management for Lectify
// Handles app settings, defaults, and localStorage persistence

const STORAGE_KEY = "freecodecampLectureReader";

/**
 * Default configuration values
 */
export const defaultConfig = {
  ttsEngine: null, // 'webspeech', 'transformers', or 'piper'
  webspeech: {
    voice: "default", // 'default', 'female', or 'male'
    rate: 1, // Speech rate (0.5 to 2)
  },
  subtitle: {
    bgColor: "rgba(0, 0, 0, 0.85)",
    textColor: "#ffffff",
    highlightStyle: "text", // 'text' or 'background'
    highlightTextColor: "#ffd700",
    highlightBgColor: "#ffd700",
    bgOpacity: 85, // 0-100
    fontSize: 24, // pixels
  },
};

/**
 * Apply default values to incoming configuration
 * @param {Object} incoming - Partial configuration object
 * @returns {Object} - Complete configuration with defaults applied
 */
export function applyCfgDefaults(incoming = {}) {
  const merged = {
    ...JSON.parse(JSON.stringify(defaultConfig)),
    ...incoming,
  };

  merged.subtitle = {
    ...defaultConfig.subtitle,
    ...(incoming.subtitle || {}),
  };

  merged.webspeech = {
    ...defaultConfig.webspeech,
    ...(incoming.webspeech || {}),
  };

  return merged;
}

/**
 * Save configuration to localStorage
 * @param {Object} config - Configuration object to save
 */
export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Load configuration from localStorage
 * @returns {Object|null} - Saved configuration or null if not found
 */
export function loadConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    return applyCfgDefaults(parsed);
  } catch (error) {
    console.error("Failed to parse saved config:", error);
    return null;
  }
}

/**
 * Clear saved configuration
 */
export function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if configuration exists
 * @returns {boolean}
 */
export function hasConfig() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * External library URLs
 */
export const externalLibraries = {
  gsap: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  simplebar: {
    css: "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.css",
    js: "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js",
  },
  coloris: {
    css: "https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.css",
    js: "https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.js",
  },
};
