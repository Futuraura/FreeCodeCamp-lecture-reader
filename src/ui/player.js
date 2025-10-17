/**
 * Lectify Player - Interactive TTS player with code display
 * Handles play button, player expansion, and synchronized code block display
 */

import { cE, qS, qSA } from "../utils/dom.js";

/**
 * Create the Lectify player interface
 * @param {Object} lectureData - Parsed lecture content (title, preBlocks, etc.)
 * @param {Object} config - User configuration
 * @returns {Object} - Player interface with controls
 */
export function createPlayer(lectureData, config) {
  const { title, preBlocks } = lectureData;

  // Create player container (initially collapsed as play button)
  const playerContainer = cE("div");
  playerContainer.className = "lectify-player-container";
  playerContainer.id = "lectify-player";

  // Create collapsed play button state
  const playButton = cE("div");
  playButton.className = "lectify-play-button";
  playButton.innerHTML = `
    <div class="lectify-play-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
      </svg>
    </div>
    <div class="lectify-play-pulse"></div>
  `;

  // Create expanded player state with side-by-side layout
  const expandedPlayer = cE("div");
  expandedPlayer.className = "lectify-player-expanded";
  expandedPlayer.style.display = "none";
  expandedPlayer.innerHTML = `
    <div class="lectify-player-background"></div>
    <div class="lectify-player-content">
      <div class="lectify-player-header">
        <h2 class="lectify-player-title">${title}</h2>
        <button class="lectify-close-button" aria-label="Close player">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <div class="lectify-main-area">
        <div class="lectify-code-panel" style="display: none;">
          <div class="lectify-code-display">
            <div class="lectify-code-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>Code blocks will appear here</p>
            </div>
          </div>
        </div>

        <div class="lectify-subtitle-panel">
          <div class="lectify-subtitle-scroll-area">
            <div class="lectify-subtitle-content"></div>
          </div>
        </div>
      </div>

      <div class="lectify-player-controls">
        <span class="lectify-time-display lectify-current-time">0:00</span>
        
        <button class="lectify-control-button lectify-play-pause" aria-label="Play/Pause">
          <svg class="lectify-play-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
          </svg>
          <svg class="lectify-pause-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: none;">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor"/>
          </svg>
        </button>
        
        <div class="lectify-progress-container">
          <div class="lectify-progress-bar">
            <div class="lectify-progress-fill"></div>
          </div>
        </div>
        
        <span class="lectify-time-display lectify-total-time">0:00</span>

        <button class="lectify-control-button lectify-settings" aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Append both states to container
  playerContainer.appendChild(playButton);
  playerContainer.appendChild(expandedPlayer);
  document.body.appendChild(playerContainer);

  // Detect and apply theme
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (!isDarkMode) {
    // Light mode adjustments
    playButton.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.6)";
  }

  // Listen for theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (e.matches) {
      // Dark mode
      playButton.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.4)";
    } else {
      // Light mode
      playButton.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.6)";
    }
  });

  // State management
  let isExpanded = false;
  let isPlaying = false;
  let currentCodeIndex = -1;
  let ttsController = null;

  /**
   * Set the TTS controller
   * @param {Object} controller - TTS controller instance
   */
  function setTTSController(controller) {
    ttsController = controller;
  }

  /**
   * Expand the player from button to full interface
   */
  function expandPlayer() {
    if (isExpanded) return;
    isExpanded = true;

    // Simple fade transition
    playButton.style.display = "none";
    expandedPlayer.style.display = "flex";

    if (window.gsap) {
      // Fade in expanded player
      gsap.fromTo(
        expandedPlayer,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Fade in player content
      gsap.fromTo(
        qS(expandedPlayer, ".lectify-player-content"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: "power2.out" }
      );
    } else {
      expandedPlayer.style.opacity = "1";
    }

    // Auto-start playback when player opens
    if (ttsController) {
      console.log("🎬 Auto-starting playback...");
      if (typeof ttsController.isPlaying === "function" && !ttsController.isPlaying()) {
        ttsController.play();
      } else if (typeof ttsController.play === "function") {
        ttsController.play();
      }
    } else {
      console.warn("⚠️ TTS controller not set yet");
    }
  }

  /**
   * Collapse the player back to button
   */
  function collapsePlayer() {
    if (!isExpanded) return;
    isExpanded = false;

    if (window.gsap) {
      // Fade out expanded player
      gsap.to(expandedPlayer, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          expandedPlayer.style.display = "none";
          playButton.style.display = "flex";

          // Fade in button
          gsap.fromTo(
            playButton,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
          );
        },
      });
    } else {
      expandedPlayer.style.display = "none";
      playButton.style.display = "flex";
    }
  }

  /**
   * Initialize subtitle content with all text blocks
   * @param {Array} textBlocks - Array of subtitle text blocks
   */
  function initSubtitles(textBlocks) {
    const subtitleContent = qS(expandedPlayer, ".lectify-subtitle-content");
    if (!subtitleContent) return;

    subtitleContent.innerHTML = "";

    textBlocks.forEach((text, index) => {
      const subtitleLine = cE("div");
      subtitleLine.className = "lectify-subtitle-line";
      subtitleLine.setAttribute("data-index", index);
      subtitleLine.textContent = text;
      subtitleLine.style.opacity = "0.5"; // Inactive by default
      subtitleContent.appendChild(subtitleLine);
    });

    // Show code panel from the start if there are code blocks
    const codePanel = qS(expandedPlayer, ".lectify-code-panel");
    if (preBlocks.length > 0 && codePanel) {
      codePanel.style.display = "block";
    }

    console.log(`📝 Initialized ${textBlocks.length} subtitle lines`);
    console.log(`📦 Found ${preBlocks.length} code blocks`);
  }

  /**
   * Highlight active subtitle and scroll to it
   * @param {number} index - Index of the active subtitle
   */
  function highlightSubtitle(index) {
    const subtitleLines = qSA(expandedPlayer, ".lectify-subtitle-line");
    const scrollArea = qS(expandedPlayer, ".lectify-subtitle-scroll-area");

    if (!subtitleLines.length) return;

    // Reset all to inactive
    subtitleLines.forEach((line) => {
      line.style.opacity = "0.5";
      line.classList.remove("active");
    });

    // Activate current line
    if (index >= 0 && index < subtitleLines.length) {
      const activeLine = subtitleLines[index];
      activeLine.style.opacity = "1";
      activeLine.classList.add("active");

      // Smooth scroll to center the active line
      if (scrollArea && window.gsap) {
        const lineTop = activeLine.offsetTop;
        const scrollAreaHeight = scrollArea.clientHeight;
        const lineHeight = activeLine.clientHeight;
        const targetScroll = lineTop - scrollAreaHeight / 2 + lineHeight / 2;

        gsap.to(scrollArea, {
          scrollTop: Math.max(0, targetScroll),
          duration: 0.5,
          ease: "power2.out",
        });
      } else if (scrollArea) {
        // Fallback without GSAP
        activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  /**
   * Show a code block in the player (appends to existing blocks)
   * @param {number} index - Index of the code block to display
   */
  function showCodeBlock(index) {
    if (index < 0 || index >= preBlocks.length) return;
    if (index === currentCodeIndex) return; // Already showing

    currentCodeIndex = index;
    const codePanel = qS(expandedPlayer, ".lectify-code-panel");
    const codeDisplay = qS(expandedPlayer, ".lectify-code-display");

    // Hide placeholder if exists (but don't remove it)
    const placeholder = qS(codeDisplay, ".lectify-code-placeholder");
    if (placeholder) {
      placeholder.style.display = "none";
    }

    // Show code panel if hidden
    if (codePanel && codePanel.style.display === "none") {
      codePanel.style.display = "block";
    }

    // Deactivate all existing code blocks
    const existingBlocks = qSA(codeDisplay, "pre");
    existingBlocks.forEach((block) => {
      block.classList.remove("lectify-code-active");
      block.style.opacity = "0.5";
    });

    // Clone and append new code block
    const codeBlock = preBlocks[index].cloneNode(true);
    codeBlock.classList.add("lectify-code-active");
    codeBlock.style.opacity = "1";

    // Add a wrapper for spacing
    const wrapper = cE("div");
    wrapper.className = "lectify-code-block-wrapper";
    wrapper.setAttribute("data-index", index);
    wrapper.appendChild(codeBlock);

    codeDisplay.appendChild(wrapper);

    // Animate in new code
    if (window.gsap) {
      gsap.fromTo(
        wrapper,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            // Auto-scroll to the new code block after animation
            const wrapperTop = wrapper.offsetTop;
            const wrapperHeight = wrapper.offsetHeight;
            const displayHeight = codeDisplay.clientHeight;
            const currentScroll = codeDisplay.scrollTop;

            // Calculate scroll position to center the wrapper
            const targetScroll = wrapperTop - displayHeight / 2 + wrapperHeight / 2;

            console.log(
              `📜 Scrolling to code block: top=${wrapperTop}, height=${wrapperHeight}, displayHeight=${displayHeight}, targetScroll=${targetScroll}`
            );

            gsap.to(codeDisplay, {
              scrollTop: Math.max(0, targetScroll),
              duration: 0.6,
              ease: "power2.out",
            });
          },
        }
      );
    } else {
      // Fallback without GSAP
      setTimeout(() => {
        const wrapperTop = wrapper.offsetTop;
        const wrapperHeight = wrapper.offsetHeight;
        const displayHeight = codeDisplay.clientHeight;
        const targetScroll = wrapperTop - displayHeight / 2 + wrapperHeight / 2;

        codeDisplay.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }, 450); // After fade in animation
    }

    console.log(`📦 Appended code block ${index + 1}/${preBlocks.length}`);
  }

  /**
   * Clear the code display
   */
  function clearCodeDisplay() {
    currentCodeIndex = -1;
    const codeDisplay = qS(expandedPlayer, ".lectify-code-display");

    if (window.gsap) {
      gsap.to(codeDisplay.children, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          codeDisplay.innerHTML = `
            <div class="lectify-code-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>Code blocks will appear here</p>
            </div>
          `;
          gsap.fromTo(
            codeDisplay.querySelector(".lectify-code-placeholder"),
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
          );
        },
      });
    } else {
      codeDisplay.innerHTML = `
        <div class="lectify-code-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>Code blocks will appear here</p>
        </div>
      `;
    }
  }

  /**
   * Update progress bar
   * @param {number} percentage - Progress percentage (0-100)
   */
  function updateProgress(percentage) {
    const progressFill = qS(expandedPlayer, ".lectify-progress-fill");
    if (progressFill) {
      progressFill.style.width = `${percentage * 100}%`;
    }
  }

  /**
   * Update time display
   * @param {number} current - Current time in seconds
   * @param {number} total - Total time in seconds
   */
  function updateTimeDisplay(current, total) {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentTimeEl = qS(expandedPlayer, ".lectify-current-time");
    const totalTimeEl = qS(expandedPlayer, ".lectify-total-time");

    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(total);
  }

  /**
   * Toggle play/pause button state
   * @param {boolean} playing - Whether audio is playing
   */
  function setPlayingState(playing) {
    isPlaying = playing;
    const playSvg = qS(expandedPlayer, ".lectify-play-svg");
    const pauseSvg = qS(expandedPlayer, ".lectify-pause-svg");

    if (playSvg && pauseSvg) {
      playSvg.style.display = playing ? "none" : "block";
      pauseSvg.style.display = playing ? "block" : "none";
    }
  }

  // Event listeners
  playButton.addEventListener("click", expandPlayer);

  const closeButton = qS(expandedPlayer, ".lectify-close-button");
  if (closeButton) {
    closeButton.addEventListener("click", collapsePlayer);
  }

  // Play/Pause button handler
  const playPauseButton = qS(expandedPlayer, ".lectify-play-pause");
  if (playPauseButton) {
    playPauseButton.addEventListener("click", () => {
      if (ttsController) {
        ttsController.togglePlayPause();
      }
    });
  } // Set initial state before animation
  playButton.style.transform = "scale(0) rotate(-180deg)";
  playButton.style.opacity = "0";

  // Initial entrance animation for play button (with delay to ensure page is loaded)
  if (window.gsap) {
    // Wait a moment to ensure everything is rendered
    setTimeout(() => {
      gsap.to(playButton, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      });

      // Pulse animation
      const pulseElement = qS(playButton, ".lectify-play-pulse");
      if (pulseElement) {
        gsap.to(pulseElement, {
          scale: 1.4,
          opacity: 0,
          duration: 1.5,
          repeat: -1,
          ease: "power2.out",
        });
      }
    }, 300);
  } else {
    // Fallback without GSAP
    setTimeout(() => {
      playButton.style.transform = "scale(1) rotate(0deg)";
      playButton.style.opacity = "1";
    }, 300);
  }

  // Return public API
  return {
    container: playerContainer,
    expandPlayer,
    collapsePlayer,
    showCodeBlock,
    clearCodeDisplay,
    initSubtitles,
    highlightSubtitle,
    updateProgress,
    updateTimeDisplay,
    setPlayingState,
    setTTSController,
    isExpanded: () => isExpanded,
    isPlaying: () => isPlaying,
    hasCodeBlocks: () => preBlocks && preBlocks.length > 0,
    destroy: () => {
      // Stop TTS if playing
      if (ttsController && typeof ttsController.stop === "function") {
        ttsController.stop();
      }
      // Remove player from DOM
      if (playerContainer.parentNode) {
        playerContainer.parentNode.removeChild(playerContainer);
      }
      console.log("🗑️ Player destroyed");
    },
  };
}
