/**
 * Lectify - Modular FreeCodeCamp Lecture Reader
 * Main entry point
 */

import { b, L, ensureGooFilter } from "./utils/dom.js";
import { externalLibraries, loadConfig, hasConfig } from "./config/lectify-settings.js";
import { waitForContent } from "./utils/contentParser.js";
import { injectStyles } from "./styles/stylesInjector.js";

// Load external libraries
const gS = L("s", externalLibraries.gsap);
const sC = L("l", externalLibraries.simplebar.css);
const sJ = L("s", externalLibraries.simplebar.js);
const cL = L("l", externalLibraries.coloris.css);
const cJ = L("s", externalLibraries.coloris.js);

// Initialize the application
(async function initLectify() {
  "use strict";

  console.log("🎓 Lectify - FreeCodeCamp Lecture Reader");
  console.log("📦 Modular version initialized");

  // Inject SVG filter for goo effect
  ensureGooFilter();

  // Inject styles
  injectStyles();

  // Check if we have saved configuration
  const savedConfig = loadConfig();

  if (savedConfig) {
    console.log("✅ Found saved configuration");
    console.log("⏳ Waiting for lecture content...");

    // Wait for content to load, then start player
    try {
      const content = await waitForContent();
      console.log("✅ Content loaded:", content.title);

      // TODO: Import and initialize player with saved config
      // import { startReturningUser } from './ui/player.js';
      // startReturningUser(savedConfig, content);

      alert(
        `Lectify Ready!\nLecture: ${content.title}\n\nNote: Full player implementation coming next!`
      );
    } catch (error) {
      console.error("❌ Failed to load content:", error);
    }
  } else {
    console.log("👋 First time user - showing configuration wizard");

    // TODO: Import and show configuration wizard
    // import { showConfigWizard } from './ui/wizard.js';
    // showConfigWizard();

    alert(
      "Lectify - Configuration Wizard\n\nNote: Wizard implementation coming next!\nFor now, check the modular code structure."
    );
  }
})();

/**
 * NEXT STEPS TO COMPLETE THE MODULARIZATION:
 *
 * 1. Extract CSS to src/styles/lectify.css
 * 2. Create src/styles/stylesInjector.js to inject the CSS
 * 3. Create src/ui/subtitles.js with SubtitleLibrary class
 * 4. Create src/ui/components.js with slider, color picker helpers
 * 5. Create src/ui/wizard.js with all configuration screens
 * 6. Create src/ui/player.js with compact player and presentation mode
 * 7. Create src/tts/engine.js with TTS logic
 *
 * Each module exports functions/classes that this main file imports and uses.
 * The build system (esbuild) bundles everything into dist/userscript.js
 */
