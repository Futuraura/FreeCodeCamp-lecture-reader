/**
 * Configuration Wizard - Multi-step configuration screens
 * Handles initial setup, model configuration, and subtitle appearance settings
 */

import { b, cE, qS, qSA, ensureGooFilter } from "../utils/dom.js";
import { createSlider, initSlider, initFontSizeControl } from "./components.js";
import { saveConfig, applyCfgDefaults, defaultConfig } from "../config/lectify-settings.js";

/**
 * Wizard state and transition lock
 */
const transitionLock = { locked: false };

/**
 * Main entry point - Show the configuration wizard
 * Creates overlay with gradient background and guides user through configuration
 * @returns {Promise<Object>} Resolves with final configuration when wizard is complete
 */
export function showConfigWizard() {
  return new Promise((resolve, reject) => {
    // Ensure goo filter is in the DOM
    ensureGooFilter();

    // Initialize configuration with defaults
    const config = applyCfgDefaults({});

    // Create overlay with initial welcome screen
    const overlay = cE("div");
    overlay.className = "fcc-config-overlay";
    overlay.innerHTML = `
<div class="fcc-gradient-bg">
  <div class="fcc-gradients-container">
    <div class="g1"></div>
    <div class="g2"></div>
    <div class="g3"></div>
    <div class="g4"></div>
    <div class="g5"></div>
  </div>
</div>
<div class="fcc-content-wrapper">
  <div class="fcc-glass-container">
    <div class="fcc-glass-content-wrapper" data-simplebar>
      <div class="fcc-glass-content-inner">
        <h1 class="fcc-welcome-text fcc-animate-element">Welcome to Lectify</h1>
        <button class="heroui-button fcc-initial">
          <span class="heroui-button-text">Start</span>
        </button>
      </div>
    </div>
  </div>
</div>
`;

    b.appendChild(overlay);

    const globalContainer = qS(overlay, ".fcc-glass-container");
    const globalInterface = qS(overlay, ".fcc-glass-content-inner");

    // Trigger fade-in animation
    requestAnimationFrame(() => overlay.classList.add("fcc-visible"));

    let simpleBar = null;

    // Wait for SimpleBar library to load and initialize it
    const waitForSimpleBar = setInterval(() => {
      if (window.SimpleBar) {
        clearInterval(waitForSimpleBar);
        const wrapper = qS(overlay, "[data-simplebar]");
        if (wrapper) {
          simpleBar = new SimpleBar(wrapper, { autoHide: false, forceVisible: true });
        }
      }
    }, 100);

    // Animate welcome screen sizing
    setTimeout(() => {
      const welcomeText = qS(globalInterface, ".fcc-welcome-text");
      const startButton = qS(globalInterface, ".heroui-button");

      if (welcomeText && startButton) {
        const textRect = welcomeText.getBoundingClientRect();
        const buttonRect = startButton.getBoundingClientRect();
        const padding = 96;
        const gap = 32;
        const width = Math.max(textRect.width, buttonRect.width) + padding;
        const height = textRect.height + buttonRect.height + gap + padding;

        globalContainer.style.width = width + "px";
        globalContainer.style.height = height + "px";
        globalContainer.classList.add("fcc-sized");

        if (simpleBar) simpleBar.recalculate();

        setTimeout(() => {
          welcomeText.classList.add("fcc-visible");
          startButton.classList.add("fcc-visible");
        }, 1000);
      }
    }, 1000);

    // Handle Start button click
    const handleStart = () => {
      showInitialConfig(
        config,
        globalInterface,
        simpleBar,
        globalContainer,
        () => {
          // On back from initial - close wizard
          closeWizard(overlay, () => reject(new Error("User cancelled")));
        },
        () => {
          // On next from initial - show model config
          showModelConfig(
            config,
            defaultConfig,
            globalInterface,
            simpleBar,
            globalContainer,
            () => {
              // On back from model - show initial
              showInitialConfig(
                config,
                globalInterface,
                simpleBar,
                globalContainer,
                () => closeWizard(overlay, () => reject(new Error("User cancelled"))),
                () => {
                  // This shouldn't happen but handle it anyway
                  showModelConfig(
                    config,
                    defaultConfig,
                    globalInterface,
                    simpleBar,
                    globalContainer,
                    null,
                    null
                  );
                },
                true // backward
              );
            },
            () => {
              // On next from model - show subtitle config
              showSubtitleConfig(
                config,
                globalInterface,
                simpleBar,
                globalContainer,
                null, // No subtitle library needed
                () => {
                  // On back from subtitle - show model config
                  showModelConfig(
                    config,
                    defaultConfig,
                    globalInterface,
                    simpleBar,
                    globalContainer,
                    null,
                    null,
                    true
                  );
                },
                () => {
                  // On finish from subtitle - save and close
                  saveConfig(config);
                  closeWizard(overlay, () => resolve(config));
                },
                true // backward
              );
            }
          );
        }
      );
    };

    // Wait a bit then attach event listener to start button
    setTimeout(() => {
      const startButton = qS(globalInterface, ".heroui-button");
      if (startButton) {
        startButton.addEventListener("click", handleStart);
      }
    }, 1500);
  });
}

