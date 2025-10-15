/**
 * Configuration Wizard - Multi-step configuration screens
 * Handles initial setup, model configuration, and subtitle appearance settings
 */

import { cE, qS, qSA } from "../utils/dom.js";
import { createSlider, initSlider, initFontSizeControl } from "./components.js";

/**
 * Wizard state and transition lock
 */
const transitionLock = { locked: false };

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
 * @param {Function} onNext - Callback for next button (goes to model config)
 * @param {boolean} backward - Animation direction
 */
export function showInitialConfig(
  config,
  globalInterface,
  simpleBar,
  globalContainer,
  onNext,
  backward = false
) {
  const contentHtml = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Choose TTS Engine</label>
  <div class="fcc-radio-option" data-value="webspeech">
    <label class="fcc-radio-label"
      ><input type="radio" name="tts-engine" value="webspeech" ${
        config.ttsEngine === "webspeech" ? "checked" : ""
      } />
      <div class="fcc-radio-title">Web Speech API</div></label
    >
    <p class="fcc-radio-desc">
      Built-in browser API. Works instantly with no downloads. Lightweight and fast, perfect for
      quick setup.
    </p>
  </div>
  <div class="fcc-radio-option" data-value="transformers">
    <label class="fcc-radio-label"
      ><input type="radio" name="tts-engine" value="transformers" ${
        config.ttsEngine === "transformers" ? "checked" : ""
      } />
      <div class="fcc-radio-title">Transformers.js</div></label
    >
    <p class="fcc-radio-desc">
      High-quality AI models running locally in your browser. Offers the best voice quality with
      advanced neural networks (170-350MB download).
    </p>
  </div>
  <div class="fcc-radio-option" data-value="piper">
    <label class="fcc-radio-label"
      ><input type="radio" name="tts-engine" value="piper" ${
        config.ttsEngine === "piper" ? "checked" : ""
      } />
      <div class="fcc-radio-title">Piper TTS</div></label
    >
    <p class="fcc-radio-desc">
      Balanced quality and performance. Fast neural TTS with natural-sounding voices (30-60MB
      download).
    </p>
  </div>
</div>
<div class="fcc-button-group fcc-animate-element">
  <button class="heroui-button ${config.ttsEngine ? "" : "heroui-button-outline"}" id="next-btn" ${
    config.ttsEngine ? "" : "disabled"
  }>
    <span class="heroui-button-text">Next</span>
  </button>
</div>
`;

  transitionToPage(
    contentHtml,
    "Initial Configuration",
    backward,
    globalInterface,
    simpleBar,
    globalContainer
  );

  const elementsLoadDelay = 1200 + 3 * 100;

  setTimeout(() => {
    const radioOptions = qSA(globalInterface, ".fcc-radio-option");
    const radioInputs = qSA(globalInterface, 'input[name="tts-engine"]');
    const nextBtn = qS(globalInterface, "#next-btn");

    // Highlight selected option
    if (config.ttsEngine) {
      const selectedOption = qS(
        globalInterface,
        `.fcc-radio-option[data-value="${config.ttsEngine}"]`
      );
      if (selectedOption) selectedOption.classList.add("selected");
    }

    // Click handlers for options
    radioOptions.forEach((option, i) => {
      option.addEventListener("click", () => {
        radioInputs[i].checked = true;
        config.ttsEngine = radioInputs[i].value;
        radioOptions.forEach((o) => o.classList.remove("selected"));
        option.classList.add("selected");
        nextBtn.disabled = false;
        nextBtn.classList.remove("heroui-button-outline");
      });
    });

    // Change handlers for radio inputs
    radioInputs.forEach((radio) => {
      radio.addEventListener("change", () => {
        config.ttsEngine = radio.value;
        radioOptions.forEach((o) => o.classList.remove("selected"));
        const selectedOption = qS(
          globalInterface,
          `.fcc-radio-option[data-value="${radio.value}"]`
        );
        if (selectedOption) selectedOption.classList.add("selected");
        nextBtn.disabled = false;
        nextBtn.classList.remove("heroui-button-outline");
      });
    });

    // Next button handler
    nextBtn.addEventListener("click", () => {
      if (!nextBtn.disabled && !transitionLock.locked && onNext) {
        onNext();
      }
    });
  }, elementsLoadDelay);
}

/**
 * Show model configuration screen (engine-specific settings)
 * @param {Object} config - Configuration object
 * @param {Object} defaultConfig - Default configuration values
 * @param {HTMLElement} globalInterface - Main container element
 * @param {Object} simpleBar - SimpleBar instance
 * @param {HTMLElement} globalContainer - Container element
 * @param {Function} onBack - Callback for back button
 * @param {Function} onNext - Callback for next button (goes to subtitle config)
 */
export function showModelConfig(
  config,
  defaultConfig,
  globalInterface,
  simpleBar,
  globalContainer,
  onBack,
  onNext
) {
  let optionsHtml = "";

  if (config.ttsEngine === "webspeech") {
    const voicePref = config.webspeech?.voice || "default";
    const ratePref = config.webspeech?.rate ?? 1;

    optionsHtml = `<div class="fcc-option-group fcc-animate-element">
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
  } else if (config.ttsEngine === "transformers") {
    optionsHtml = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Model</label>
  <p class="fcc-option-desc">
    Choose the AI model to use. Larger models offer better quality but require more resources.
  </p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="speecht5">
      <label
        ><input type="radio" name="model" value="speecht5" checked />
        <span class="fcc-radio-title">SpeechT5 - Balanced (170MB)</span></label>
    </div>
    <div class="fcc-compact-radio" data-value="vits">
      <label
        ><input type="radio" name="model" value="vits" />
        <span class="fcc-radio-title">VITS - High Quality (350MB)</span></label>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Voice Type</label>
  <p class="fcc-option-desc">Select the voice characteristics.</p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="neutral">
      <label
        ><input type="radio" name="voice-type" value="neutral" checked />
        <span class="fcc-radio-title">Neutral</span></label>
    </div>
    <div class="fcc-compact-radio" data-value="female">
      <label
        ><input type="radio" name="voice-type" value="female" />
        <span class="fcc-radio-title">Female</span></label>
    </div>
    <div class="fcc-compact-radio" data-value="male">
      <label
        ><input type="radio" name="voice-type" value="male" />
        <span class="fcc-radio-title">Male</span></label>
    </div>
  </div>
</div>`;
  } else if (config.ttsEngine === "piper") {
    optionsHtml = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Voice Model</label>
  <p class="fcc-option-desc">
    Choose a Piper voice model. Quality affects file size and processing time.
  </p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="en_US-lessac-medium">
      <label
        ><input type="radio" name="piper-voice" value="en_US-lessac-medium" checked />
        <span class="fcc-radio-title">US English - Lessac (Medium, 30MB)</span></label>
    </div>
    <div class="fcc-compact-radio" data-value="en_US-lessac-high">
      <label
        ><input type="radio" name="piper-voice" value="en_US-lessac-high" />
        <span class="fcc-radio-title">US English - Lessac (High, 60MB)</span></label>
    </div>
    <div class="fcc-compact-radio" data-value="en_GB-alan-medium">
      <label
        ><input type="radio" name="piper-voice" value="en_GB-alan-medium" />
        <span class="fcc-radio-title">British English - Alan (Medium, 30MB)</span></label>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Speaking Speed</label>
  <p class="fcc-option-desc">Adjust the speed of speech generation.</p>
  <div class="fcc-slider-container" id="speed-slider-container"></div>
</div>`;
  }

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
    false,
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
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Highlight Style</label>
  <p class="fcc-option-desc">Choose how words are highlighted during reading.</p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="text">
      <label
        ><input type="radio" name="highlight-style" value="text" checked />
        <span class="fcc-radio-title">Text Color Change</span></label>
    </div>
    <div class="fcc-compact-radio" data-value="background">
      <label
        ><input type="radio" name="highlight-style" value="background" />
        <span class="fcc-radio-title">Background Rectangle</span></label>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Highlight Text Color</label>
  <p class="fcc-option-desc">Color of the highlighted word text.</p>
  <div class="fcc-color-picker-group">
    <div class="fcc-color-input-wrapper">
      <div class="fcc-color-input-row">
        <input type="text" class="fcc-color-input coloris-input" id="highlight-text-color-input" data-coloris />
        <span class="fcc-color-preview" id="highlight-text-color-preview"></span>
      </div>
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element" id="highlight-bg-color-group">
  <label class="fcc-option-label">Highlight Background Color</label>
  <p class="fcc-option-desc">Background color when using rectangle highlight style.</p>
  <div class="fcc-color-picker-group">
    <div class="fcc-color-input-wrapper">
      <div class="fcc-color-input-row">
        <input type="text" class="fcc-color-input coloris-input" id="highlight-bg-color-input" data-coloris />
        <span class="fcc-color-preview" id="highlight-bg-color-preview"></span>
      </div>
    </div>
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
    // Initialize subtitle preview with sample text
    subtitleLib.init("Let learning be the light of your new life", null, config);
    subtitleLib.updateStyles();
    subtitleLib.startAutoAdvance(300);

    // Background opacity slider
    const opacityLabels = {};
    for (let i = 0; i <= 100; i += 5) {
      opacityLabels[i] = `${i}%`;
    }

    const opacityContainer = qS(globalInterface, "#bg-opacity-slider");
    opacityContainer.innerHTML = createSlider(
      0,
      100,
      5,
      config.subtitle.bgOpacity,
      opacityLabels,
      "opacity-value"
    );

    const opacityValue = qS(opacityContainer, "#opacity-value");
    const opacityTrack = qS(opacityContainer, ".fcc-slider-track");
    initSlider(opacityTrack, opacityLabels, opacityValue);

    if (opacityValue) {
      opacityValue.textContent = `${config.subtitle.bgOpacity}%`;
    }

    opacityTrack.addEventListener("fcc-slider-change", (ev) => {
      const value = ev.detail.value;
      config.subtitle.bgOpacity = value;
      if (opacityValue) {
        opacityValue.textContent = `${value}%`;
      }

      // Update background color with new opacity
      const rgb = config.subtitle.bgColor.match(/\d+/g) || [0, 0, 0];
      config.subtitle.bgColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${value / 100})`;
      subtitleLib.updateStyles();
    });

    // Font size control
    initFontSizeControl(globalInterface, "#font-size-slider", ".fcc-size-btn", config, subtitleLib);

    // Color pickers
    const textColorInput = qS(globalInterface, "#text-color-input");
    const highlightTextColorInput = qS(globalInterface, "#highlight-text-color-input");
    const highlightBgColorInput = qS(globalInterface, "#highlight-bg-color-input");
    const textColorPreview = qS(globalInterface, "#text-color-preview");
    const highlightTextColorPreview = qS(globalInterface, "#highlight-text-color-preview");
    const highlightBgColorPreview = qS(globalInterface, "#highlight-bg-color-preview");

    const openPicker = (input) => {
      if (!input) return;
      input.focus();
      input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };

    // Set initial values
    textColorInput.value = config.subtitle.textColor;
    highlightTextColorInput.value = config.subtitle.highlightTextColor;
    highlightBgColorInput.value = config.subtitle.highlightBgColor;

    if (textColorPreview) textColorPreview.style.background = config.subtitle.textColor;
    if (highlightTextColorPreview)
      highlightTextColorPreview.style.background = config.subtitle.highlightTextColor;
    if (highlightBgColorPreview)
      highlightBgColorPreview.style.background = config.subtitle.highlightBgColor;

    // Preview click handlers
    if (textColorPreview)
      textColorPreview.addEventListener("click", () => openPicker(textColorInput));
    if (highlightTextColorPreview)
      highlightTextColorPreview.addEventListener("click", () =>
        openPicker(highlightTextColorInput)
      );
    if (highlightBgColorPreview)
      highlightBgColorPreview.addEventListener("click", () => openPicker(highlightBgColorInput));

    // Highlight style radio buttons
    const highlightStyleRadios = qSA(globalInterface, 'input[name="highlight-style"]');
    const highlightBgColorGroup = qS(globalInterface, "#highlight-bg-color-group");

    const updateHighlightStyleVisibility = () => {
      const style = config.subtitle.highlightStyle;
      if (highlightBgColorGroup) {
        highlightBgColorGroup.style.display = style === "background" ? "block" : "none";
      }
    };
    updateHighlightStyleVisibility();

    // Compact radio handlers
    qSA(globalInterface, ".fcc-compact-radio").forEach((radio) => {
      radio.addEventListener("click", () => {
        const input = qS(radio, 'input[type="radio"]');
        if (input && input.name === "highlight-style") {
          input.checked = true;
          config.subtitle.highlightStyle = input.value;
          qSA(globalInterface, 'input[name="highlight-style"]').forEach((r) =>
            r.closest(".fcc-compact-radio").classList.remove("selected")
          );
          radio.classList.add("selected");
          updateHighlightStyleVisibility();
          subtitleLib.updateStyles();
        }
      });
    });

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

        textColorInput.addEventListener("input", () => {
          config.subtitle.textColor = textColorInput.value;
          if (textColorPreview) textColorPreview.style.background = textColorInput.value;
          subtitleLib.updateStyles();
        });

        highlightTextColorInput.addEventListener("input", () => {
          config.subtitle.highlightTextColor = highlightTextColorInput.value;
          if (highlightTextColorPreview)
            highlightTextColorPreview.style.background = highlightTextColorInput.value;
          subtitleLib.updateStyles();
        });

        highlightBgColorInput.addEventListener("input", () => {
          config.subtitle.highlightBgColor = highlightBgColorInput.value;
          if (highlightBgColorPreview)
            highlightBgColorPreview.style.background = highlightBgColorInput.value;
          subtitleLib.updateStyles();
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
      subtitleLib.stopAutoAdvance();
      if (onBack) onBack();
    });

    qS(globalInterface, "#finish-btn").addEventListener("click", (e) => {
      e.preventDefault();
      if (transitionLock.locked) return;
      subtitleLib.stopAutoAdvance();
      if (onFinish) onFinish();
    });

    // Recalculate scrollbar
    if (simpleBar) simpleBar.recalculate();
  }, elementsLoadDelay);
}

export default {
  transitionToPage,
  showInitialConfig,
  showModelConfig,
  showSubtitleConfig,
};
