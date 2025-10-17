/**
 * Subtitle Library - Manages the subtitle display overlay
 * Handles text display and positioning
 */

import { cE, qS, qSA } from "../utils/dom.js";

/**
 * SubtitleLibrary class - manages subtitle display
 */
class SubtitleLibrary {
  constructor() {
    this.el = null; // The <p> element containing subtitle text
    this.ctn = null; // The container div
    this.parentEl = null; // Parent element to attach to
    this.config = null; // Configuration reference
  }

  /**
   * Initialize subtitle display
   * @param {string} txt - Full text to display
   * @param {HTMLElement} parent - Optional parent element
   * @param {Object} config - Configuration object
   */
  init(txt, parent, config) {
    this.config = config;

    if (parent) {
      this.parentEl = parent;
    }

    // Create subtitle preview container if not exists
    if (!this.el) {
      const pv = cE("div");
      pv.className = "fcc-subtitle-preview";
      pv.innerHTML = `<div class="fcc-subtitle-container"><p class="fcc-subtitle-text"></p></div>`;
      (this.parentEl || document.body).appendChild(pv);

      this.el = qS(pv, ".fcc-subtitle-text");
      this.ctn = qS(pv, ".fcc-subtitle-container");

      // Make draggable only if not in a custom parent
      if (!this.parentEl) {
        this.makeDraggable(this.ctn);
      }
    }

    // Display text
    if (txt) {
      this.el.textContent = txt;
      this.updateStyles();
    }
  }

  /**
   * Update displayed text
   * @param {string} text - Text to display
   */
  setText(text) {
    if (this.el) {
      this.el.textContent = text;
    }
  }

  /**
   * Make an element draggable (desktop and touch)
   * @param {HTMLElement} e - Element to make draggable
   */
  makeDraggable(e) {
    let x = 0,
      y = 0,
      isDragging = false;

    const mouseStart = (ev) => {
      isDragging = true;
      const clientX = ev.touches && ev.touches.length ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches && ev.touches.length ? ev.touches[0].clientY : ev.clientY;
      x = clientX - e.offsetLeft;
      y = clientY - e.offsetTop;
      ev.preventDefault();
    };

    const mouseMove = (ev) => {
      if (!isDragging) return;
      const clientX = ev.touches && ev.touches.length ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches && ev.touches.length ? ev.touches[0].clientY : ev.clientY;
      e.style.left = clientX - x + "px";
      e.style.top = clientY - y + "px";
      e.style.transform = "none";
      e.parentElement.style.transform = "none";
      ev.preventDefault();
    };

    const mouseEnd = () => (isDragging = false);

    // Desktop events
    e.addEventListener("mousedown", mouseStart);
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseEnd);

    // Touch events
    e.addEventListener("touchstart", mouseStart);
    document.addEventListener("touchmove", mouseMove);
    document.addEventListener("touchend", mouseEnd);
  }

  /**
   * Update subtitle styles based on current configuration
   */
  updateStyles() {
    if (!this.ctn || !this.config) return;

    // Default subtitle config
    const defaultSubtitleConfig = {
      bgColor: "#000000",
      bgOpacity: 80,
      textColor: "#ffffff",
      textOpacity: 100,
      fontSize: 18,
    };

    const subtitleConfig = this.config.subtitle || defaultSubtitleConfig;
    const { bgColor, bgOpacity, textColor, textOpacity, fontSize } = subtitleConfig;

    // Convert hex colors to RGBA with opacity
    const hexToRgba = (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    // Apply container styles
    this.ctn.style.background = hexToRgba(bgColor, bgOpacity);
    this.el.style.color = hexToRgba(textColor, textOpacity);
    this.el.style.fontSize = fontSize + "px";
  }
}

export default SubtitleLibrary;