/**
 * Close the wizard overlay with fade-out animation
 * @param {HTMLElement} overlay - Overlay element to remove
 * @param {Function} callback - Callback to execute after closing
 */
function closeWizard(overlay, callback) {
  overlay.classList.remove("fcc-visible");
  setTimeout(() => {
    overlay.remove();
    if (callback) callback();
  }, 500);
}

/**
 * Transition between wizard pages with slide animations
 * @param {string} newHtml - HTML content for the new page
 * @param {string|null} newTitle - Optional page title
 * @param {boolean} backward - If true, animates backward (right to left)
 * @param {HTMLElement} globalInterface - Main container element
 * @param {Object} simpleBar - SimpleBar instance for scrolling
 * @param {HTMLElement} globalContainer - Container element for resizing
 */
export function transitionToPage(
  newHtml,
  newTitle,
  backward,
  globalInterface,
  simpleBar,
  globalContainer
) {
  if (transitionLock.locked) return;
  transitionLock.locked = true;

  const currentElements = Array.from(globalInterface.children);

  // Animate out current elements
  currentElements.forEach((el, i) => {
    el.classList.add("fcc-animate-element");
    setTimeout(
      () => el.classList.add(backward ? "fcc-slide-out-left" : "fcc-slide-out-right"),
      i * 100
    );
  });

  const slideOutDuration = currentElements.length * 100 + 1000;

  setTimeout(() => {
    // Clear current content
    globalInterface.innerHTML = "";
    const newElements = [];

    // Add title if provided
    if (newTitle) {
      const titleEl = cE("h1");
      titleEl.className = "fcc-config-title fcc-animate-element";
      titleEl.classList.add(backward ? "fcc-slide-out-right" : "fcc-slide-out-left");
      titleEl.textContent = newTitle;
      newElements.push(titleEl);
      globalInterface.appendChild(titleEl);
    }

    // Add new content
    const tempContainer = cE("div");
    tempContainer.innerHTML = newHtml;
    Array.from(tempContainer.children).forEach((child) => {
      child.classList.add(backward ? "fcc-slide-out-right" : "fcc-slide-out-left");
      newElements.push(child);
      globalInterface.appendChild(child);
    });

    // Calculate new size and animate in
    requestAnimationFrame(() => {
      let totalHeight = 0;
      let maxWidth = 0;

      newElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        totalHeight += rect.height;
        maxWidth = Math.max(maxWidth, rect.width);
      });

      const padding = 96;
      const gap = (newElements.length - 1) * 32;
      const newWidth = Math.max(696, maxWidth + padding);
      const newHeight = Math.min(innerHeight * 0.8, totalHeight + gap + padding);

      globalContainer.style.width = newWidth + "px";
      globalContainer.style.height = newHeight + "px";

      if (simpleBar) {
        simpleBar.recalculate();
        simpleBar.getScrollElement().scrollTop = 0;
      }

      // Slide in new elements
      setTimeout(
        () =>
          newElements.forEach((el, i) =>
            setTimeout(
              () => el.classList.remove("fcc-slide-out-left", "fcc-slide-out-right"),
              i * 100
            )
          ),
        100
      );
    });

    setTimeout(() => (transitionLock.locked = false), slideOutDuration + 500);
  }, slideOutDuration);
}

/**
 * Show initial configuration screen (TTS engine selection)
 * @param {Object} config - Configuration object
 * @param {HTMLElement} globalInterface - Main container element
 * @param {Object} simpleBar - SimpleBar instance
 * @param {HTMLElement} globalContainer - Container element
 * @param {Function} onBack - Callback for back button
 * @param {Function} onNext - Callback for next button (goes to model config)
 * @param {boolean} backward - Animation direction
 */
