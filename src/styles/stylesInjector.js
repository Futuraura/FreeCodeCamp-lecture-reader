// Styles injector for Lectify
// Injects CSS into the page dynamically
// Full CSS extracted from user-script.js

import { cE, h } from "../utils/dom.js";

/**
 * Inject all Lectify styles into the page
 */
export function injectStyles() {
  const style = cE("style");
  style.id = "lectify-styles";
  style.textContent = getLectifyStyles();
  h.appendChild(style);
}

/**
 * Get all Lectify CSS styles - Complete CSS from user-script.js
 * @returns {string} CSS content
 */
function getLectifyStyles() {
  return `
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap");
body:has(.fcc-config-overlay) {
  overflow: hidden !important;
}
@media (min-width: 768px) {
  body:has(.fcc-config-overlay) {
    cursor: auto !important;
  }
  body:has(.fcc-config-overlay) * {
    cursor: auto !important;
  }
}
.fcc-config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  font-family: "Space Grotesk", sans-serif;
  overflow: hidden;
  opacity: 0;
  transition: opacity 1s;
}
.fcc-config-overlay.fcc-visible {
  opacity: 1;
}
.fcc-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.fcc-loading-page .fcc-content-wrapper,
.fcc-config-overlay .fcc-content-wrapper,
.fcc-presentation .fcc-content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.fcc-loading-page .fcc-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}
.fcc-cursor {
  display: none;
  pointer-events: none;
}
.fcc-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(40deg, #6c00a2, #001152);
  z-index: 0;
  pointer-events: none;
}
.fcc-gradient-bg svg {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
.fcc-gradients-container {
  filter: url(#fcc-goo);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
.fcc-gradient-bg .g1,
.fcc-gradient-bg .g2,
.fcc-gradient-bg .g3,
.fcc-gradient-bg .g4,
.fcc-gradient-bg .g5 {
  position: absolute;
  width: 80%;
  height: 80%;
  top: calc(50% - 40%);
  left: calc(50% - 40%);
  mix-blend-mode: hard-light;
}
.fcc-gradient-bg .g1 {
  background: radial-gradient(circle, #1271ff 0, rgba(18, 113, 255, 0) 50%) no-repeat;
  animation: mV 30s ease infinite;
}
.fcc-gradient-bg .g2 {
  background: radial-gradient(circle, #dd4aff 0, rgba(221, 74, 255, 0) 50%) no-repeat;
  transform-origin: calc(50% - 400px);
  animation: mC 20s reverse infinite;
}
.fcc-gradient-bg .g3 {
  background: radial-gradient(circle, #64dcff 0, rgba(100, 220, 255, 0) 50%) no-repeat;
  top: calc(50% - 40% + 200px);
  left: calc(50% - 40% - 500px);
  transform-origin: calc(50% + 400px);
  animation: mC 40s linear infinite;
}
.fcc-gradient-bg .g4 {
  background: radial-gradient(circle, #c83232 0, rgba(200, 50, 50, 0) 50%) no-repeat;
  transform-origin: calc(50% - 200px);
  animation: mH 40s ease infinite;
  opacity: 0.7;
}
.fcc-gradient-bg .g5 {
  width: 160%;
  height: 160%;
  top: calc(50% - 80%);
  left: calc(50% - 80%);
  background: radial-gradient(circle, #d6d62b 0, rgba(180, 180, 50, 0) 50%) no-repeat;
  transform-origin: calc(50% - 800px) calc(50% + 200px);
  animation: mC 20s ease infinite;
}
@keyframes mC {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes mV {
  0% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(50%);
  }
  100% {
    transform: translateY(-50%);
  }
}
@keyframes mH {
  0% {
    transform: translateX(-50%) translateY(-10%);
  }
  50% {
    transform: translateX(50%) translateY(10%);
  }
  100% {
    transform: translateX(-50%) translateY(-10%);
  }
}
.fcc-glass-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0.75rem;
  padding: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  max-height: 80vh;
  max-width: 90vw;
  width: 0;
  height: 0;
}
.fcc-glass-container.fcc-sized {
  width: auto;
  height: auto;
}
.fcc-glass-content-wrapper {
  width: 100%;
  max-height: 80vh;
}
.fcc-glass-content-inner {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.simplebar-scrollbar::before {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  transition: background 0.2s;
}
.simplebar-scrollbar.simplebar-visible::before {
  opacity: 1;
}
.simplebar-scrollbar:hover::before {
  background: rgba(255, 255, 255, 0.35);
}
.simplebar-track {
  background: transparent;
  right: 6px;
  width: 6px;
  border-radius: 3px;
}
.simplebar-track.simplebar-vertical {
  top: 12px;
  bottom: 12px;
}
.simplebar-content-wrapper {
  transition: all 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}
.fcc-welcome-text {
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  white-space: nowrap;
  position: relative;
  opacity: 0;
  transition: opacity 0.8s;
}
.fcc-welcome-text.fcc-visible {
  opacity: 1;
}
.fcc-config-title {
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  white-space: nowrap;
  position: relative;
}
.fcc-animate-element {
  transition: transform 1s cubic-bezier(0.65, 0, 0.35, 1), opacity 1s cubic-bezier(0.65, 0, 0.35, 1);
}
.fcc-slide-out-right {
  transform: translateX(calc(100% + 3rem + 50vw));
  opacity: 0;
}
.fcc-slide-out-left {
  transform: translateX(calc(-100% - 3rem - 50vw));
  opacity: 0;
}
.heroui-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
  background: #0072f5;
  color: #fff;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 1s cubic-bezier(0.65, 0, 0.35, 1),
    opacity 0.8s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.heroui-button.fcc-initial {
  opacity: 0;
}
.heroui-button.fcc-visible {
  opacity: 1;
}
.heroui-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 0;
}
.heroui-button:hover {
  background: #0062d1;
  box-shadow: 0 4px 12px 0 rgba(0, 114, 245, 0.4);
}
.heroui-button:active {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.heroui-button-text {
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  font-family: "Space Grotesk", sans-serif;
}
.fcc-config-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
}
.fcc-option-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
}
.fcc-option-label {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.fcc-option-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}
.fcc-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #fff;
  font-family: "Space Grotesk", sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.fcc-select:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}
.fcc-select:focus {
  outline: none;
  border-color: #0072f5;
  box-shadow: 0 0 0 3px rgba(0, 114, 245, 0.2);
}
.fcc-select option {
  background: #1a1a2e;
  color: #fff;
}
.fcc-slider-container {
  margin-top: 1rem;
  padding: 0 0.5rem;
}
.fcc-slider-track {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}
.fcc-slider-track:hover {
  background: rgba(255, 255, 255, 0.15);
}
.fcc-slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #0072f5;
  border-radius: 4px;
  pointer-events: none;
  transition: width 0.1s;
}
.fcc-slider-thumb {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0072f5;
  cursor: grab;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
}
.fcc-slider-thumb:hover {
  background: #0062d1;
  transform: translate(-50%, -50%) scale(1.1);
}
.fcc-slider-thumb:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.15);
}
.fcc-slider-value {
  color: #fff;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
  margin-top: 0.75rem;
  min-height: 1.5rem;
}
.fcc-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.fcc-button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}
.heroui-button-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.heroui-button-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}
.heroui-button-outline {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  opacity: 0.5;
}
.heroui-button-outline:hover {
  background: transparent;
  box-shadow: none;
  transform: none;
}
.fcc-hidden {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
}
.fcc-radio-option {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
  width: 100%;
}
.fcc-radio-option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.fcc-radio-option.selected {
  background: rgba(0, 114, 245, 0.15);
  border-color: #0072f5;
}
.fcc-radio-option input[type="radio"] {
  margin-right: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}
.fcc-radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.fcc-radio-title {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.fcc-radio-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin: 0.5rem 0 0 2.25rem;
  line-height: 1.5;
}
.fcc-compact-radio {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}
.fcc-compact-radio:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.fcc-compact-radio.selected {
  background: rgba(0, 114, 245, 0.15);
  border-color: #0072f5;
}
.fcc-compact-radio input[type="radio"] {
  margin-right: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}
.fcc-compact-radio label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}
.fcc-compact-radio .fcc-radio-title {
  font-size: 1.125rem;
}
.fcc-subtitle-preview {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 20px);
  max-width: 800px;
  pointer-events: none;
  z-index: 10010;
}
.fcc-subtitle-container {
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  cursor: move;
  pointer-events: auto;
}
.fcc-subtitle-text {
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.6;
  text-align: center;
  margin: 0;
  position: relative;
}
.fcc-color-picker-group {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  margin-top: 0.75rem;
}
.fcc-color-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.fcc-color-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
}
.fcc-color-input-row {
  position: relative;
  display: flex;
}
.fcc-color-input {
  flex: 1;
  padding: 0.5rem 3rem 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #fff;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.fcc-color-input:focus {
  outline: none;
  border-color: #0072f5;
  box-shadow: 0 0 0 2px rgba(0, 114, 245, 0.2);
}
.fcc-color-preview {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  transition: all 0.2s;
  cursor: pointer;
  transform: translateY(-50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}
.fcc-color-preview:hover {
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
}
.fcc-size-preset {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}
.fcc-size-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #fff;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.fcc-size-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}
.fcc-size-btn.active {
  background: rgba(0, 114, 245, 0.2);
  border-color: #0072f5;
}
.clr-picker {
  z-index: 10005 !important;
}
.clr-field {
  display: contents !important;
}
.clr-field button {
  display: none !important;
}
.fcc-loading-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10003;
  opacity: 0;
  transition: opacity 0.5s;
}
.fcc-loading-page.fcc-visible {
  opacity: 1;
}
.fcc-compact-player {
  position: fixed;
  bottom: 10px;
  left: 10px;
  width: auto;
  height: auto;
  z-index: 10003;
  transition: all 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}
.fcc-presentation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10004;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s;
}
.fcc-presentation.fcc-visible {
  opacity: 1;
  pointer-events: all;
}
.fcc-code-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90%;
  max-height: 80%;
  overflow: auto;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 0.5rem;
  padding: 2rem;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
}
.fcc-code-display.fcc-visible {
  opacity: 1;
}

/* Lectify Player Styles */
.lectify-player-container {
  position: fixed;
  z-index: 10000;
  font-family: "Space Grotesk", sans-serif;
}

/* Play Button (Collapsed State) */
.lectify-play-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10001;
  opacity: 1;
}

.lectify-play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
}

.lectify-play-button:active {
  transform: scale(0.95);
}

.lectify-play-icon {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.lectify-play-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.6;
  z-index: 1;
}

/* Expanded Player */
.lectify-player-expanded {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10001;
  display: none;
  align-items: center;
  justify-content: center;
  opacity: 0;
  background: rgba(0, 0, 0, 0.5); /* Darker background behind player */
}

.lectify-player-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 92%; /* 100% - 4% margins on each side */
  height: 92%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  border-radius: 1.5rem;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.lectify-player-content {
  position: relative;
  width: 92%; /* Same as background width */
  height: 92%; /* Same as background height */
  padding: 1.5rem; /* More padding (24px) */
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 16px gap */
  z-index: 1;
}

/* Responsive margins for different screen sizes */
@media (max-width: 1600px) {
  .lectify-player-background,
  .lectify-player-content {
    width: 94%;
    height: 94%;
  }
}

@media (max-width: 1200px) {
  .lectify-player-background,
  .lectify-player-content {
    width: 96%;
    height: 96%;
  }
  .lectify-player-content {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .lectify-player-background,
  .lectify-player-content {
    width: calc(100% - 2rem);
    height: calc(100% - 2rem);
  }
  .lectify-player-content {
    padding: 0.75rem;
    gap: 0.75rem;
  }
}

/* Player Header */
.lectify-player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.lectify-player-title {
  color: white;
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.lectify-close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
  flex-shrink: 0;
}

.lectify-close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Main Content Area - Side by Side Layout */
.lectify-main-area {
  flex: 1;
  display: flex;
  gap: 1rem;
  overflow: hidden;
  min-height: 0; /* Critical for flex child scrolling */
}

/* Code Panel (Left Side) */
.lectify-code-panel {
  flex: 0 0 45%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  overflow: hidden;
  min-height: 0; /* Critical for flex child scrolling */
}

.lectify-code-display {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  scroll-behavior: smooth;
  min-height: 0; /* Critical for flex child scrolling */
  height: 100%; /* Ensure it takes full height */
}

.lectify-code-block-wrapper {
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease;
}

.lectify-code-display pre {
  margin: 0;
  width: 100%;
  height: auto;
  background: rgba(0, 0, 0, 0.4) !important;
  border-radius: 0.5rem;
  padding: 1rem !important;
  overflow-x: auto;
  opacity: 0.5;
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
}

.lectify-code-display pre.lectify-code-active {
  opacity: 1;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.5);
}

.lectify-code-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  width: 100%;
}

.lectify-code-placeholder svg {
  opacity: 0.5;
}

.lectify-code-placeholder p {
  font-size: 1rem;
  margin: 0;
}

/* Subtitle Panel (Right Side or Full Width) */
.lectify-subtitle-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  overflow: hidden;
}

.lectify-subtitle-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem 1.5rem;
  scroll-behavior: smooth;
}

.lectify-subtitle-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100%;
}

.lectify-subtitle-line {
  color: white;
  font-size: 1.25rem;
  line-height: 1.8;
  opacity: 0.5;
  transition: opacity 0.4s ease, transform 0.3s ease;
  padding: 0.5rem 0;
}

.lectify-subtitle-line.active {
  opacity: 1;
  transform: scale(1.02);
  font-weight: 500;
}

/* Scrollbar styling for both panels */
.lectify-code-display::-webkit-scrollbar,
.lectify-subtitle-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.lectify-code-display::-webkit-scrollbar-track,
.lectify-subtitle-scroll-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.lectify-code-display::-webkit-scrollbar-thumb,
.lectify-subtitle-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.lectify-code-display::-webkit-scrollbar-thumb:hover,
.lectify-subtitle-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive: Stack vertically on small screens */
@media (max-width: 768px) {
  .lectify-main-area {
    flex-direction: column;
  }
  
  .lectify-code-panel {
    flex: 0 0 40%;
  }
  
  .lectify-subtitle-line {
    font-size: 1.125rem;
  }
}

/* Player Controls */
.lectify-player-controls {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem; /* Slightly smaller border radius */
  padding: 0.75rem; /* 12px */
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 12px */
  flex-shrink: 0;
}

.lectify-control-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px; /* Smaller from 48px */
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
  flex-shrink: 0;
}

.lectify-control-button svg {
  width: 20px; /* Smaller icons */
  height: 20px;
}

.lectify-control-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.lectify-control-button:active {
  transform: scale(0.95);
}

.lectify-progress-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.lectify-progress-bar {
  width: 100%;
  height: 5px; /* Slightly thinner */
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2.5px;
  overflow: hidden;
  cursor: pointer;
}

.lectify-progress-fill {
  height: 100%;
  background: white;
  border-radius: 2.5px;
  width: 0%;
  transition: width 0.1s linear;
}

.lectify-time-display {
  color: white;
  font-size: 0.8125rem; /* Slightly smaller text */
  font-weight: 500;
  min-width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.lectify-current-time {
  margin-right: 0.5rem;
}

.lectify-total-time {
  margin-left: 0.5rem;
}


`;
}
