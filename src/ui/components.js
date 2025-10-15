/**
 * UI Components - Reusable form controls and widgets
 * Includes sliders, font size controls, and other interactive elements
 */

import { cE, qS, qSA } from "../utils/dom.js";

/**
 * Create slider HTML markup
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step increment
 * @param {number} defaultValue - Initial value
 * @param {Object} labels - Optional value-to-label mapping
 * @param {string} valueId - ID for the value display element
 * @returns {string} HTML markup for slider
 */
export function createSlider(min, max, step, defaultValue, labels, valueId) {
  const percentage = ((defaultValue - min) / (max - min)) * 100;
  return `
<div
  class="fcc-slider-track"
  data-min="${min}"
  data-max="${max}"
  data-step="${step}"
  data-value="${defaultValue}"
>
  <div class="fcc-slider-fill" style="width:${percentage}%"></div>
  <div class="fcc-slider-thumb" style="left:${percentage}%"></div>
</div>
<div class="fcc-slider-value" id="${valueId}">${labels?.[defaultValue] || defaultValue}</div>
`;
}

/**
 * Initialize slider interactivity
 * @param {HTMLElement} track - Slider track element
 * @param {Object} labels - Optional value-to-label mapping
 * @param {HTMLElement} valueElement - Element to display current value
 */
export function initSlider(track, labels, valueElement) {
  const thumb = qS(track, ".fcc-slider-thumb");
  const fill = qS(track, ".fcc-slider-fill");
  const min = parseFloat(track.dataset.min);
  const max = parseFloat(track.dataset.max);
  const step = parseFloat(track.dataset.step);

  const formatValue = (value) => (labels && labels[value] !== undefined ? labels[value] : value);

  let isDragging = false;
  track.dataset.dragging = "false";

  // Emit custom change event
  const emitChange = (value) =>
    track.dispatchEvent(new CustomEvent("fcc-slider-change", { detail: { value } }));

  // Update slider position and value
  const updateSlider = (clientX) => {
    const rect = track.getBoundingClientRect();
    let percentage = ((clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    let value = min + (percentage / 100) * (max - min);
    value = Math.round(value / step) * step;
    value = Math.max(min, Math.min(max, value));

    percentage = ((value - min) / (max - min)) * 100;
    thumb.style.left = percentage + "%";
    fill.style.width = percentage + "%";
    track.dataset.value = value;

    if (valueElement) {
      valueElement.textContent = formatValue(value);
    }

    emitChange(value);
    return value;
  };

  // Mouse/touch event handlers
  const startDrag = (e) => {
    isDragging = true;
    track.dataset.dragging = "true";
    const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
    updateSlider(clientX);
    e.preventDefault();
  };

  const drag = (e) => {
    if (!isDragging) return;
    const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
    updateSlider(clientX);
    e.preventDefault();
  };

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    track.dataset.dragging = "false";
  };

  // Desktop events
  thumb.addEventListener("mousedown", startDrag);
  track.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);

  // Touch events
  thumb.addEventListener("touchstart", startDrag);
  track.addEventListener("touchstart", startDrag);
  document.addEventListener("touchmove", drag);
  document.addEventListener("touchend", stopDrag);
}

/**
 * Initialize font size control with slider and preset buttons
 * @param {HTMLElement} containerElement - Parent element for font size controls
 * @param {string} sliderContainerId - ID/selector for slider container
 * @param {string} presetsSelector - Selector for preset size buttons
 * @param {Object} config - Configuration object to update
 * @param {Object} subtitleLib - Subtitle library instance to update styles
 */