export function showInitialConfig(
  config,
  globalInterface,
  simpleBar,
  globalContainer,
  onBack,
  onNext,
  backward = false
) {
  const contentHtml = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Text-to-Speech Engine</label>
  <p class="fcc-option-desc">
    Using Web Speech API - built-in browser text-to-speech. Fast, lightweight, and works instantly with no downloads.
  </p>
</div>
<div class="fcc-button-group fcc-animate-element">
  <button class="heroui-button" id="next-btn">
    <span class="heroui-button-text">Next</span>
  </button>
</div>
`;

  // Set default TTS engine
  config.ttsEngine = "webspeech";

  transitionToPage(
    contentHtml,
    "Initial Configuration",
    backward,
    globalInterface,
    simpleBar,
    globalContainer
  );

  const elementsLoadDelay = 1200 + 1 * 100;

  setTimeout(() => {
    const nextBtn = qS(globalInterface, "#next-btn");

    // Next button handler
    nextBtn.addEventListener("click", () => {
      if (!transitionLock.locked && onNext) {
        onNext();
      }
    });
  }, elementsLoadDelay);
}

/**
 * Show model configuration screen (TTS engine specific settings)
 * @param {Object} config - Configuration object
 * @param {Object} defaultConfig - Default configuration values
 * @param {HTMLElement} globalInterface - Main container element
 * @param {Object} simpleBar - SimpleBar instance
 * @param {HTMLElement} globalContainer - Container element
 * @param {Function} onBack - Callback for back button
 * @param {Function} onNext - Callback for next button (goes to subtitle config)
 * @param {boolean} backward - Animation direction
 */
export function showModelConfig(
  config,
  defaultConfig,
  globalInterface,
  simpleBar,
  globalContainer,
  onBack,
  onNext,
  backward = false
) {
  const voicePref = config.webspeech?.voice || "default";
  const ratePref = config.webspeech?.rate ?? 1;

  const optionsHtml = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Voice</label>
  <p class="fcc-option-desc">Select a voice from your system's available voices.</p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio${
      voicePref === "default" ? " selected" : ""
    }" data-value="default">
      <label
        ><input type="radio" name="voice" value="default" ${
          voicePref === "default" ? "checked" : ""
        } />
        <span class="fcc-radio-title">Default Voice</span></label>
    </div>
    <div class="fcc-compact-radio${voicePref === "female" ? " selected" : ""}" data-value="female">
      <label
        ><input type="radio" name="voice" value="female" ${
          voicePref === "female" ? "checked" : ""
        } />
        <span class="fcc-radio-title">Female Voice</span></label>
    </div>
    <div class="fcc-compact-radio${voicePref === "male" ? " selected" : ""}" data-value="male">
      <label
        ><input type="radio" name="voice" value="male" ${voicePref === "male" ? "checked" : ""} />
        <span class="fcc-radio-title">Male Voice</span></label>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Speech Rate</label>
  <p class="fcc-option-desc">Adjust how fast the text is read.</p>
  <div class="fcc-slider-container" id="rate-slider-container"></div>
</div>`;

  const contentHtml =
    optionsHtml +
    `<div class="fcc-button-group fcc-animate-element">
  <button class="heroui-button heroui-button-secondary" id="back-btn">
    <span class="heroui-button-text">Back</span>
  </button>
  <button class="heroui-button" id="next-btn">
    <span class="heroui-button-text">Next</span>
  </button>
</div>`;

  transitionToPage(
    contentHtml,
    "Model Configuration",
    backward,
    globalInterface,
    simpleBar,
    globalContainer
  );

  const elementsLoadDelay = 1200 + 4 * 200;

  setTimeout(() => {
    // Compact radio button handlers
    qSA(globalInterface, ".fcc-compact-radio").forEach((radio) => {
      radio.addEventListener("click", () => {
        const input = qS(radio, 'input[type="radio"]');
        input.checked = true;
        const radioName = input.name;
        qSA(globalInterface, `input[name="${radioName}"]`).forEach((r) =>
          r.closest(".fcc-compact-radio").classList.remove("selected")
        );
        radio.classList.add("selected");
      });
    });

    // Web Speech specific controls
    if (config.ttsEngine === "webspeech") {
      const rateLabels = {
        0.5: "0.5x - Slow",
        0.75: "0.75x - Slightly Slow",
        1: "1x - Normal",
        1.25: "1.25x - Slightly Fast",
        1.5: "1.5x - Fast",
        1.75: "1.75x - Very Fast",
        2: "2x - Very Fast",
      };

      const rateContainer = qS(globalInterface, "#rate-slider-container");
      const ratePref = config.webspeech?.rate ?? 1;
      rateContainer.innerHTML = createSlider(0.5, 2, 0.25, ratePref, rateLabels, "rate-value");

      const rateTrack = qS(rateContainer, ".fcc-slider-track");
      initSlider(rateTrack, rateLabels, qS(rateContainer, "#rate-value"));

      rateTrack.addEventListener("fcc-slider-change", (ev) => {
        config.webspeech = config.webspeech || { ...defaultConfig.webspeech };
        config.webspeech.rate = parseFloat(ev.detail.value);
      });

      // Voice selection handlers
      qSA(globalInterface, 'input[name="voice"]').forEach((input) => {
        input.addEventListener("change", (ev) => {
          if (ev.target.checked) {
            config.webspeech = config.webspeech || { ...defaultConfig.webspeech };
            config.webspeech.voice = ev.target.value;
          }
        });
      });
    }
    // Piper specific controls
    else if (config.ttsEngine === "piper") {
      const speedLabels = {
        0.8: "Slow",
        0.9: "Slightly Slow",
        1: "Normal",
        1.1: "Slightly Fast",
        1.2: "Fast",
      };

      const speedContainer = qS(globalInterface, "#speed-slider-container");
      speedContainer.innerHTML = createSlider(0.8, 1.2, 0.1, 1, speedLabels, "speed-value");
      initSlider(
        qS(speedContainer, ".fcc-slider-track"),
        speedLabels,
        qS(speedContainer, "#speed-value")
      );
    }

    // Navigation buttons
    qS(globalInterface, "#back-btn").addEventListener("click", () => {
      if (!transitionLock.locked && onBack) onBack();
    });

    qS(globalInterface, "#next-btn").addEventListener("click", () => {
      if (!transitionLock.locked && onNext) onNext();
    });
  }, elementsLoadDelay);
}

