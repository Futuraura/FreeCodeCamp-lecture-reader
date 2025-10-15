/**
 * Lectify - Modular FreeCodeCamp Lecture Reader
 * Main entry point
 */

import { b, cE, L, ensureGooFilter } from "./utils/dom.js";
import { externalLibraries, loadConfig, hasConfig } from "./config/lectify-settings.js";
import { waitForContent } from "./utils/contentParser.js";
import { injectStyles } from "./styles/stylesInjector.js";
import { showSuccessToast, showInfoToast } from "./ui/toast.js";

/**
 * Load external libraries with error handling and async coordination
 * @returns {Promise<Object>} Object containing loaded library status
 */
async function loadExternalLibraries() {
  console.log("📚 Loading external libraries...");

  const loadPromises = [
    // GSAP for animations
    new Promise((resolve, reject) => {
      const script = L("s", externalLibraries.gsap);
      script.onload = () => resolve({ name: "GSAP", success: true });
      script.onerror = () => reject(new Error("Failed to load GSAP"));
    }),
    // SimpleBar CSS
    new Promise((resolve) => {
      const link = L("l", externalLibraries.simplebar.css);
      link.onload = () => resolve({ name: "SimpleBar CSS", success: true });
      link.onerror = () => resolve({ name: "SimpleBar CSS", success: false });
    }),
    // SimpleBar JS
    new Promise((resolve, reject) => {
      const script = L("s", externalLibraries.simplebar.js);
      script.onload = () => resolve({ name: "SimpleBar JS", success: true });
      script.onerror = () => reject(new Error("Failed to load SimpleBar JS"));
    }),
    // Coloris CSS
    new Promise((resolve) => {
      const link = L("l", externalLibraries.coloris.css);
      link.onload = () => resolve({ name: "Coloris CSS", success: true });
      link.onerror = () => resolve({ name: "Coloris CSS", success: false });
    }),
    // Coloris JS
    new Promise((resolve, reject) => {
      const script = L("s", externalLibraries.coloris.js);
      script.onload = () => resolve({ name: "Coloris JS", success: true });
      script.onerror = () => reject(new Error("Failed to load Coloris JS"));
    }),
  ];

  try {
    const results = await Promise.all(loadPromises);
    const allLoaded = results.every((r) => r.success);

    if (allLoaded) {
      console.log("✅ All external libraries loaded successfully");
    } else {
      const failed = results.filter((r) => !r.success).map((r) => r.name);
      console.warn("⚠️ Some libraries failed to load:", failed);
    }

    return { success: allLoaded, results };
  } catch (error) {
    console.error("❌ Critical library loading error:", error);
    throw error;
  }
}

/**
 * Show user-friendly error dialog with retry and report options
 * @param {Error} error - The error that occurred
 * @param {Function} retryCallback - Function to call when user clicks retry
 * @param {string} errorContext - Context description (e.g., "loading content")
 */
function showErrorDialog(error, retryCallback, errorContext = "operation") {
  // Log full error for debugging
  console.error(`❌ Error during ${errorContext}:`, error);

  // Create overlay
  const overlay = cE("div");
  overlay.className = "fcc-error-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    animation: fadeIn 0.3s ease-in-out;
  `;

  // Create modal container
  const modal = cE("div");
  modal.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    color: #ffffff;
    animation: slideIn 0.3s ease-out;
  `;

  // Error icon
  const icon = cE("div");
  icon.style.cssText = `
    font-size: 48px;
    text-align: center;
    margin-bottom: 16px;
  `;
  icon.textContent = "⚠️";

  // Title
  const title = cE("h2");
  title.style.cssText = `
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    color: #ff6b6b;
  `;
  title.textContent = "Lectify Error";

  // Message
  const message = cE("p");
  message.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 16px;
    line-height: 1.6;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
  `;
  message.textContent = `Failed to load lecture content. This might be due to a slow network connection or the page not being fully loaded.`;

  // Error details
  const details = cE("div");
  details.style.cssText = `
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 12px;
    margin: 16px 0;
    font-size: 13px;
    font-family: 'Courier New', monospace;
    color: #ff9999;
    word-break: break-word;
    max-height: 100px;
    overflow-y: auto;
  `;
  details.textContent = `Error: ${error.message || error.toString()}`;

  // Button container
  const buttonContainer = cE("div");
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    margin-top: 24px;
  `;

  // Retry button
  const retryBtn = cE("button");
  retryBtn.className = "fcc-error-btn-retry";
  retryBtn.style.cssText = `
    flex: 1;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
  `;
  retryBtn.textContent = "🔄 Retry";
  retryBtn.onmouseover = () => (retryBtn.style.transform = "translateY(-2px)");
  retryBtn.onmouseout = () => (retryBtn.style.transform = "translateY(0)");
  retryBtn.onclick = async () => {
    retryBtn.disabled = true;
    reportBtn.disabled = true;
    retryBtn.textContent = "⏳ Retrying...";
    retryBtn.style.opacity = "0.6";
    retryBtn.style.cursor = "not-allowed";

    try {
      // Close modal
      overlay.remove();

      // Invoke retry callback
      await retryCallback();
    } catch (retryError) {
      // Re-show error dialog if retry fails
      showErrorDialog(retryError, retryCallback, errorContext);
    }
  };

  // Report button
  const reportBtn = cE("button");
  reportBtn.className = "fcc-error-btn-report";
  reportBtn.style.cssText = `
    flex: 1;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
  `;
  reportBtn.textContent = "📧 Report Issue";
  reportBtn.onmouseover = () => {
    reportBtn.style.background = "rgba(255, 255, 255, 0.15)";
    reportBtn.style.borderColor = "rgba(255, 255, 255, 0.3)";
  };
  reportBtn.onmouseout = () => {
    reportBtn.style.background = "rgba(255, 255, 255, 0.1)";
    reportBtn.style.borderColor = "rgba(255, 255, 255, 0.2)";
  };
  reportBtn.onclick = () => {
    const errorReport = encodeURIComponent(
      `Lectify Error Report\n\n` +
        `Context: ${errorContext}\n` +
        `Error: ${error.message || error.toString()}\n` +
        `Stack: ${error.stack || "N/A"}\n` +
        `URL: ${window.location.href}\n` +
        `User Agent: ${navigator.userAgent}\n` +
        `Time: ${new Date().toISOString()}`
    );

    // Open mailto link
    window.location.href = `mailto:support@example.com?subject=Lectify%20Error%20Report&body=${errorReport}`;

    // Also send to console for copy-paste
    console.log("📧 Error Report (copy if email doesn't open):\n", decodeURIComponent(errorReport));
  };

  // Add animations
  const style = cE("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Assemble modal
  modal.appendChild(icon);
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(details);
  buttonContainer.appendChild(retryBtn);
  buttonContainer.appendChild(reportBtn);
  modal.appendChild(buttonContainer);
  overlay.appendChild(modal);

  // Add to page
  b.appendChild(overlay);
}

// Initialize the application
(async function initLectify() {
  "use strict";

  console.log("🎓 Lectify - FreeCodeCamp Lecture Reader");
  console.log("📦 Modular version initialized");

  // Load external libraries before proceeding
  try {
    await loadExternalLibraries();
  } catch (error) {
    console.error("❌ Failed to load required libraries. Some features may not work.");
    // Continue with degraded functionality rather than failing completely
  }

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