export function initFontSizeControl(
  containerElement,
  sliderContainerId,
  presetsSelector,
  config,
  subtitleLib
) {
  // Create font size labels (16px to 40px in steps of 2)
  const fontLabels = {};
  for (let size = 16; size <= 40; size += 2) {
    fontLabels[size] = `${size}px`;
  }

  // Create slider HTML
  const fontContainer = qS(containerElement, sliderContainerId);
  fontContainer.innerHTML = createSlider(
    16,
    40,
    2,
    config.subtitle.fontSize,
    fontLabels,
    "font-size-value"
  );

  // Get slider elements
  const fontValue = qS(fontContainer, "#font-size-value");
  const fontTrack = qS(fontContainer, ".fcc-slider-track");
  const sizeButtons = qSA(containerElement, presetsSelector);

  // Initialize slider
  initSlider(fontTrack, fontLabels, fontValue);

  // Update font size state (config + UI)
  const setFontSizeState = (value) => {
    config.subtitle.fontSize = value;
    if (fontValue) {
      fontValue.textContent = fontLabels[value] || `${value}px`;
    }
    subtitleLib.updateStyles();

    // Update active button state
    sizeButtons.forEach((btn) => {
      btn.classList.toggle("active", parseFloat(btn.dataset.size) === value);
    });
  };

  // Listen to slider changes
  fontTrack.addEventListener("fcc-slider-change", (ev) => {
    const value = parseFloat(ev.detail.value);
    setFontSizeState(value);
  });

  // Programmatically set font size (for preset buttons)
  const programmaticFontSize = (value) => {
    const min = parseFloat(fontTrack.dataset.min);
    const max = parseFloat(fontTrack.dataset.max);
    const percentage = ((value - min) / (max - min)) * 100;

    qS(fontTrack, ".fcc-slider-thumb").style.left = percentage + "%";
    qS(fontTrack, ".fcc-slider-fill").style.width = percentage + "%";
    fontTrack.dataset.value = value;
    fontTrack.dispatchEvent(new CustomEvent("fcc-slider-change", { detail: { value } }));
  };

  // Set initial state
  const currentSize = parseFloat(fontTrack.dataset.value || config.subtitle.fontSize);
  setFontSizeState(currentSize);

  // Attach preset button handlers
  sizeButtons.forEach((btn) => {
    const btnSize = parseFloat(btn.dataset.size);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      programmaticFontSize(btnSize);
    });
  });
}

/**
 * Initialize color picker using Coloris library
 * @param {HTMLElement} input - Input element to attach color picker to
 * @param {Function} onChange - Callback when color changes
 * @param {Object} options - Coloris configuration options
 */
export function initColorPicker(input, onChange, options = {}) {
  if (!window.Coloris) {
    console.warn("Coloris library not loaded");
    return;
  }

  // Apply Coloris to the input
  window.Coloris({
    el: input,
    theme: "pill",
    themeMode: "dark",
    formatToggle: true,
    alpha: true,
    ...options,
  });

  // Listen for changes
  input.addEventListener("change", (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  });
}

/**
 * Create a radio button group
 * @param {string} name - Radio group name
 * @param {Array} options - Array of {value, label, checked} objects
 * @param {Function} onChange - Callback when selection changes
 * @returns {HTMLElement} Container element with radio buttons
 */
export function createRadioGroup(name, options, onChange) {
  const container = cE("div");
  container.className = "fcc-radio-group";

  options.forEach(({ value, label, checked }) => {
    const radioWrapper = cE("label");
    radioWrapper.className = "fcc-radio-label";

    const radioInput = cE("input");
    radioInput.type = "radio";
    radioInput.name = name;
    radioInput.value = value;
    radioInput.checked = checked || false;

    if (onChange) {
      radioInput.addEventListener("change", (e) => {
        if (e.target.checked) {
          onChange(value);
        }
      });
    }

    const radioText = cE("span");
    radioText.textContent = label;

    radioWrapper.appendChild(radioInput);
    radioWrapper.appendChild(radioText);
    container.appendChild(radioWrapper);
  });

  return container;
}

/**
 * Create a toggle switch
 * @param {string} id - Unique ID for the toggle
 * @param {boolean} checked - Initial checked state
 * @param {Function} onChange - Callback when toggle changes
 * @returns {HTMLElement} Toggle switch element
 */
export function createToggle(id, checked, onChange) {
  const label = cE("label");
  label.className = "fcc-toggle";

  const input = cE("input");
  input.type = "checkbox";
  input.id = id;
  input.checked = checked;

  if (onChange) {
    input.addEventListener("change", (e) => {
      onChange(e.target.checked);
    });
  }

  const slider = cE("span");
  slider.className = "fcc-toggle-slider";

  label.appendChild(input);
  label.appendChild(slider);

  return label;
}

export default {
  createSlider,
  initSlider,
  initFontSizeControl,
  initColorPicker,
  createRadioGroup,
  createToggle,
};