/**
 * Show subtitle configuration screen (appearance settings)
 * @param {Object} config - Configuration object
 * @param {HTMLElement} globalInterface - Main container element
 * @param {Object} simpleBar - SimpleBar instance
 * @param {HTMLElement} globalContainer - Container element
 * @param {Object} subtitleLib - Subtitle library instance
 * @param {Function} onBack - Callback for back button
 * @param {Function} onFinish - Callback for finish button (saves config)
 * @param {boolean} backward - Animation direction
 */
export function showSubtitleConfig(
  config,
  globalInterface,
  simpleBar,
  globalContainer,
  subtitleLib,
  onBack,
  onFinish,
  backward = false
) {
  const contentHtml = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Background Color</label>
  <p class="fcc-option-desc">Choose the color for subtitle background.</p>
  <div class="fcc-color-picker-group">
    <div class="fcc-color-input-wrapper">
      <div class="fcc-color-input-row">
        <input type="text" class="fcc-color-input coloris-input" id="bg-color-input" data-coloris />
        <span class="fcc-color-preview" id="bg-color-preview"></span>
      </div>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Background Opacity</label>
  <p class="fcc-option-desc">Adjust the transparency of the subtitle background.</p>
  <div class="fcc-slider-container" id="bg-opacity-slider"></div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Text Color</label>
  <p class="fcc-option-desc">Choose the color for subtitle text.</p>
  <div class="fcc-color-picker-group">
    <div class="fcc-color-input-wrapper">
      <div class="fcc-color-input-row">
        <input type="text" class="fcc-color-input coloris-input" id="text-color-input" data-coloris />
        <span class="fcc-color-preview" id="text-color-preview"></span>
      </div>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Text Opacity</label>
  <p class="fcc-option-desc">Adjust the transparency of the subtitle text.</p>
  <div class="fcc-slider-container" id="text-opacity-slider"></div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Font Size</label>
  <p class="fcc-option-desc">Adjust the size of subtitle text.</p>
  <div class="fcc-slider-container" id="font-size-slider"></div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Quick Size Presets</label>
  <p class="fcc-option-desc">Choose a preset size or customize with the slider above.</p>
  <div class="fcc-size-preset">
    <button type="button" class="fcc-size-btn" data-size="18">Small</button>
    <button type="button" class="fcc-size-btn" data-size="24">Medium</button>
    <button type="button" class="fcc-size-btn" data-size="32">Large</button>
    <button type="button" class="fcc-size-btn" data-size="40">Extra Large</button>
  </div>
</div>
<div class="fcc-button-group fcc-animate-element">
  <button type="button" class="heroui-button heroui-button-secondary" id="back-btn">
    <span class="heroui-button-text">Back</span>
  </button>
  <button type="button" class="heroui-button" id="finish-btn">
    <span class="heroui-button-text">Finish</span>
  </button>
</div>`;

  transitionToPage(
    contentHtml,
    "Subtitle Appearance",
    backward,
    globalInterface,
    simpleBar,
    globalContainer
  );

  const elementsLoadDelay = 1200 + 8 * 200;

  setTimeout(() => {
    // Background opacity slider
    const opacityLabels = {};
    for (let i = 0; i <= 100; i += 5) {
      opacityLabels[i] = `${i}%`;
    }

    const bgOpacityContainer = qS(globalInterface, "#bg-opacity-slider");
    bgOpacityContainer.innerHTML = createSlider(
      0,
      100,
      5,
      config.subtitle.bgOpacity,
      opacityLabels,
      "bg-opacity-value"
    );

    const bgOpacityValue = qS(bgOpacityContainer, "#bg-opacity-value");
    const bgOpacityTrack = qS(bgOpacityContainer, ".fcc-slider-track");
    initSlider(bgOpacityTrack, opacityLabels, bgOpacityValue);

    if (bgOpacityValue) {
      bgOpacityValue.textContent = `${config.subtitle.bgOpacity}%`;
    }

    bgOpacityTrack.addEventListener("fcc-slider-change", (ev) => {
      const value = ev.detail.value;
      config.subtitle.bgOpacity = value;
      if (bgOpacityValue) {
        bgOpacityValue.textContent = `${value}%`;
      }
    });

    // Text opacity slider
    const textOpacityContainer = qS(globalInterface, "#text-opacity-slider");
    textOpacityContainer.innerHTML = createSlider(
      0,
      100,
      5,
      config.subtitle.textOpacity,
      opacityLabels,
      "text-opacity-value"
    );

    const textOpacityValue = qS(textOpacityContainer, "#text-opacity-value");
    const textOpacityTrack = qS(textOpacityContainer, ".fcc-slider-track");
    initSlider(textOpacityTrack, opacityLabels, textOpacityValue);

    if (textOpacityValue) {
      textOpacityValue.textContent = `${config.subtitle.textOpacity}%`;
    }

    textOpacityTrack.addEventListener("fcc-slider-change", (ev) => {
      const value = ev.detail.value;
      config.subtitle.textOpacity = value;
      if (textOpacityValue) {
        textOpacityValue.textContent = `${value}%`;
      }
    });

    // Font size control
    initFontSizeControl(globalInterface, "#font-size-slider", ".fcc-size-btn", config, subtitleLib);

    // Color pickers
    const bgColorInput = qS(globalInterface, "#bg-color-input");
    const textColorInput = qS(globalInterface, "#text-color-input");
    const bgColorPreview = qS(globalInterface, "#bg-color-preview");
    const textColorPreview = qS(globalInterface, "#text-color-preview");

    const openPicker = (input) => {
      if (!input) return;
      input.focus();
      input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };

    // Set initial values
    bgColorInput.value = config.subtitle.bgColor;
    textColorInput.value = config.subtitle.textColor;

    if (bgColorPreview) bgColorPreview.style.background = config.subtitle.bgColor;
    if (textColorPreview) textColorPreview.style.background = config.subtitle.textColor;

    // Preview click handlers
    if (bgColorPreview) bgColorPreview.addEventListener("click", () => openPicker(bgColorInput));
    if (textColorPreview)
      textColorPreview.addEventListener("click", () => openPicker(textColorInput));

    // Initialize Coloris (with retry if not loaded yet)
    const initColoris = () => {
      if (window.Coloris) {
        Coloris({
          el: ".coloris-input",
          theme: "polaroid",
          themeMode: "dark",
          format: "hex",
          alpha: false,
          wrap: true,
        });

        bgColorInput.addEventListener("input", () => {
          config.subtitle.bgColor = bgColorInput.value;
          if (bgColorPreview) bgColorPreview.style.background = bgColorInput.value;
        });

        textColorInput.addEventListener("input", () => {
          config.subtitle.textColor = textColorInput.value;
          if (textColorPreview) textColorPreview.style.background = textColorInput.value;
        });
      } else {
        setTimeout(initColoris, 100);
      }
    };
    initColoris();

    // Navigation buttons
    qS(globalInterface, "#back-btn").addEventListener("click", (e) => {
      e.preventDefault();
      if (transitionLock.locked) return;
      if (onBack) onBack();
    });

    qS(globalInterface, "#finish-btn").addEventListener("click", (e) => {
      e.preventDefault();
      if (transitionLock.locked) return;
      if (onFinish) onFinish();
    });

    // Recalculate scrollbar
    if (simpleBar) simpleBar.recalculate();
  }, elementsLoadDelay);
}

export default {
  showConfigWizard,
  transitionToPage,
  showInitialConfig,
  showModelConfig,
  showSubtitleConfig,
};
