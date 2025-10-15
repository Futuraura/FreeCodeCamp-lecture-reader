// ==UserScript==
// @name         FreeCodeCamp lecture reader
// @namespace    http://tampermonkey.net/
// @version      2025-10-12.01
// @description  Adds a configurable lecture reader to replace the videos.
// @author       Mark Pikaro (Futuraura)
// @match        https://www.freecodecamp.org/learn/*/lecture-*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function () {
  const savedCfg = localStorage.getItem("freecodecampLectureReader");
  const d = document,
    h = d.head,
    b = d.body,
    cE = (t) => d.createElement(t),
    qS = (e, s) => (s ? e.querySelector(s) : d.querySelector(e)),
    qSA = (e, s) => (s ? e.querySelectorAll(s) : d.querySelectorAll(e));
  const L = (s, u) => {
      const e = cE(s == "l" ? "link" : "script");
      s == "l" ? ((e.rel = "stylesheet"), (e.href = u)) : (e.src = u);
      h.appendChild(e);
      return e;
    },
    gS = L("s", "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
    sC = L("l", "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.css"),
    sJ = L("s", "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js"),
    cL = L("l", "https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.css"),
    cJ = L("s", "https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.js");

  const s = cE("style");
  s.textContent = `
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
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
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
.fcc-subtitle-text span {
  display: inline-block;
  position: relative;
  z-index: 1;
}
.fcc-subtitle-text span.highlighted {
  font-weight: 700;
}
.fcc-subtitle-highlight-bg {
  position: absolute;
  border-radius: 0.3rem;
  pointer-events: none;
  z-index: 0;
  will-change: transform, width, height;
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
.fcc-loading-page .fcc-gradient-bg {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(40deg, #6c00a2, #001152);
}
.fcc-loading-page .fcc-glass-container {
  height: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  width: 600px;
  max-width: 90vw;
}
.fcc-loading-content {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  z-index: 10010;
}
.fcc-progress-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}
.fcc-progress-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  height: 12px;
  overflow: hidden;
  position: relative;
}
.fcc-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0072f5, #00a8ff);
  border-radius: 0.5rem;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}
.fcc-progress-bar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.fcc-progress-text {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
}
.fcc-loading-status {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  font-style: italic;
  margin: 0;
  flex: 1;
  text-align: right;
}
.fcc-loading-page.fcc-compact .fcc-gradient-bg {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 350px;
  height: 200px;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}
.fcc-loading-page.fcc-compact .fcc-glass-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: none;
  max-width: none;
  max-height: none;
  border-radius: 0.75rem;
}
.fcc-loading-page.fcc-ready .fcc-glass-container {
  padding: 0;
}
.fcc-loading-page.fcc-ready .fcc-loading-content {
  padding: 0;
  height: 100%;
  justify-content: center;
}
.fcc-play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0072f5, #00a8ff);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(0, 114, 245, 0.4);
}
.fcc-play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(0, 114, 245, 0.6);
}
.fcc-play-button::after {
  content: "";
  width: 0;
  height: 0;
  border-left: 24px solid white;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  margin-left: 6px;
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
.fcc-presentation-bg {
  position: absolute;
  top: 128px;
  left: 128px;
  right: 128px;
  bottom: 128px;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(40deg, #6c00a2, #001152);
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
.fcc-code-display pre {
  margin: 0;
  color: #fff;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 1.6;
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
.fcc-compact-player .fcc-gradient-bg {
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  padding: 16px;
  min-width: 180px;
  min-height: 60px;
  box-sizing: border-box;
  pointer-events: auto;
}
.fcc-compact-player .fcc-gradients-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.fcc-compact-player .fcc-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.fcc-next-btn {
  position: relative;
  transform: none;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #fff;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  pointer-events: all;
}
.fcc-next-btn-text {
  order: 1;
}
.fcc-next-btn svg {
  order: 2;
  width: 16px;
  height: 16px;
}
.fcc-next-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}
.fcc-compact-player .fcc-content-wrapper .fcc-next-btn {
  pointer-events: auto;
}
.fcc-compact-player.fcc-fullscreen {
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
}
.fcc-compact-player.fcc-fullscreen .fcc-gradient-bg {
  width: 100%;
  height: 100%;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: 0;
}
.fcc-compact-player.fcc-fullscreen .fcc-content-wrapper {
  align-items: stretch;
  justify-content: stretch;
}
.fcc-compact-player.fcc-fullscreen .fcc-next-btn {
  display: none;
}
.fcc-compact-player.fcc-fullscreen .fcc-gradients-container {
  position: relative;
  width: calc(100vw - 64px);
  height: calc(100vh - 64px);
  border-radius: 1rem;
  background: linear-gradient(40deg, #6c00a2, #001152);
}
  `;
  h.appendChild(s);

  const ensureGooFilter = (() => {
    let injected = !1;
    return () => {
      if (injected) return;
      const svg = cE("svg");
      svg.setAttribute("aria-hidden", "true");
      svg.style.position = "absolute";
      svg.style.width = "0";
      svg.style.height = "0";
      svg.innerHTML = `
  <defs>
    <filter id="fcc-goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
      <feBlend in="SourceGraphic" in2="goo" />
    </filter>
  </defs>`;
      b.appendChild(svg);
      injected = !0;
    };
  })();

  ensureGooFilter();

  const o = cE("div");
  o.className = "fcc-config-overlay";
  o.innerHTML = `
<div class="fcc-gradient-bg">
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
  b.appendChild(o);
  const gC = qS(o, ".fcc-glass-container"),
    gI = qS(o, ".fcc-glass-content-inner");
  requestAnimationFrame(() => o.classList.add("fcc-visible"));
  let sB = null;
  sJ.onload = () => {
    const w = qS(o, "[data-simplebar]");
    w && window.SimpleBar && (sB = new SimpleBar(w, { autoHide: !1, forceVisible: !0 }));
  };
  setTimeout(() => {
    const wT = qS(gI, ".fcc-welcome-text"),
      stB = qS(gI, ".heroui-button");
    if (wT && stB) {
      const tR = wT.getBoundingClientRect(),
        bR = stB.getBoundingClientRect(),
        p = 96,
        g = 32,
        w = Math.max(tR.width, bR.width) + p,
        he = tR.height + bR.height + g + p;
      gC.style.width = w + "px";
      gC.style.height = he + "px";
      gC.classList.add("fcc-sized");
      sB && sB.recalculate();
      setTimeout(() => {
        wT.classList.add("fcc-visible");
        stB.classList.add("fcc-visible");
      }, 1e3);
    }
  }, 1e3);
  gS.onload = () => {};
  const aHL = () => {},
    cfg = {
      ttsEngine: null,
      subtitle: {
        bgColor: "rgba(0, 0, 0, 0.85)",
        textColor: "#ffffff",
        highlightStyle: "text",
        highlightTextColor: "#ffd700",
        highlightBgColor: "#ffd700",
        bgOpacity: 85,
        fontSize: 24,
      },
    },
    tLock = { locked: !1 },
    sLib = {
      el: null,
      words: [],
      cIdx: -1,
      aId: null,
      hBg: null,
      init(txt) {
        if (!this.el) {
          const pv = cE("div");
          pv.className = "fcc-subtitle-preview";
          pv.innerHTML = `<div class="fcc-subtitle-container"><p class="fcc-subtitle-text"></p></div>`;
          b.appendChild(pv);
          this.el = qS(pv, ".fcc-subtitle-text");
          this.ctn = qS(pv, ".fcc-subtitle-container");
          this.mD(this.ctn);
          if (cfg.subtitle.highlightStyle === "background") {
            this.hBg = cE("div");
            this.hBg.className = "fcc-subtitle-highlight-bg";
            this.el.insertBefore(this.hBg, this.el.firstChild);
          }
        }
        this.words = txt.split(" ");
        this.el.innerHTML = this.words.map((w) => `<span>${w}</span>`).join(" ");
        if (this.hBg && cfg.subtitle.highlightStyle === "background") {
          this.el.insertBefore(this.hBg, this.el.firstChild);
        }
        this.cIdx = -1;
      },
      mD(e) {
        let x = 0,
          y = 0,
          iD = !1;
        const mS = (ev) => {
          iD = !0;
          const cX = ev.touches && ev.touches.length ? ev.touches[0].clientX : ev.clientX;
          const cY = ev.touches && ev.touches.length ? ev.touches[0].clientY : ev.clientY;
          x = cX - e.offsetLeft;
          y = cY - e.offsetTop;
          ev.preventDefault();
        };
        const mM = (ev) => {
          if (!iD) return;
          const cX = ev.touches && ev.touches.length ? ev.touches[0].clientX : ev.clientX;
          const cY = ev.touches && ev.touches.length ? ev.touches[0].clientY : ev.clientY;
          e.style.left = cX - x + "px";
          e.style.top = cY - y + "px";
          e.style.transform = "none";
          e.parentElement.style.transform = "none";
          ev.preventDefault();
        };
        const mE = () => (iD = !1);
        e.addEventListener("mousedown", mS);
        e.addEventListener("touchstart", mS);
        d.addEventListener("mousemove", mM);
        d.addEventListener("touchmove", mM);
        d.addEventListener("mouseup", mE);
        d.addEventListener("touchend", mE);
      },
      aW() {
        if (!this.el || this.words.length === 0) return;
        const spans = qSA(this.el, "span");
        if (this.cIdx >= 0 && this.cIdx < spans.length) {
          spans[this.cIdx].classList.remove("highlighted");
          spans[this.cIdx].style.color = "";
        }
        this.cIdx = (this.cIdx + 1) % this.words.length;
        const currentSpan = spans[this.cIdx];
        currentSpan.classList.add("highlighted");

        if (cfg.subtitle.highlightStyle === "background" && this.hBg) {
          const rect = currentSpan.getBoundingClientRect();
          const parentRect = this.el.getBoundingClientRect();
          const padding = 2;
          currentSpan.style.color = cfg.subtitle.highlightTextColor;
          gsap.to(this.hBg, {
            left: rect.left - parentRect.left - padding,
            top: rect.top - parentRect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            duration: 0.3,
            ease: "power2.out",
          });
        } else if (cfg.subtitle.highlightStyle === "text") {
          currentSpan.style.color = cfg.subtitle.highlightTextColor;
        }
      },
      sA(int = 600) {
        this.stA();
        this.aW();
        this.aId = setInterval(() => this.aW(), int);
      },
      stA() {
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
      },
      uS() {
        if (!this.ctn) return;
        const {
          bgColor,
          textColor,
          highlightStyle,
          highlightTextColor,
          highlightBgColor,
          fontSize,
        } = cfg.subtitle;
        this.ctn.style.background = bgColor;
        this.el.style.color = textColor;
        this.el.style.fontSize = fontSize + "px";

        if (highlightStyle === "background" && !this.hBg) {
          this.hBg = cE("div");
          this.hBg.className = "fcc-subtitle-highlight-bg";
          this.el.insertBefore(this.hBg, this.el.firstChild);
        } else if (highlightStyle === "text" && this.hBg) {
          this.hBg.remove();
          this.hBg = null;
        }

        if (this.hBg) {
          this.hBg.style.background = highlightBgColor;
          this.hBg.style.opacity = "1";
        }

        const spans = qSA(this.el, "span");
        spans.forEach((s, i) => {
          if (s.classList.contains("highlighted")) {
            if (highlightStyle === "background" && this.hBg) {
              s.style.color = highlightTextColor;
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
      },
      dest() {
        this.stA();
        if (this.el && this.el.parentElement && this.el.parentElement.parentElement) {
          this.el.parentElement.parentElement.remove();
        }
        this.el = null;
        this.ctn = null;
        this.hBg = null;
        this.words = [];
        this.cIdx = -1;
      },
    },
    cCS = (mi, ma, st, dV, lb, vI) => {
      const p = ((dV - mi) / (ma - mi)) * 100;
      return `
<div
  class="fcc-slider-track"
  data-min="${mi}"
  data-max="${ma}"
  data-step="${st}"
  data-value="${dV}"
>
  <div class="fcc-slider-fill" style="width:${p}%"></div>
  <div class="fcc-slider-thumb" style="left:${p}%"></div>
</div>
<div class="fcc-slider-value" id="${vI}">${lb[dV] || dV}</div>
`;
    },
    iS = (t, lb, vE) => {
      const th = qS(t, ".fcc-slider-thumb"),
        fi = qS(t, ".fcc-slider-fill"),
        mi = parseFloat(t.dataset.min),
        ma = parseFloat(t.dataset.max),
        st = parseFloat(t.dataset.step),
        fmt = (v) => (lb && lb[v] !== void 0 ? lb[v] : v);
      let iD = !1;
      t.dataset.dragging = "false";
      const emit = (v) =>
          t.dispatchEvent(new CustomEvent("fcc-slider-change", { detail: { value: v } })),
        uS = (cX) => {
          const r = t.getBoundingClientRect();
          let p = ((cX - r.left) / r.width) * 100;
          p = Math.max(0, Math.min(100, p));
          let v = mi + (p / 100) * (ma - mi);
          v = Math.round(v / st) * st;
          v = Math.max(mi, Math.min(ma, v));
          p = ((v - mi) / (ma - mi)) * 100;
          th.style.left = p + "%";
          fi.style.width = p + "%";
          t.dataset.value = v;
          vE && (vE.textContent = fmt(v));
          emit(v);
          return v;
        },
        sD = (e) => {
          iD = !0;
          t.dataset.dragging = "true";
          const cX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
          uS(cX);
          e.preventDefault();
        },
        dr = (e) => {
          if (!iD) return;
          const cX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
          uS(cX);
          e.preventDefault();
        },
        stD = () => {
          if (!iD) return;
          iD = !1;
          t.dataset.dragging = "false";
        };
      th.addEventListener("mousedown", sD);
      t.addEventListener("mousedown", sD);
      d.addEventListener("mousemove", dr);
      d.addEventListener("mouseup", stD);
      th.addEventListener("touchstart", sD);
      t.addEventListener("touchstart", sD);
      d.addEventListener("touchmove", dr);
      d.addEventListener("touchend", stD);
    },
    iFSC = (sliderContainerId, presetsSelector) => {
      const fL = {};
      for (let sz = 16; sz <= 40; sz += 2) fL[sz] = `${sz}px`;
      const fC = qS(gI, sliderContainerId);
      fC.innerHTML = cCS(16, 40, 2, cfg.subtitle.fontSize, fL, "font-size-value");
      const fV = qS(fC, "#font-size-value"),
        fT = qS(fC, ".fcc-slider-track"),
        sBtns = qSA(gI, presetsSelector);
      iS(fT, fL, fV);

      const setFontSizeState = (v) => {
        cfg.subtitle.fontSize = v;
        fV && (fV.textContent = fL[v] || `${v}px`);
        sLib.uS();
        sBtns.forEach((b) => {
          b.classList.toggle("active", parseFloat(b.dataset.size) === v);
        });
      };

      fT.addEventListener("fcc-slider-change", (ev) => {
        const v = parseFloat(ev.detail.value);
        setFontSizeState(v);
      });

      const programmaticFontSize = (v) => {
        const mi = parseFloat(fT.dataset.min);
        const ma = parseFloat(fT.dataset.max);
        const p = ((v - mi) / (ma - mi)) * 100;
        qS(fT, ".fcc-slider-thumb").style.left = p + "%";
        qS(fT, ".fcc-slider-fill").style.width = p + "%";
        fT.dataset.value = v;
        fT.dispatchEvent(new CustomEvent("fcc-slider-change", { detail: { value: v } }));
      };

      const currentSize = parseFloat(fT.dataset.value || cfg.subtitle.fontSize);
      setFontSizeState(currentSize);

      sBtns.forEach((b) => {
        const bSize = parseFloat(b.dataset.size);
        b.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          programmaticFontSize(bSize);
        });
      });
    },
    tTP = (nH, nT = null, bw = !1) => {
      if (tLock.locked) return;
      tLock.locked = !0;
      const cE2 = Array.from(gI.children);
      cE2.forEach((e, i) => {
        e.classList.add("fcc-animate-element");
        setTimeout(
          () => e.classList.add(bw ? "fcc-slide-out-left" : "fcc-slide-out-right"),
          i * 100
        );
      });
      const sOD = cE2.length * 100 + 1e3;
      setTimeout(() => {
        gI.innerHTML = "";
        const nE = [];
        if (nT) {
          const nTi = cE("h1");
          nTi.className = "fcc-config-title fcc-animate-element";
          nTi.classList.add(bw ? "fcc-slide-out-right" : "fcc-slide-out-left");
          nTi.textContent = nT;
          nE.push(nTi);
          gI.appendChild(nTi);
        }
        const tC = cE("div");
        tC.innerHTML = nH;
        Array.from(tC.children).forEach((ch) => {
          ch.classList.add(bw ? "fcc-slide-out-right" : "fcc-slide-out-left");
          nE.push(ch);
          gI.appendChild(ch);
        });
        requestAnimationFrame(() => {
          let tH = 0,
            mW = 0;
          nE.forEach((e) => {
            const r = e.getBoundingClientRect();
            tH += r.height;
            mW = Math.max(mW, r.width);
          });
          const p = 96,
            g = (nE.length - 1) * 32,
            nW = Math.max(696, mW + p),
            nH2 = Math.min(innerHeight * 0.8, tH + g + p);
          gC.style.width = nW + "px";
          gC.style.height = nH2 + "px";
          sB && (sB.recalculate(), (sB.getScrollElement().scrollTop = 0));
          aHL();
          setTimeout(
            () =>
              nE.forEach((e, i) =>
                setTimeout(
                  () => e.classList.remove("fcc-slide-out-left", "fcc-slide-out-right"),
                  i * 100
                )
              ),
            100
          );
        });
        setTimeout(() => (tLock.locked = !1), sOD + 500);
      }, sOD);
    },
    sIC = (bw = !1) => {
      const cH = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Choose TTS Engine</label>
  <div class="fcc-radio-option" data-value="webspeech">
    <label class="fcc-radio-label"
      ><input type="radio" name="tts-engine" value="webspeech" ${
        cfg.ttsEngine === "webspeech" ? "checked" : ""
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
        cfg.ttsEngine === "transformers" ? "checked" : ""
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
        cfg.ttsEngine === "piper" ? "checked" : ""
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
  <button class="heroui-button ${cfg.ttsEngine ? "" : "heroui-button-outline"}" id="next-btn" ${
        cfg.ttsEngine ? "" : "disabled"
      }>
    <span class="heroui-button-text">Next</span>
  </button>
</div>
`;
      tTP(cH, "Initial Configuration", bw);
      const eLD = 1200 + 3 * 100;
      setTimeout(() => {
        const rO = qSA(gI, ".fcc-radio-option"),
          rI = qSA(gI, 'input[name="tts-engine"]'),
          nB = qS(gI, "#next-btn");

        if (cfg.ttsEngine) {
          const selectedOp = qS(gI, `.fcc-radio-option[data-value="${cfg.ttsEngine}"]`);
          selectedOp && selectedOp.classList.add("selected");
        }

        rO.forEach((op, i) => {
          op.addEventListener("click", () => {
            rI[i].checked = !0;
            cfg.ttsEngine = rI[i].value;
            rO.forEach((o) => o.classList.remove("selected"));
            op.classList.add("selected");
            nB.disabled = !1;
            nB.classList.remove("heroui-button-outline");
          });
        });
        rI.forEach((r) => {
          r.addEventListener("change", () => {
            cfg.ttsEngine = r.value;
            rO.forEach((o) => o.classList.remove("selected"));
            const sO = qS(gI, `.fcc-radio-option[data-value="${r.value}"]`);
            sO && sO.classList.add("selected");
            nB.disabled = !1;
            nB.classList.remove("heroui-button-outline");
          });
        });
        nB.addEventListener("click", () => !nB.disabled && !tLock.locked && sMC());
      }, eLD);
    },
    sMC = () => {
      let oH = "";
      if (cfg.ttsEngine === "webspeech") {
        oH = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Voice</label>
  <p class="fcc-option-desc">Select a voice from your system\'s available voices.</p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="default">
      <label
        ><input type="radio" name="voice" value="default" checked /><span class="fcc-radio-title"
          >Default Voice</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="female">
      <label
        ><input type="radio" name="voice" value="female" /><span class="fcc-radio-title"
          >Female Voice</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="male">
      <label
        ><input type="radio" name="voice" value="male" /><span class="fcc-radio-title"
          >Male Voice</span
        ></label
      >
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Speech Rate</label>
  <p class="fcc-option-desc">Adjust how fast the text is read.</p>
  <div class="fcc-slider-container" id="rate-slider-container"></div>
</div>
`;
      } else if (cfg.ttsEngine === "transformers") {
        oH = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Model</label>
  <p class="fcc-option-desc">
    Choose the AI model to use. Larger models offer better quality but require more resources.
  </p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="speecht5">
      <label
        ><input type="radio" name="model" value="speecht5" checked /><span class="fcc-radio-title"
          >SpeechT5 - Balanced (170MB)</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="vits">
      <label
        ><input type="radio" name="model" value="vits" /><span class="fcc-radio-title"
          >VITS - High Quality (350MB)</span
        ></label
      >
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Voice Type</label>
  <p class="fcc-option-desc">Select the voice characteristics.</p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="neutral">
      <label
        ><input type="radio" name="voice-type" value="neutral" checked /><span
          class="fcc-radio-title"
          >Neutral</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="female">
      <label
        ><input type="radio" name="voice-type" value="female" /><span class="fcc-radio-title"
          >Female</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="male">
      <label
        ><input type="radio" name="voice-type" value="male" /><span class="fcc-radio-title"
          >Male</span
        ></label
      >
    </div>
  </div>
</div>
`;
      } else if (cfg.ttsEngine === "piper") {
        oH = `<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Voice Model</label>
  <p class="fcc-option-desc">
    Choose a Piper voice model. Quality affects file size and processing time.
  </p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="en_US-lessac-medium">
      <label
        ><input type="radio" name="piper-voice" value="en_US-lessac-medium" checked /><span
          class="fcc-radio-title"
          >US English - Lessac (Medium, 30MB)</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="en_US-lessac-high">
      <label
        ><input type="radio" name="piper-voice" value="en_US-lessac-high" /><span
          class="fcc-radio-title"
          >US English - Lessac (High, 60MB)</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="en_GB-alan-medium">
      <label
        ><input type="radio" name="piper-voice" value="en_GB-alan-medium" /><span
          class="fcc-radio-title"
          >British English - Alan (Medium, 30MB)</span
        ></label
      >
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Speaking Speed</label>
  <p class="fcc-option-desc">Adjust the speed of speech generation.</p>
  <div class="fcc-slider-container" id="speed-slider-container"></div>
</div>
`;
      }
      const cH =
        oH +
        `<div class="fcc-button-group fcc-animate-element">
  <button class="heroui-button heroui-button-secondary" id="back-btn">
    <span class="heroui-button-text">Back</span></button
  ><button class="heroui-button" id="next-btn"><span class="heroui-button-text">Next</span></button>
</div>
`;
      tTP(cH, "Model Configuration");
      const eLD = 1200 + 4 * 200;
      setTimeout(() => {
        qSA(gI, ".fcc-compact-radio").forEach((r) => {
          r.addEventListener("click", () => {
            const i = qS(r, 'input[type="radio"]');
            i.checked = !0;
            const rN = i.name;
            qSA(gI, `input[name="${rN}"]`).forEach((r2) =>
              r2.closest(".fcc-compact-radio").classList.remove("selected")
            );
            r.classList.add("selected");
          });
        });
        if (cfg.ttsEngine === "webspeech") {
          const rL = {
              0.5: "0.5x - Slow",
              0.75: "0.75x - Slightly Slow",
              1: "1x - Normal",
              1.25: "1.25x - Slightly Fast",
              1.5: "1.5x - Fast",
              1.75: "1.75x - Very Fast",
              2: "2x - Very Fast",
            },
            rC = qS(gI, "#rate-slider-container");
          rC.innerHTML = cCS(0.5, 2, 0.25, 1, rL, "rate-value");
          iS(qS(rC, ".fcc-slider-track"), rL, qS(rC, "#rate-value"));
        } else if (cfg.ttsEngine === "piper") {
          const sL = {
              0.8: "Slow",
              0.9: "Slightly Slow",
              1: "Normal",
              1.1: "Slightly Fast",
              1.2: "Fast",
            },
            sC = qS(gI, "#speed-slider-container");
          sC.innerHTML = cCS(0.8, 1.2, 0.1, 1, sL, "speed-value");
          iS(qS(sC, ".fcc-slider-track"), sL, qS(sC, "#speed-value"));
        }
        qS(gI, "#back-btn").addEventListener("click", () => !tLock.locked && sIC(!0));
        qS(gI, "#next-btn").addEventListener("click", () => !tLock.locked && sSC1());
      }, eLD);
    },
    sSC1 = (bw = !1) => {
      const cH = `<div class="fcc-option-group fcc-animate-element">
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
        <input
          type="text"
          class="fcc-color-input coloris-input"
          id="text-color-input"
          data-coloris
        />
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
    <button type="button" class="fcc-size-btn" data-size="18">Small</button
    ><button type="button" class="fcc-size-btn" data-size="24">Medium</button
    ><button type="button" class="fcc-size-btn" data-size="32">Large</button
    ><button type="button" class="fcc-size-btn" data-size="40">Extra Large</button>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Highlight Style</label>
  <p class="fcc-option-desc">Choose how words are highlighted during reading.</p>
  <div class="fcc-radio-group">
    <div class="fcc-compact-radio selected" data-value="text">
      <label
        ><input type="radio" name="highlight-style" value="text" checked /><span class="fcc-radio-title"
          >Text Color Change</span
        ></label
      >
    </div>
    <div class="fcc-compact-radio" data-value="background">
      <label
        ><input type="radio" name="highlight-style" value="background" /><span class="fcc-radio-title"
          >Background Rectangle</span
        ></label
      >
    </div>
  </div>
</div>
<div class="fcc-option-group fcc-animate-element">
  <label class="fcc-option-label">Highlight Text Color</label>
  <p class="fcc-option-desc">Color of the highlighted word text.</p>
  <div class="fcc-color-picker-group">
    <div class="fcc-color-input-wrapper">
      <div class="fcc-color-input-row">
        <input
          type="text"
          class="fcc-color-input coloris-input"
          id="highlight-text-color-input"
          data-coloris
        />
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
        <input
          type="text"
          class="fcc-color-input coloris-input"
          id="highlight-bg-color-input"
          data-coloris
        />
        <span class="fcc-color-preview" id="highlight-bg-color-preview"></span>
      </div>
    </div>
  </div>
</div>
<div class="fcc-button-group fcc-animate-element">
  <button type="button" class="heroui-button heroui-button-secondary" id="back-btn">
    <span class="heroui-button-text">Back</span></button
  ><button type="button" class="heroui-button" id="finish-btn">
    <span class="heroui-button-text">Finish</span>
  </button>
</div>
`;
      tTP(cH, "Subtitle Appearance", bw);
      const eLD = 1200 + 8 * 200;
      setTimeout(() => {
        sLib.init("Let learning be the light of your new life");
        sLib.uS();
        sLib.sA(300);

        const oL = {};
        for (let i2 = 0; i2 <= 100; i2 += 5) oL[i2] = `${i2}%`;
        const oC = qS(gI, "#bg-opacity-slider");
        oC.innerHTML = cCS(0, 100, 5, cfg.subtitle.bgOpacity, oL, "opacity-value");
        const oV = qS(oC, "#opacity-value"),
          oT = qS(oC, ".fcc-slider-track");
        iS(oT, oL, oV);
        oV && (oV.textContent = `${cfg.subtitle.bgOpacity}%`);

        oT.addEventListener("fcc-slider-change", (ev) => {
          const v = ev.detail.value;
          cfg.subtitle.bgOpacity = v;
          oV && (oV.textContent = `${v}%`);
          const rgb = cfg.subtitle.bgColor.match(/\d+/g) || [0, 0, 0];
          cfg.subtitle.bgColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${v / 100})`;
          sLib.uS();
        });

        iFSC("#font-size-slider", ".fcc-size-btn");

        const tCI = qS(gI, "#text-color-input"),
          htCI = qS(gI, "#highlight-text-color-input"),
          hbCI = qS(gI, "#highlight-bg-color-input"),
          tCP = qS(gI, "#text-color-preview"),
          htCP = qS(gI, "#highlight-text-color-preview"),
          hbCP = qS(gI, "#highlight-bg-color-preview"),
          openPicker = (input) => {
            if (!input) return;
            input.focus();
            input.dispatchEvent(new MouseEvent("mousedown", { bubbles: !0 }));
            input.dispatchEvent(new MouseEvent("click", { bubbles: !0 }));
          };

        tCI.value = cfg.subtitle.textColor;
        htCI.value = cfg.subtitle.highlightTextColor;
        hbCI.value = cfg.subtitle.highlightBgColor;
        tCP && (tCP.style.background = cfg.subtitle.textColor);
        htCP && (htCP.style.background = cfg.subtitle.highlightTextColor);
        hbCP && (hbCP.style.background = cfg.subtitle.highlightBgColor);
        tCP && tCP.addEventListener("click", () => openPicker(tCI));
        htCP && htCP.addEventListener("click", () => openPicker(htCI));
        hbCP && hbCP.addEventListener("click", () => openPicker(hbCI));

        const hsRadios = qSA(gI, 'input[name="highlight-style"]');
        const hbGroup = qS(gI, "#highlight-bg-color-group");
        const updateHighlightStyleVisibility = () => {
          const style = cfg.subtitle.highlightStyle;
          if (hbGroup) {
            hbGroup.style.display = style === "background" ? "block" : "none";
          }
        };
        updateHighlightStyleVisibility();

        qSA(gI, ".fcc-compact-radio").forEach((r) => {
          r.addEventListener("click", () => {
            const i = qS(r, 'input[type="radio"]');
            if (i && i.name === "highlight-style") {
              i.checked = !0;
              cfg.subtitle.highlightStyle = i.value;
              qSA(gI, 'input[name="highlight-style"]').forEach((r2) =>
                r2.closest(".fcc-compact-radio").classList.remove("selected")
              );
              r.classList.add("selected");
              updateHighlightStyleVisibility();
              sLib.uS();
            }
          });
        });

        const iC = () => {
          if (window.Coloris) {
            Coloris({
              el: ".coloris-input",
              theme: "polaroid",
              themeMode: "dark",
              format: "hex",
              alpha: !1,
              wrap: !0,
            });
            tCI.addEventListener("input", () => {
              cfg.subtitle.textColor = tCI.value;
              tCP && (tCP.style.background = tCI.value);
              sLib.uS();
            });
            htCI.addEventListener("input", () => {
              cfg.subtitle.highlightTextColor = htCI.value;
              htCP && (htCP.style.background = htCI.value);
              sLib.uS();
            });
            hbCI.addEventListener("input", () => {
              cfg.subtitle.highlightBgColor = hbCI.value;
              hbCP && (hbCP.style.background = hbCI.value);
              sLib.uS();
            });
          } else {
            setTimeout(iC, 100);
          }
        };
        iC();

        qS(gI, "#back-btn").addEventListener("click", (e) => {
          e.preventDefault();
          if (tLock.locked) return;
          sLib.dest();
          sMC(!0);
        });
        qS(gI, "#finish-btn").addEventListener("click", (e) => {
          e.preventDefault();
          if (tLock.locked) return;
          sLib.dest();
          console.log("Configuration saved:", cfg);
          alert("Configuration will be saved! (Not yet implemented)");
        });

        sB && sB.recalculate();
        aHL();
      }, eLD);
    };
  qS(gI, ".heroui-button").addEventListener("click", () => sIC());
})();
