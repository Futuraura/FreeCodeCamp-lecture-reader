/**
 * Lectify Configuration Wizard
 * Provides an interactive UI for users to configure TTS and subtitle settings
 */

import { cE, qS, qSA } from "../utils/dom.js";
import { defaultConfig, applyConfigDefaults, saveConfig } from "./lectify-settings.js";

/**
 * Configuration wizard state
 */
const wizardState = {
  currentSection: 0,
  config: null,
  transitionLock: false,
};

/**
 * Initialize the configuration wizard
 * @param {Object} existingConfig - Optional existing configuration to edit
 * @returns {Promise<Object>} Resolves with the final configuration
 */
export function initConfigurator(existingConfig = null) {
  return new Promise((resolve, reject) => {
    wizardState.config = existingConfig
      ? applyConfigDefaults(existingConfig)
      : applyConfigDefaults({});

    wizardState.onComplete = resolve;
    wizardState.onCancel = reject;

    showConfigOverlay();
  });
}

/**
 * Create and show the configuration overlay
 */
function showConfigOverlay() {
  const overlay = cE("div");
  overlay.className = "fcc-config-overlay";
  overlay.id = "fcc-config-overlay";

  overlay.innerHTML = `
    <div class="fcc-gradient-bg">
      <svg>
        <defs>
          <filter id="fcc-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div class="fcc-gradients-container">
        <div class="g1"></div>
        <div class="g2"></div>
        <div class="g3"></div>
        <div class="g4"></div>
        <div class="g5"></div>
      </div>
    </div>
    <div class="fcc-content-wrapper">
      <div class="fcc-glass-container" id="fcc-glass-container">
        <div class="fcc-glass-content-wrapper" data-simplebar>
          <div class="fcc-glass-content-inner" id="fcc-glass-content-inner">
            <!-- Content will be injected here -->
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger fade-in animation
  requestAnimationFrame(() => {
    overlay.classList.add("fcc-visible");
  });

  // Wait for overlay to be visible, then show first section
  setTimeout(() => {
    showSection(0);
  }, 500);
}

/**
 * Show a specific configuration section
 * @param {number} sectionIndex - Index of the section to show
 * @param {boolean} backward - Whether navigating backward
 */
function showSection(sectionIndex, backward = false) {
  wizardState.currentSection = sectionIndex;

  const sections = [
    createWelcomeSection,
    createEngineSection,
    createTTSSettingsSection,
    createSubtitleSection,
    createCompletionSection,
  ];

  if (sectionIndex >= 0 && sectionIndex < sections.length) {
    const content = sections[sectionIndex](backward);
    transitionToContent(content, backward);
  }
}

/**
 * Create welcome section
 */
function createWelcomeSection() {
  return {
    title: "Welcome to Lectify",
    html: `
      <p style="color: rgba(255,255,255,0.9); font-size: 1.25rem; text-align: center; max-width: 600px;">
        Let's configure your lecture reader experience. This wizard will guide you through 
        setting up text-to-speech and subtitle preferences.
      </p>
      <div class="fcc-button-group fcc-animate-element">
        <button class="heroui-button" id="start-btn">
          <span class="heroui-button-text">Get Started</span>
        </button>
      </div>
    `,
    onMount: () => {
      const startBtn = qS("#start-btn");
      startBtn.addEventListener("click", () => {
        if (!wizardState.transitionLock) {
          showSection(1);
        }
      });
    },
  };
}

/**
 * Create TTS engine selection section
 */
function createEngineSection(backward = false) {
  const cfg = wizardState.config;

  return {
    title: "Choose TTS Engine",
    html: `
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Select Text-to-Speech Engine</label>
        <div class="fcc-radio-option" data-value="webspeech">
          <label class="fcc-radio-label">
            <input type="radio" name="tts-engine" value="webspeech" ${
              cfg.ttsEngine === "webspeech" ? "checked" : ""
            } />
            <div class="fcc-radio-title">Web Speech API</div>
          </label>
          <p class="fcc-radio-desc">
            Built-in browser API. Works instantly with no downloads. Lightweight and fast, perfect for quick setup.
          </p>
        </div>
        <div class="fcc-radio-option" data-value="transformers">
          <label class="fcc-radio-label">
            <input type="radio" name="tts-engine" value="transformers" ${
              cfg.ttsEngine === "transformers" ? "checked" : ""
            } />
            <div class="fcc-radio-title">Transformers.js</div>
          </label>
          <p class="fcc-radio-desc">
            High-quality AI models running locally in your browser. Offers the best voice quality with advanced neural networks (170-350MB download).
          </p>
        </div>
        <div class="fcc-radio-option" data-value="piper">
          <label class="fcc-radio-label">
            <input type="radio" name="tts-engine" value="piper" ${
              cfg.ttsEngine === "piper" ? "checked" : ""
            } />
            <div class="fcc-radio-title">Piper TTS</div>
          </label>
          <p class="fcc-radio-desc">
            Balanced quality and performance. Fast neural TTS with natural-sounding voices (30-60MB download).
          </p>
        </div>
      </div>
      <div class="fcc-button-group fcc-animate-element">
        <button class="heroui-button heroui-button-secondary" id="back-btn">
          <span class="heroui-button-text">Back</span>
        </button>
        <button class="heroui-button ${
          cfg.ttsEngine ? "" : "heroui-button-outline"
        }" id="next-btn" ${cfg.ttsEngine ? "" : "disabled"}>
          <span class="heroui-button-text">Next</span>
        </button>
      </div>
    `,
    onMount: () => {
      const radioOptions = qSA(".fcc-radio-option");
      const radioInputs = qSA('input[name="tts-engine"]');
      const nextBtn = qS("#next-btn");
      const backBtn = qS("#back-btn");

      // Set initial selected state
      if (cfg.ttsEngine) {
        const selectedOption = qS(`.fcc-radio-option[data-value="${cfg.ttsEngine}"]`);
        if (selectedOption) selectedOption.classList.add("selected");
      }

      // Handle option clicks
      radioOptions.forEach((option, index) => {
        option.addEventListener("click", () => {
          radioInputs[index].checked = true;
          cfg.ttsEngine = radioInputs[index].value;

          radioOptions.forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");

          nextBtn.disabled = false;
          nextBtn.classList.remove("heroui-button-outline");
        });
      });

      // Handle radio input changes
      radioInputs.forEach((input) => {
        input.addEventListener("change", () => {
          cfg.ttsEngine = input.value;

          radioOptions.forEach((opt) => opt.classList.remove("selected"));
          const selectedOption = qS(`.fcc-radio-option[data-value="${input.value}"]`);
          if (selectedOption) selectedOption.classList.add("selected");

          nextBtn.disabled = false;
          nextBtn.classList.remove("heroui-button-outline");
        });
      });

      backBtn.addEventListener("click", () => {
        if (!wizardState.transitionLock) showSection(0, true);
      });

      nextBtn.addEventListener("click", () => {
        if (!nextBtn.disabled && !wizardState.transitionLock) {
          showSection(2);
        }
      });
    },
  };
}

/**
 * Create TTS-specific settings section
 */
function createTTSSettingsSection(backward = false) {
  const cfg = wizardState.config;

  let settingsHTML = "";

  if (cfg.ttsEngine === "webspeech") {
    const voicePref = cfg.webspeech?.voice || "default";
    const ratePref = cfg.webspeech?.rate || 1;

    settingsHTML = `
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Voice</label>
        <p class="fcc-option-desc">Select a voice from your system's available voices.</p>
        <div class="fcc-radio-group">
          <div class="fcc-compact-radio ${
            voicePref === "default" ? "selected" : ""
          }" data-value="default">
            <label>
              <input type="radio" name="voice" value="default" ${
                voicePref === "default" ? "checked" : ""
              } />
              <span class="fcc-radio-title">Default Voice</span>
            </label>
          </div>
          <div class="fcc-compact-radio ${
            voicePref === "female" ? "selected" : ""
          }" data-value="female">
            <label>
              <input type="radio" name="voice" value="female" ${
                voicePref === "female" ? "checked" : ""
              } />
              <span class="fcc-radio-title">Female Voice</span>
            </label>
          </div>
          <div class="fcc-compact-radio ${
            voicePref === "male" ? "selected" : ""
          }" data-value="male">
            <label>
              <input type="radio" name="voice" value="male" ${
                voicePref === "male" ? "checked" : ""
              } />
              <span class="fcc-radio-title">Male Voice</span>
            </label>
          </div>
        </div>
      </div>
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Speech Rate</label>
        <p class="fcc-option-desc">Adjust how fast the text is read.</p>
        <div class="fcc-slider-container" id="rate-slider-container">
          <div class="fcc-slider-value" id="rate-value">${ratePref}x</div>
          <input type="range" min="0.5" max="2" step="0.25" value="${ratePref}" id="rate-slider" class="fcc-slider">
        </div>
      </div>
    `;
  } else if (cfg.ttsEngine === "transformers") {
    settingsHTML = `
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Model</label>
        <p class="fcc-option-desc">Choose the AI model to use. Larger models offer better quality but require more resources.</p>
        <div class="fcc-radio-group">
          <div class="fcc-compact-radio selected" data-value="speecht5">
            <label>
              <input type="radio" name="model" value="speecht5" checked />
              <span class="fcc-radio-title">SpeechT5 - Balanced (170MB)</span>
            </label>
          </div>
          <div class="fcc-compact-radio" data-value="vits">
            <label>
              <input type="radio" name="model" value="vits" />
              <span class="fcc-radio-title">VITS - High Quality (350MB)</span>
            </label>
          </div>
        </div>
      </div>
    `;
  } else if (cfg.ttsEngine === "piper") {
    settingsHTML = `
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Voice Model</label>
        <p class="fcc-option-desc">Select a voice model for Piper TTS.</p>
        <div class="fcc-radio-group">
          <div class="fcc-compact-radio selected" data-value="amy">
            <label>
              <input type="radio" name="piper-voice" value="amy" checked />
              <span class="fcc-radio-title">Amy (US English - Medium)</span>
            </label>
          </div>
          <div class="fcc-compact-radio" data-value="joe">
            <label>
              <input type="radio" name="piper-voice" value="joe" />
              <span class="fcc-radio-title">Joe (US English - Medium)</span>
            </label>
          </div>
        </div>
      </div>
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Speaking Speed</label>
        <p class="fcc-option-desc">Adjust the speed of speech.</p>
        <div class="fcc-slider-container" id="speed-slider-container">
          <div class="fcc-slider-value" id="speed-value">1.0x</div>
          <input type="range" min="0.8" max="1.2" step="0.1" value="1" id="speed-slider" class="fcc-slider">
        </div>
      </div>
    `;
  }

  return {
    title: `${
      cfg.ttsEngine === "webspeech"
        ? "Web Speech"
        : cfg.ttsEngine === "transformers"
        ? "Transformers.js"
        : "Piper"
    } Settings`,
    html: `
      ${settingsHTML}
      <div class="fcc-button-group fcc-animate-element">
        <button class="heroui-button heroui-button-secondary" id="back-btn">
          <span class="heroui-button-text">Back</span>
        </button>
        <button class="heroui-button" id="next-btn">
          <span class="heroui-button-text">Next</span>
        </button>
      </div>
    `,
    onMount: () => {
      const backBtn = qS("#back-btn");
      const nextBtn = qS("#next-btn");

      if (cfg.ttsEngine === "webspeech") {
        // Handle voice selection
        const voiceRadios = qSA('input[name="voice"]');
        const voiceOptions = qSA(".fcc-compact-radio");

        voiceOptions.forEach((option, index) => {
          option.addEventListener("click", () => {
            voiceRadios[index].checked = true;
            cfg.webspeech = cfg.webspeech || {};
            cfg.webspeech.voice = voiceRadios[index].value;

            voiceOptions.forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");
          });
        });

        voiceRadios.forEach((radio) => {
          radio.addEventListener("change", () => {
            cfg.webspeech = cfg.webspeech || {};
            cfg.webspeech.voice = radio.value;
          });
        });

        // Handle rate slider
        const rateSlider = qS("#rate-slider");
        const rateValue = qS("#rate-value");

        rateSlider.addEventListener("input", (e) => {
          const value = parseFloat(e.target.value);
          rateValue.textContent = `${value}x`;
          cfg.webspeech = cfg.webspeech || {};
          cfg.webspeech.rate = value;
        });
      } else if (cfg.ttsEngine === "piper") {
        const speedSlider = qS("#speed-slider");
        const speedValue = qS("#speed-value");

        speedSlider.addEventListener("input", (e) => {
          const value = parseFloat(e.target.value);
          speedValue.textContent = `${value}x`;
        });
      }

      backBtn.addEventListener("click", () => {
        if (!wizardState.transitionLock) showSection(1, true);
      });

      nextBtn.addEventListener("click", () => {
        if (!wizardState.transitionLock) showSection(3);
      });
    },
  };
}

/**
 * Create subtitle appearance section
 */
function createSubtitleSection(backward = false) {
  const cfg = wizardState.config;
  const sub = cfg.subtitle;

  return {
    title: "Subtitle Appearance",
    html: `
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Background Opacity</label>
        <p class="fcc-option-desc">Adjust the transparency of the subtitle background.</p>
        <div class="fcc-slider-container">
          <div class="fcc-slider-value" id="opacity-value">${sub.bgOpacity}%</div>
          <input type="range" min="0" max="100" step="5" value="${
            sub.bgOpacity
          }" id="opacity-slider" class="fcc-slider">
        </div>
      </div>
      
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Text Color</label>
        <p class="fcc-option-desc">Choose the color for subtitle text.</p>
        <input type="color" id="text-color" value="${sub.textColor}" class="fcc-color-input">
      </div>
      
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Font Size</label>
        <p class="fcc-option-desc">Adjust the size of subtitle text.</p>
        <div class="fcc-slider-container">
          <div class="fcc-slider-value" id="font-size-value">${sub.fontSize}px</div>
          <input type="range" min="16" max="48" step="2" value="${
            sub.fontSize
          }" id="font-size-slider" class="fcc-slider">
        </div>
        <div class="fcc-size-preset">
          <button class="fcc-size-btn ${
            sub.fontSize === 18 ? "active" : ""
          }" data-size="18">Small</button>
          <button class="fcc-size-btn ${
            sub.fontSize === 24 ? "active" : ""
          }" data-size="24">Medium</button>
          <button class="fcc-size-btn ${
            sub.fontSize === 32 ? "active" : ""
          }" data-size="32">Large</button>
          <button class="fcc-size-btn ${
            sub.fontSize === 40 ? "active" : ""
          }" data-size="40">Extra Large</button>
        </div>
      </div>
      
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Highlight Style</label>
        <p class="fcc-option-desc">Choose how words are highlighted during reading.</p>
        <div class="fcc-compact-radio ${
          sub.highlightStyle === "text" ? "selected" : ""
        }" data-value="text">
          <label>
            <input type="radio" name="highlight-style" value="text" ${
              sub.highlightStyle === "text" ? "checked" : ""
            } />
            <span class="fcc-radio-title">Text Color Change</span>
          </label>
        </div>
        <div class="fcc-compact-radio ${
          sub.highlightStyle === "background" ? "selected" : ""
        }" data-value="background">
          <label>
            <input type="radio" name="highlight-style" value="background" ${
              sub.highlightStyle === "background" ? "checked" : ""
            } />
            <span class="fcc-radio-title">Background Rectangle</span>
          </label>
        </div>
      </div>
      
      <div class="fcc-option-group fcc-animate-element">
        <label class="fcc-option-label">Highlight Text Color</label>
        <p class="fcc-option-desc">Color of the highlighted word text.</p>
        <input type="color" id="highlight-text-color" value="${
          sub.highlightTextColor
        }" class="fcc-color-input">
      </div>
      
      <div class="fcc-option-group fcc-animate-element" id="highlight-bg-group" style="${
        sub.highlightStyle === "background" ? "" : "display:none;"
      }">
        <label class="fcc-option-label">Highlight Background Color</label>
        <p class="fcc-option-desc">Background color when using rectangle highlight style.</p>
        <input type="color" id="highlight-bg-color" value="${
          sub.highlightBgColor
        }" class="fcc-color-input">
      </div>
      
      <div class="fcc-button-group fcc-animate-element">
        <button class="heroui-button heroui-button-secondary" id="back-btn">
          <span class="heroui-button-text">Back</span>
        </button>
        <button class="heroui-button" id="finish-btn">
          <span class="heroui-button-text">Finish</span>
        </button>
      </div>
    `,
    onMount: () => {
      const backBtn = qS("#back-btn");
      const finishBtn = qS("#finish-btn");

      // Opacity slider
      const opacitySlider = qS("#opacity-slider");
      const opacityValue = qS("#opacity-value");
      opacitySlider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        opacityValue.textContent = `${value}%`;
        cfg.subtitle.bgOpacity = value;
      });

      // Text color
      const textColor = qS("#text-color");
      textColor.addEventListener("input", (e) => {
        cfg.subtitle.textColor = e.target.value;
      });

      // Font size slider
      const fontSizeSlider = qS("#font-size-slider");
      const fontSizeValue = qS("#font-size-value");
      fontSizeSlider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        fontSizeValue.textContent = `${value}px`;
        cfg.subtitle.fontSize = value;

        // Update preset buttons
        qSA(".fcc-size-btn").forEach((btn) => {
          btn.classList.toggle("active", parseInt(btn.dataset.size) === value);
        });
      });

      // Size preset buttons
      qSA(".fcc-size-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const size = parseInt(btn.dataset.size);
          fontSizeSlider.value = size;
          fontSizeValue.textContent = `${size}px`;
          cfg.subtitle.fontSize = size;

          qSA(".fcc-size-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });

      // Highlight style
      const highlightOptions = qSA(".fcc-compact-radio");
      const highlightRadios = qSA('input[name="highlight-style"]');
      const highlightBgGroup = qS("#highlight-bg-group");

      highlightOptions.forEach((option, index) => {
        option.addEventListener("click", () => {
          highlightRadios[index].checked = true;
          cfg.subtitle.highlightStyle = highlightRadios[index].value;

          highlightOptions.forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");

          // Show/hide background color option
          highlightBgGroup.style.display =
            cfg.subtitle.highlightStyle === "background" ? "" : "none";
        });
      });

      highlightRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          cfg.subtitle.highlightStyle = radio.value;
          highlightBgGroup.style.display =
            cfg.subtitle.highlightStyle === "background" ? "" : "none";
        });
      });

      // Highlight text color
      const highlightTextColor = qS("#highlight-text-color");
      highlightTextColor.addEventListener("input", (e) => {
        cfg.subtitle.highlightTextColor = e.target.value;
      });

      // Highlight background color
      const highlightBgColor = qS("#highlight-bg-color");
      highlightBgColor.addEventListener("input", (e) => {
        cfg.subtitle.highlightBgColor = e.target.value;
      });

      backBtn.addEventListener("click", () => {
        if (!wizardState.transitionLock) showSection(2, true);
      });

      finishBtn.addEventListener("click", () => {
        if (!wizardState.transitionLock) {
          showSection(4);
        }
      });
    },
  };
}

/**
 * Create completion section
 */
function createCompletionSection() {
  const cfg = wizardState.config;
  const configJSON = JSON.stringify(cfg, null, 2);

  return {
    title: "Configuration Complete!",
    html: `
      <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; text-align: center; max-width: 600px; margin-bottom: 2rem;">
        Your configuration has been created successfully. You can save it now or copy it for later use.
      </p>
      
      <div class="fcc-config-output">
        <div class="fcc-output-label">Configuration JSON:</div>
        <pre class="fcc-output-code">${configJSON}</pre>
      </div>
      
      <div class="fcc-button-group fcc-animate-element">
        <button class="heroui-button heroui-button-secondary" id="copy-btn">
          <span class="heroui-button-text">Copy to Clipboard</span>
        </button>
        <button class="heroui-button" id="save-btn">
          <span class="heroui-button-text">Save & Close</span>
        </button>
      </div>
    `,
    onMount: () => {
      const copyBtn = qS("#copy-btn");
      const saveBtn = qS("#save-btn");

      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(configJSON);
          const btnText = copyBtn.querySelector(".heroui-button-text");
          const originalText = btnText.textContent;
          btnText.textContent = "Copied!";
          setTimeout(() => {
            btnText.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      });

      saveBtn.addEventListener("click", () => {
        saveConfig(cfg);
        closeConfigOverlay();
        if (wizardState.onComplete) {
          wizardState.onComplete(cfg);
        }
      });
    },
  };
}

/**
 * Transition to new content with animation
 * @param {Object} section - Section object with title, html, and onMount
 * @param {boolean} backward - Whether transitioning backward
 */
function transitionToContent(section, backward = false) {
  if (wizardState.transitionLock) return;

  wizardState.transitionLock = true;

  const container = qS("#fcc-glass-container");
  const contentInner = qS("#fcc-glass-content-inner");
  const currentElements = Array.from(contentInner.children);

  // Slide out current elements
  currentElements.forEach((el, index) => {
    el.classList.add("fcc-animate-element");
    setTimeout(() => {
      el.classList.add(backward ? "fcc-slide-out-right" : "fcc-slide-out-left");
    }, index * 100);
  });

  const slideOutDuration = currentElements.length * 100 + 1000;

  setTimeout(() => {
    // Clear and add new content
    contentInner.innerHTML = "";

    const newElements = [];

    // Add title if provided
    if (section.title) {
      const titleEl = cE("h1");
      titleEl.className = "fcc-config-title fcc-animate-element";
      titleEl.classList.add(backward ? "fcc-slide-out-left" : "fcc-slide-out-right");
      titleEl.textContent = section.title;
      newElements.push(titleEl);
      contentInner.appendChild(titleEl);
    }

    // Add HTML content
    const tempContainer = cE("div");
    tempContainer.innerHTML = section.html;
    Array.from(tempContainer.children).forEach((child) => {
      child.classList.add(backward ? "fcc-slide-out-left" : "fcc-slide-out-right");
      newElements.push(child);
      contentInner.appendChild(child);
    });

    // Recalculate size
    requestAnimationFrame(() => {
      // Slide in new elements
      setTimeout(() => {
        newElements.forEach((el, index) => {
          setTimeout(() => {
            el.classList.remove("fcc-slide-out-left", "fcc-slide-out-right");
          }, index * 100);
        });
      }, 100);

      // Call onMount after elements are in place
      if (section.onMount) {
        setTimeout(() => {
          section.onMount();
        }, 1200);
      }

      setTimeout(() => {
        wizardState.transitionLock = false;
      }, slideOutDuration + 500);
    });
  }, slideOutDuration);
}

/**
 * Close the configuration overlay
 */
function closeConfigOverlay() {
  const overlay = qS("#fcc-config-overlay");
  if (overlay) {
    overlay.classList.remove("fcc-visible");
    setTimeout(() => {
      overlay.remove();
    }, 500);
  }
}

/**
 * Export configuration to JSON string
 * @param {Object} config - Configuration object
 * @returns {string} JSON string
 */
export function exportConfig(config) {
  return JSON.stringify(config, null, 2);
}

/**
 * Import configuration from JSON string
 * @param {string} jsonString - JSON string
 * @returns {Object} Configuration object
 */
export function importConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    return applyConfigDefaults(config);
  } catch (err) {
    console.error("Failed to import configuration:", err);
    return null;
  }
}
