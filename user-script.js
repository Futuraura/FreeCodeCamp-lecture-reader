// ==UserScript==
// @name         FreeCodeCamp lecture reader
// @namespace    http://tampermonkey.net/
// @version      2025-10-11
// @description  Adds a configurable lecture reader to replace the videos.
// @author       Mark Pikaro (Futuraura)
// @match        https://www.freecodecamp.org/learn/*/lecture-*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  if (!localStorage.getItem("freecodecampLectureReader")) {
    document.body.style.overflow = "hidden";

    // Load GSAP
    const gsapScript = document.createElement("script");
    gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    document.head.appendChild(gsapScript);

    // Load SimpleBar CSS
    const simplebarCSS = document.createElement("link");
    simplebarCSS.rel = "stylesheet";
    simplebarCSS.href = "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.css";
    document.head.appendChild(simplebarCSS);

    // Load SimpleBar JS
    const simplebarJS = document.createElement("script");
    simplebarJS.src = "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js";
    document.head.appendChild(simplebarJS);

    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
      body:has(.fcc-config-overlay){overflow:hidden!important}
      @media (min-width: 768px){
        body:has(.fcc-config-overlay){cursor:none!important}
        body:has(.fcc-config-overlay) *{cursor:none!important}
      }
      .fcc-config-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;font-family:'Space Grotesk',sans-serif;overflow:hidden;opacity:0;transition:opacity 1s ease}
      .fcc-config-overlay.fcc-visible{opacity:1}
      .fcc-cursor{display:none;pointer-events:none}
      @media (min-width: 768px){
        .fcc-cursor{display:block}
        .fcc-cursor__ball{left:0;mix-blend-mode:difference;position:fixed;top:0;z-index:10001}
        .fcc-cursor__ball circle{fill:#f7f8fa}
        .fcc-cursor__ball--big{will-change:transform}
        .fcc-cursor__ball--small{will-change:transform}
      }
      .fcc-gradient-bg{width:100%;height:100%;position:relative;overflow:hidden;background:linear-gradient(40deg,rgb(108,0,162),rgb(0,17,82))}
      .fcc-gradient-bg svg{position:fixed;top:0;left:0;width:0;height:0}
      .fcc-gradients-container{filter:url(#goo) blur(40px);width:100%;height:100%;position:relative;z-index:0}
      .fcc-gradient-bg .g1,.fcc-gradient-bg .g2,.fcc-gradient-bg .g3,.fcc-gradient-bg .g4,.fcc-gradient-bg .g5{position:absolute;width:80%;height:80%;top:calc(50% - 40%);left:calc(50% - 40%);mix-blend-mode:hard-light}
      .fcc-gradient-bg .g1{background:radial-gradient(circle at center,rgba(18,113,255,1) 0,rgba(18,113,255,0) 50%) no-repeat;animation:moveVertical 30s ease infinite}
      .fcc-gradient-bg .g2{background:radial-gradient(circle at center,rgba(221,74,255,1) 0,rgba(221,74,255,0) 50%) no-repeat;transform-origin:calc(50% - 400px);animation:moveInCircle 20s reverse infinite}
      .fcc-gradient-bg .g3{background:radial-gradient(circle at center,rgba(100,220,255,1) 0,rgba(100,220,255,0) 50%) no-repeat;top:calc(50% - 40% + 200px);left:calc(50% - 40% - 500px);transform-origin:calc(50% + 400px);animation:moveInCircle 40s linear infinite}
      .fcc-gradient-bg .g4{background:radial-gradient(circle at center,rgba(200,50,50,1) 0,rgba(200,50,50,0) 50%) no-repeat;transform-origin:calc(50% - 200px);animation:moveHorizontal 40s ease infinite;opacity:0.7}
      .fcc-gradient-bg .g5{width:160%;height:160%;top:calc(50% - 80%);left:calc(50% - 80%);background:radial-gradient(circle at center,rgba(214, 214, 43, 1) 0,rgba(180,180,50,0) 50%) no-repeat;transform-origin:calc(50% - 800px) calc(50% + 200px);animation:moveInCircle 20s ease infinite}
      @keyframes moveInCircle{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}
      @keyframes moveVertical{0%{transform:translateY(-50%)}50%{transform:translateY(50%)}100%{transform:translateY(-50%)}}
      @keyframes moveHorizontal{0%{transform:translateX(-50%) translateY(-10%)}50%{transform:translateX(50%) translateY(10%)}100%{transform:translateX(-50%) translateY(-10%)}}
      .fcc-glass-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:rgba(0,0,0,0.7);border-radius:0.75rem;padding:0;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 8px 32px 0 rgba(0,0,0,0.37);display:flex;flex-direction:column;align-items:center;overflow:hidden;transition:all 0.8s cubic-bezier(0.65, 0, 0.35, 1);max-height:80vh;max-width:90vw;width:0;height:0}
      .fcc-glass-container.fcc-sized{width:auto;height:auto}
      .fcc-glass-content-wrapper{width:100%;max-height:80vh}
      .fcc-glass-content-inner{padding:3rem;display:flex;flex-direction:column;align-items:center;gap:2rem}
      .simplebar-scrollbar::before{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.1);border-radius:3px;transition:background 0.2s ease}
      .simplebar-scrollbar.simplebar-visible::before{opacity:1}
      .simplebar-scrollbar:hover::before{background:rgba(255,255,255,0.35)}
      .simplebar-track{background:transparent;right:6px;width:6px;border-radius:3px}
      .simplebar-track.simplebar-vertical{top:12px;bottom:12px}
      .simplebar-content-wrapper{transition:all 0.8s cubic-bezier(0.65, 0, 0.35, 1)}
      .fcc-welcome-text{color:white;font-size:3rem;font-weight:700;text-align:center;margin:0;white-space:nowrap;position:relative;opacity:0;transition:opacity 0.8s ease}
      .fcc-welcome-text.fcc-visible{opacity:1}
      .fcc-config-title{color:white;font-size:2.5rem;font-weight:700;text-align:center;margin:0;white-space:nowrap;position:relative}
      .fcc-animate-element{transition:transform 1s cubic-bezier(0.65, 0, 0.35, 1), opacity 1s cubic-bezier(0.65, 0, 0.35, 1)}
      .fcc-slide-out-right{transform:translateX(calc(100% + 3rem + 50vw));opacity:0}
      .fcc-slide-out-left{transform:translateX(calc(-100% - 3rem - 50vw));opacity:0}
      .heroui-button{position:relative;display:inline-flex;align-items:center;justify-content:center;padding:0.75rem 2rem;font-size:1.125rem;font-weight:600;line-height:1.5;background:#0072f5;color:#fff;border:none;border-radius:0.875rem;cursor:pointer;transition:background 0.2s ease,box-shadow 0.2s ease,transform 1s cubic-bezier(0.65, 0, 0.35, 1),opacity 0.8s ease;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);overflow:hidden}
      .heroui-button.fcc-initial{opacity:0}
      .heroui-button.fcc-visible{opacity:1}
      .heroui-button::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0) 100%);z-index:0}
      .heroui-button:hover{background:#0062d1;box-shadow:0 4px 12px 0 rgba(0,114,245,0.4)}
      .heroui-button:active{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}
      .heroui-button-text{position:relative;z-index:1;font-size:1.5rem;font-family:'Space Grotesk',sans-serif}
      .fcc-config-content{display:flex;flex-direction:column;gap:1.5rem;width:100%;max-width:600px}
      .fcc-option-group{background:rgba(255,255,255,0.05);border-radius:1rem;padding:1.5rem;border:1px solid rgba(255,255,255,0.1);width:100%}
      .fcc-option-label{color:white;font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;display:block}
      .fcc-option-desc{color:rgba(255,255,255,0.8);font-size:0.95rem;margin-bottom:1rem;line-height:1.5}
      .fcc-select{width:100%;padding:0.75rem 1rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.2);border-radius:0.5rem;color:white;font-family:'Space Grotesk',sans-serif;font-size:1rem;cursor:pointer;transition:all 0.2s ease}
      .fcc-select:hover{background:rgba(0,0,0,0.4);border-color:rgba(255,255,255,0.3)}
      .fcc-select:focus{outline:none;border-color:#0072f5;box-shadow:0 0 0 3px rgba(0,114,245,0.2)}
      .fcc-select option{background:#1a1a2e;color:white}
      .fcc-slider-container{margin-top:1rem;padding:0 0.5rem}
      .fcc-slider-track{position:relative;width:100%;height:8px;border-radius:4px;background:rgba(255,255,255,0.1);cursor:pointer;transition:background 0.2s ease}
      .fcc-slider-track:hover{background:rgba(255,255,255,0.15)}
      .fcc-slider-fill{position:absolute;left:0;top:0;height:100%;background:#0072f5;border-radius:4px;pointer-events:none;transition:width 0.1s ease}
      .fcc-slider-thumb{position:absolute;top:50%;width:20px;height:20px;border-radius:50%;background:#0072f5;cursor:grab;transition:all 0.2s ease;box-shadow:0 2px 4px rgba(0,0,0,0.3);transform:translate(-50%,-50%)}
      .fcc-slider-thumb:hover{background:#0062d1;transform:translate(-50%,-50%) scale(1.1)}
      .fcc-slider-thumb:active{cursor:grabbing;transform:translate(-50%,-50%) scale(1.15)}
      .fcc-slider-value{color:white;font-size:1.125rem;font-weight:600;text-align:center;margin-top:0.75rem;min-height:1.5rem}
      .fcc-radio-group{display:flex;flex-direction:column;gap:0.75rem;margin-top:0.5rem}
      .fcc-button-group{display:flex;gap:1rem;margin-top:1rem;justify-content:center}
      .heroui-button-secondary{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2)}
      .heroui-button-secondary:hover{background:rgba(255,255,255,0.15)}
      .heroui-button-outline{background:transparent;border:2px solid rgba(255,255,255,0.3);cursor:not-allowed;opacity:0.5}
      .heroui-button-outline:hover{background:transparent;box-shadow:none;transform:none}
      .fcc-hidden{visibility:hidden;position:absolute;pointer-events:none}
      .fcc-radio-option{background:rgba(255,255,255,0.05);border-radius:1rem;padding:1.5rem;border:2px solid rgba(255,255,255,0.1);cursor:pointer;transition:all 0.2s ease;margin-bottom:1rem;width:100%}
      .fcc-radio-option:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2)}
      .fcc-radio-option.selected{background:rgba(0,114,245,0.15);border-color:#0072f5}
      .fcc-radio-option input[type="radio"]{margin-right:1rem;width:1.25rem;height:1.25rem;cursor:pointer}
      .fcc-radio-label{display:flex;align-items:center;cursor:pointer}
      .fcc-radio-title{color:white;font-size:1.25rem;font-weight:600;margin:0}
      .fcc-radio-desc{color:rgba(255,255,255,0.8);font-size:0.95rem;margin:0.5rem 0 0 2.25rem;line-height:1.5}
      .fcc-compact-radio{background:rgba(255,255,255,0.05);border-radius:0.75rem;padding:1rem 1.25rem;border:2px solid rgba(255,255,255,0.1);cursor:pointer;transition:all 0.2s ease}
      .fcc-compact-radio:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2)}
      .fcc-compact-radio.selected{background:rgba(0,114,245,0.15);border-color:#0072f5}
      .fcc-compact-radio input[type="radio"]{margin-right:0.75rem;width:1.125rem;height:1.125rem;cursor:pointer}
      .fcc-compact-radio label{display:flex;align-items:center;cursor:pointer;margin:0}
      .fcc-compact-radio .fcc-radio-title{font-size:1.125rem}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "fcc-config-overlay";
    overlay.innerHTML = `
      <div class="fcc-cursor">
        <div class="fcc-cursor__ball fcc-cursor__ball--big">
          <svg height="40" width="40">
            <circle cx="20" cy="20" r="20" stroke-width="0"></circle>
          </svg>
        </div>
        <div class="fcc-cursor__ball fcc-cursor__ball--small">
          <svg height="10" width="10">
            <circle cx="5" cy="5" r="5" stroke-width="0"></circle>
          </svg>
        </div>
      </div>
      <div class="fcc-gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
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
    `;

    document.body.appendChild(overlay);

    // Get container reference early for initial sizing
    const glassContainer = overlay.querySelector(".fcc-glass-container");
    const glassContentInner = overlay.querySelector(".fcc-glass-content-inner");

    // Start entrance animation sequence
    // 1. Fade in background
    requestAnimationFrame(() => {
      overlay.classList.add("fcc-visible");
    });

    // Initialize SimpleBar when loaded
    let simpleBarInstance = null;
    simplebarJS.onload = () => {
      const scrollWrapper = overlay.querySelector("[data-simplebar]");
      if (scrollWrapper && window.SimpleBar) {
        simpleBarInstance = new SimpleBar(scrollWrapper, {
          autoHide: false,
          forceVisible: true,
        });
      }
    };

    // Set initial size for welcome screen with animation sequence
    // Wait 1s after background fade, then size in container
    setTimeout(() => {
      const welcomeText = glassContentInner.querySelector(".fcc-welcome-text");
      const startButton = glassContentInner.querySelector(".heroui-button");

      if (welcomeText && startButton) {
        // Measure content
        const textRect = welcomeText.getBoundingClientRect();
        const buttonRect = startButton.getBoundingClientRect();

        const padding = 96; // 3rem * 2
        const gap = 32; // 2rem gap
        const width = Math.max(textRect.width, buttonRect.width) + padding;
        const height = textRect.height + buttonRect.height + gap + padding;

        // Set size and trigger size-in animation
        glassContainer.style.width = width + "px";
        glassContainer.style.height = height + "px";
        glassContainer.classList.add("fcc-sized");

        // Recalculate SimpleBar after setting container size
        if (simpleBarInstance) {
          simpleBarInstance.recalculate();
        }

        // Wait 1s after container sizes in, then fade in content
        setTimeout(() => {
          welcomeText.classList.add("fcc-visible");
          startButton.classList.add("fcc-visible");
        }, 1000);
      }
    }, 1000);

    // Custom cursor functionality
    let cursor;
    let bigBall;
    let smallBall;
    let widthMatches = false;

    // Hover effects for interactive elements (defined in outer scope)
    function onMouseHover() {
      if (typeof gsap !== "undefined" && bigBall) {
        gsap.to(bigBall, {
          scale: 2,
          duration: 0.3,
        });
      }
    }

    function onMouseHoverOut() {
      if (typeof gsap !== "undefined" && bigBall) {
        gsap.to(bigBall, {
          scale: 1,
          duration: 0.3,
        });
      }
    }

    // Wait for GSAP to load
    gsapScript.onload = () => {
      cursor = overlay.querySelector(".fcc-cursor");
      bigBall = overlay.querySelector(".fcc-cursor__ball--big");
      smallBall = overlay.querySelector(".fcc-cursor__ball--small");

      // Check screen width
      function togglePageCursor(e) {
        if (e.matches) {
          widthMatches = true;
        } else {
          widthMatches = false;
          cursor.style.display = "none";
        }
      }

      // Initialize media query listener
      const mediaQuery = window.matchMedia("(min-width: 768px)");
      togglePageCursor(mediaQuery);
      mediaQuery.addListener(togglePageCursor);

      // Move cursor on mouse move
      function onMouseMove(e) {
        if (widthMatches) {
          cursor.style.display = "block";
        }

        gsap.to(bigBall, {
          x: e.clientX - 20,
          y: e.clientY - 20,
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.to(smallBall, {
          x: e.clientX - 5,
          y: e.clientY - 5,
          duration: 0.1,
        });
      }

      // Add event listeners
      overlay.addEventListener("mousemove", onMouseMove);

      // Add hover listeners to hoverable elements
      addHoverListeners();
    };

    // Add hover listeners to hoverable elements
    function addHoverListeners() {
      overlay
        .querySelectorAll(
          ".heroui-button, .fcc-radio-option, .fcc-compact-radio, .fcc-slider-track"
        )
        .forEach((el) => {
          el.addEventListener("mouseenter", onMouseHover);
          el.addEventListener("mouseleave", onMouseHoverOut);
        });
    }

    // Configuration state
    const config = {
      ttsEngine: null,
    };

    // Custom slider creation function
    function createCustomSlider(min, max, step, defaultValue, labels, valueId) {
      const percentage = ((defaultValue - min) / (max - min)) * 100;
      return `
        <div class="fcc-slider-track" data-min="${min}" data-max="${max}" data-step="${step}" data-value="${defaultValue}">
          <div class="fcc-slider-fill" style="width:${percentage}%"></div>
          <div class="fcc-slider-thumb" style="left:${percentage}%"></div>
        </div>
        <div class="fcc-slider-value" id="${valueId}">${labels[defaultValue] || defaultValue}</div>
      `;
    }

    // Initialize slider functionality
    function initializeSlider(track, labels, valueElement) {
      const thumb = track.querySelector(".fcc-slider-thumb");
      const fill = track.querySelector(".fcc-slider-fill");
      const min = parseFloat(track.dataset.min);
      const max = parseFloat(track.dataset.max);
      const step = parseFloat(track.dataset.step);

      let isDragging = false;

      function updateSlider(clientX) {
        const rect = track.getBoundingClientRect();
        let percentage = ((clientX - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        // Calculate value based on percentage
        let value = min + (percentage / 100) * (max - min);

        // Round to nearest step
        value = Math.round(value / step) * step;
        value = Math.max(min, Math.min(max, value));

        // Recalculate percentage based on stepped value
        percentage = ((value - min) / (max - min)) * 100;

        // Update UI
        thumb.style.left = percentage + "%";
        fill.style.width = percentage + "%";
        track.dataset.value = value;

        // Update label
        if (valueElement) {
          valueElement.textContent = labels[value] || value;
        }

        return value;
      }

      function startDrag(e) {
        isDragging = true;
        updateSlider(e.clientX || e.touches[0].clientX);
        e.preventDefault();
      }

      function drag(e) {
        if (!isDragging) return;
        updateSlider(e.clientX || e.touches[0].clientX);
        e.preventDefault();
      }

      function stopDrag() {
        isDragging = false;
      }

      // Mouse events
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

    // Unified animation function for page transitions
    function transitionToPage(newContentHTML, newTitleText = null, backwards = false) {
      // Query all direct children elements in the container
      const currentElements = Array.from(glassContentInner.children);

      // Stagger slide-out animation for each element
      currentElements.forEach((element, index) => {
        element.classList.add("fcc-animate-element");
        setTimeout(() => {
          element.classList.add(backwards ? "fcc-slide-out-left" : "fcc-slide-out-right");
        }, index * 200);
      });

      // Wait for all slide-out animations to complete
      const slideOutDuration = currentElements.length * 200 + 1000;

      setTimeout(() => {
        // Remove old content
        glassContentInner.innerHTML = "";

        // Create new elements array to track what we're adding
        const newElements = [];

        // Add title if provided
        if (newTitleText) {
          const newTitle = document.createElement("h1");
          newTitle.className = "fcc-config-title fcc-animate-element";
          // Start from opposite side
          newTitle.classList.add(backwards ? "fcc-slide-out-right" : "fcc-slide-out-left");
          newTitle.textContent = newTitleText;
          newElements.push(newTitle);
          glassContentInner.appendChild(newTitle);
        }

        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = newContentHTML;

        // Append each child directly to glassContentInner (not wrapped in fcc-config-content)
        Array.from(tempContainer.children).forEach((child) => {
          // Add slide-out class to start from opposite side
          child.classList.add(backwards ? "fcc-slide-out-right" : "fcc-slide-out-left");
          newElements.push(child);
          glassContentInner.appendChild(child);
        });

        // Measure new content size
        requestAnimationFrame(() => {
          // Calculate total height of all elements
          let totalHeight = 0;
          let maxWidth = 0;

          newElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            totalHeight += rect.height;
            maxWidth = Math.max(maxWidth, rect.width);
          });

          const padding = 96; // 3rem * 2
          const gap = (newElements.length - 1) * 32; // 2rem gap between elements
          const newWidth = Math.max(696, maxWidth + padding);
          const newHeight = Math.min(window.innerHeight * 0.8, totalHeight + gap + padding);

          // Resize container
          glassContainer.style.width = newWidth + "px";
          glassContainer.style.height = newHeight + "px";

          // Recalculate SimpleBar after resizing
          if (simpleBarInstance) {
            simpleBarInstance.recalculate();
            // Scroll to top
            simpleBarInstance.getScrollElement().scrollTop = 0;
          }

          // Re-add hover listeners for custom cursor
          addHoverListeners();

          // Stagger slide-in animation by removing the slide-out class
          setTimeout(() => {
            newElements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.remove("fcc-slide-out-left", "fcc-slide-out-right");
              }, index * 200);
            });
          }, 100);
        });
      }, slideOutDuration);
    }

    function showInitialConfig(backwards = false) {
      const contentHTML = `
        <div class="fcc-option-group fcc-animate-element">
          <label class="fcc-option-label">Choose TTS Engine</label>
          
          <div class="fcc-radio-option" data-value="webspeech">
            <label class="fcc-radio-label">
              <input type="radio" name="tts-engine" value="webspeech">
              <div class="fcc-radio-title">Web Speech API</div>
            </label>
            <p class="fcc-radio-desc">Built-in browser API. Works instantly with no downloads. Lightweight and fast, perfect for quick setup.</p>
          </div>

          <div class="fcc-radio-option" data-value="transformers">
            <label class="fcc-radio-label">
              <input type="radio" name="tts-engine" value="transformers">
              <div class="fcc-radio-title">Transformers.js</div>
            </label>
            <p class="fcc-radio-desc">High-quality AI models running locally in your browser. Offers the best voice quality with advanced neural networks (170-350MB download).</p>
          </div>

          <div class="fcc-radio-option" data-value="piper">
            <label class="fcc-radio-label">
              <input type="radio" name="tts-engine" value="piper">
              <div class="fcc-radio-title">Piper TTS</div>
            </label>
            <p class="fcc-radio-desc">Balanced quality and performance. Fast neural TTS with natural-sounding voices (30-60MB download).</p>
          </div>
        </div>

        <div class="fcc-button-group fcc-animate-element">
          <button class="heroui-button heroui-button-outline" id="next-btn" disabled>
            <span class="heroui-button-text">Next</span>
          </button>
        </div>
      `;

      transitionToPage(contentHTML, "Initial Configuration", backwards);

      // Wait for content to be added, then attach event listeners
      const eventListenerDelay = 1200 + 3 * 200; // Initial delay + 3 elements * 200ms stagger (title + option group + button group)
      setTimeout(() => {
        const radioOptions = glassContentInner.querySelectorAll(".fcc-radio-option");
        const radioInputs = glassContentInner.querySelectorAll('input[name="tts-engine"]');
        const nextBtn = glassContentInner.querySelector("#next-btn");

        radioOptions.forEach((option, index) => {
          option.addEventListener("click", () => {
            radioInputs[index].checked = true;
            config.ttsEngine = radioInputs[index].value;

            // Update visual selection
            radioOptions.forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");

            // Enable and style the Next button
            nextBtn.disabled = false;
            nextBtn.classList.remove("heroui-button-outline");
          });
        });

        radioInputs.forEach((radio) => {
          radio.addEventListener("change", () => {
            config.ttsEngine = radio.value;

            // Update visual selection
            radioOptions.forEach((opt) => opt.classList.remove("selected"));
            const selectedOption = glassContentInner.querySelector(
              `.fcc-radio-option[data-value="${radio.value}"]`
            );
            if (selectedOption) selectedOption.classList.add("selected");

            // Enable and style the Next button
            nextBtn.disabled = false;
            nextBtn.classList.remove("heroui-button-outline");
          });
        });

        nextBtn.addEventListener("click", () => {
          if (!nextBtn.disabled) {
            showModelConfig();
          }
        });
      }, eventListenerDelay);
    }

    function showModelConfig() {
      let optionsHTML = "";

      if (config.ttsEngine === "webspeech") {
        optionsHTML = `
            <div class="fcc-option-group fcc-animate-element">
              <label class="fcc-option-label">Voice</label>
              <p class="fcc-option-desc">Select a voice from your system's available voices.</p>
              <div class="fcc-radio-group">
                <div class="fcc-compact-radio selected" data-value="default">
                  <label>
                    <input type="radio" name="voice" value="default" checked>
                    <span class="fcc-radio-title">Default Voice</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="female">
                  <label>
                    <input type="radio" name="voice" value="female">
                    <span class="fcc-radio-title">Female Voice</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="male">
                  <label>
                    <input type="radio" name="voice" value="male">
                    <span class="fcc-radio-title">Male Voice</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="fcc-option-group fcc-animate-element">
              <label class="fcc-option-label">Speech Rate</label>
              <p class="fcc-option-desc">Adjust how fast the text is read.</p>
              <div class="fcc-slider-container" id="rate-slider-container">
              </div>
            </div>
          `;
      } else if (config.ttsEngine === "transformers") {
        optionsHTML = `
            <div class="fcc-option-group fcc-animate-element">
              <label class="fcc-option-label">Model</label>
              <p class="fcc-option-desc">Choose the AI model to use. Larger models offer better quality but require more resources.</p>
              <div class="fcc-radio-group">
                <div class="fcc-compact-radio selected" data-value="speecht5">
                  <label>
                    <input type="radio" name="model" value="speecht5" checked>
                    <span class="fcc-radio-title">SpeechT5 - Balanced (170MB)</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="vits">
                  <label>
                    <input type="radio" name="model" value="vits">
                    <span class="fcc-radio-title">VITS - High Quality (350MB)</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="fcc-option-group fcc-animate-element">
              <label class="fcc-option-label">Voice Type</label>
              <p class="fcc-option-desc">Select the voice characteristics.</p>
              <div class="fcc-radio-group">
                <div class="fcc-compact-radio selected" data-value="neutral">
                  <label>
                    <input type="radio" name="voice-type" value="neutral" checked>
                    <span class="fcc-radio-title">Neutral</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="female">
                  <label>
                    <input type="radio" name="voice-type" value="female">
                    <span class="fcc-radio-title">Female</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="male">
                  <label>
                    <input type="radio" name="voice-type" value="male">
                    <span class="fcc-radio-title">Male</span>
                  </label>
                </div>
              </div>
            </div>
          `;
      } else if (config.ttsEngine === "piper") {
        optionsHTML = `
            <div class="fcc-option-group fcc-animate-element">
              <label class="fcc-option-label">Voice Model</label>
              <p class="fcc-option-desc">Choose a Piper voice model. Quality affects file size and processing time.</p>
              <div class="fcc-radio-group">
                <div class="fcc-compact-radio selected" data-value="en_US-lessac-medium">
                  <label>
                    <input type="radio" name="piper-voice" value="en_US-lessac-medium" checked>
                    <span class="fcc-radio-title">US English - Lessac (Medium, 30MB)</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="en_US-lessac-high">
                  <label>
                    <input type="radio" name="piper-voice" value="en_US-lessac-high">
                    <span class="fcc-radio-title">US English - Lessac (High, 60MB)</span>
                  </label>
                </div>
                <div class="fcc-compact-radio" data-value="en_GB-alan-medium">
                  <label>
                    <input type="radio" name="piper-voice" value="en_GB-alan-medium">
                    <span class="fcc-radio-title">British English - Alan (Medium, 30MB)</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="fcc-option-group fcc-animate-element">
              <label class="fcc-option-label">Speaking Speed</label>
              <p class="fcc-option-desc">Adjust the speed of speech generation.</p>
              <div class="fcc-slider-container" id="speed-slider-container">
              </div>
            </div>
          `;
      }

      const contentHTML =
        optionsHTML +
        `
          <div class="fcc-button-group fcc-animate-element">
            <button class="heroui-button heroui-button-secondary" id="back-btn">
              <span class="heroui-button-text">Back</span>
            </button>
            <button class="heroui-button" id="finish-btn">
              <span class="heroui-button-text">Finish</span>
            </button>
          </div>
        `;

      transitionToPage(contentHTML, "Model Configuration");

      // Wait for content to be added, then attach event listeners
      const eventListenerDelay = 1200 + 4 * 200; // Initial delay + 4 elements * 200ms stagger (title + 2 option groups + button group)
      setTimeout(() => {
        // Radio button handlers
        const compactRadios = glassContentInner.querySelectorAll(".fcc-compact-radio");
        compactRadios.forEach((radio) => {
          radio.addEventListener("click", () => {
            const input = radio.querySelector("input[type='radio']");
            input.checked = true;

            // Update visual selection for this radio group
            const radioName = input.name;
            glassContentInner.querySelectorAll(`input[name="${radioName}"]`).forEach((r) => {
              r.closest(".fcc-compact-radio").classList.remove("selected");
            });
            radio.classList.add("selected");
          });
        });

        // Initialize custom sliders based on engine
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
          const rateContainer = glassContentInner.querySelector("#rate-slider-container");
          rateContainer.innerHTML = createCustomSlider(0.5, 2, 0.25, 1, rateLabels, "rate-value");
          const rateTrack = rateContainer.querySelector(".fcc-slider-track");
          const rateValue = rateContainer.querySelector("#rate-value");
          initializeSlider(rateTrack, rateLabels, rateValue);
        } else if (config.ttsEngine === "piper") {
          const speedLabels = {
            0.8: "Slow",
            0.9: "Slightly Slow",
            1: "Normal",
            1.1: "Slightly Fast",
            1.2: "Fast",
          };
          const speedContainer = glassContentInner.querySelector("#speed-slider-container");
          speedContainer.innerHTML = createCustomSlider(
            0.8,
            1.2,
            0.1,
            1,
            speedLabels,
            "speed-value"
          );
          const speedTrack = speedContainer.querySelector(".fcc-slider-track");
          const speedValue = speedContainer.querySelector("#speed-value");
          initializeSlider(speedTrack, speedLabels, speedValue);
        }

        // Back button
        glassContentInner.querySelector("#back-btn").addEventListener("click", () => {
          showInitialConfig(true); // Call with backwards=true
        });

        // Finish button
        glassContentInner.querySelector("#finish-btn").addEventListener("click", () => {
          // TODO: Save configuration and close overlay
          console.log("Configuration saved:", config);
          alert("Configuration will be saved! (Not yet implemented)");
        });
      }, eventListenerDelay);
    }

    // Show welcome screen initially (it's already in the DOM)
    const startButton = glassContentInner.querySelector(".heroui-button");

    startButton.addEventListener("click", () => {
      showInitialConfig();
    });
  }
})();
