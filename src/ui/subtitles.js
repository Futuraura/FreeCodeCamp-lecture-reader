/**
 * Subtitle Library - Manages the subtitle display overlay
 * Handles text display, word highlighting, animations, and drag-and-drop positioning
 */

import { cE, qS, qSA } from "../utils/dom.js";

/**
 * SubtitleLibrary class - manages subtitle display and highlighting
 */
class SubtitleLibrary {
  constructor() {
    this.el = null; // The <p> element containing subtitle text
    this.ctn = null; // The container div
    this.words = []; // Current chunk's words as array
    this.chunks = []; // All text chunks (sentences)
    this.cIdx = -1; // Current word index
    this.chunkIdx = -1; // Current chunk index
    this.aId = null; // Auto-advance interval ID
    this.hBg = null; // Highlight background element (for background style)
    this.parentEl = null; // Parent element to attach to
    this.config = null; // Configuration reference
  }

  /**
   * Initialize subtitle display
   * @param {string} txt - Full text to display (will be chunked)
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

      // Create highlight background element if using background highlight style
      if (config.subtitle.highlightStyle === "background") {
        this.hBg = cE("div");
        this.hBg.className = "fcc-subtitle-highlight-bg";
        this.el.insertBefore(this.hBg, this.el.firstChild);
      }
    }

    // Process and display text
    if (txt) {
      // Split into chunks (sentences or ~15 words)
      const sentences = txt.match(/[^.!?]+[.!?]+/g) || [txt];
      this.chunks = sentences.map((s) => s.trim()).filter((s) => s.length > 0);
      this.chunkIdx = -1;
      this.words = [];
      this.el.innerHTML = "";
      this.cIdx = -1;

      if (this.chunks.length > 0) {
        this.showChunk(this.chunks[0]);
        this.chunkIdx = 0;
        this.updateStyles();
      }
    }
  }

  /**
   * Display a specific text chunk
   * @param {string} chunkText - Text to display
   */
  showChunk(chunkText) {
    const safeText = chunkText || "";
    this.words = safeText.split(/\s+/).filter((w) => w.length > 0);
    this.el.innerHTML = this.words.map((w) => `<span>${w}</span>`).join(" ");

    // Re-insert highlight background if needed
    if (this.hBg && this.config.subtitle.highlightStyle === "background") {
      this.el.insertBefore(this.hBg, this.el.firstChild);
    }

    this.cIdx = -1;
  }

  /**
   * Highlight a specific word by index
   * @param {number} wordIdx - Index of word to highlight
   */
  highlightWord(wordIdx) {
    if (!this.el) return;

    const spans = qSA(this.el, "span");
    spans.forEach((span, idx) => {
      span.classList.toggle("highlighted", idx === wordIdx);
    });

    this.cIdx = wordIdx;
    this.updateStyles();
  }

  /**
   * Clear all word highlighting
   */
  clearHighlight() {
    if (!this.el) return;

    const spans = qSA(this.el, "span");
    spans.forEach((span) => {
      span.classList.remove("highlighted");
      span.style.color = "";
    });

    if (this.hBg) {
      this.hBg.style.opacity = "0";
    }

    this.cIdx = -1;
    this.updateStyles();
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
   * Auto-advance to next word (internal method)
   */
  advanceWord() {
    if (!this.el || this.words.length === 0) return;

    const spans = qSA(this.el, "span");

    // Clear previous highlight
    if (this.cIdx >= 0 && this.cIdx < spans.length) {
      spans[this.cIdx].classList.remove("highlighted");
      spans[this.cIdx].style.color = "";
    }

    // Move to next word
    this.cIdx = (this.cIdx + 1) % this.words.length;
    const currentSpan = spans[this.cIdx];
    currentSpan.classList.add("highlighted");

    // Apply highlight style
    if (this.config.subtitle.highlightStyle === "background" && this.hBg) {
      const rect = currentSpan.getBoundingClientRect();
      const parentRect = this.el.getBoundingClientRect();
      const padding = 2;
      currentSpan.style.color = this.config.subtitle.highlightTextColor;

      // Animate background highlight to word position
      if (window.gsap) {
        gsap.to(this.hBg, {
          left: rect.left - parentRect.left - padding,
          top: rect.top - parentRect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    } else if (this.config.subtitle.highlightStyle === "text") {
      currentSpan.style.color = this.config.subtitle.highlightTextColor;
    }
  }

  /**
   * Start auto-advancing through words
   * @param {number} interval - Milliseconds between word advances (default 600)
   */
  startAutoAdvance(interval = 600) {
    this.stopAutoAdvance();
    this.advanceWord();
    this.aId = setInterval(() => this.advanceWord(), interval);
  }

  /**
   * Stop auto-advancing and clear highlights
   */
  stopAutoAdvance() {
    if (this.aId) {
      clearInterval(this.aId);
      this.aId = null;
    }

    const spans = qSA(this.el, "span");
    spans.forEach((s) => {
      s.classList.remove("highlighted");
      s.style.color = "";
    });

    if (this.hBg) {
      this.hBg.style.opacity = "0";
    }

    this.cIdx = -1;
  }

  /**
   * Update subtitle styles based on current configuration
   */
  updateStyles() {
    if (!this.ctn || !this.config) return;

    const { bgColor, textColor, highlightStyle, highlightTextColor, highlightBgColor, fontSize } =
      this.config.subtitle;

    // Apply container styles
    this.ctn.style.background = bgColor;
    this.el.style.color = textColor;
    this.el.style.fontSize = fontSize + "px";

    // Create/remove highlight background based on style
    if (highlightStyle === "background" && !this.hBg) {
      this.hBg = cE("div");
      this.hBg.className = "fcc-subtitle-highlight-bg";
      this.el.insertBefore(this.hBg, this.el.firstChild);
    } else if (highlightStyle === "text" && this.hBg) {
      this.hBg.remove();
      this.hBg = null;
    }

    // Apply highlight background color
    if (this.hBg) {
      this.hBg.style.background = highlightBgColor;
      this.hBg.style.opacity = "1";
    }

    // Apply word-level styles
    const spans = qSA(this.el, "span");
    spans.forEach((s, i) => {
      if (s.classList.contains("highlighted")) {
        if (highlightStyle === "background" && this.hBg) {
          s.style.color = highlightTextColor;

          // Position highlight background
          const rect = s.getBoundingClientRect();
          const parentRect = this.el.getBoundingClientRect();
          const padding = 2;
          this.hBg.style.left = rect.left - parentRect.left - padding + "px";
          this.hBg.style.top = rect.top - parentRect.top - padding + "px";
          this.hBg.style.width = rect.width + padding * 2 + "px";
          this.hBg.style.height = rect.height + padding * 2 + "px";
        } else {
          s.style.color = highlightTextColor;
        }
      } else {
        s.style.color = textColor;
      }
    });
  }
}

export default SubtitleLibrary;
