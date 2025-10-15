// Styles injector for Lectify
// Injects CSS into the page dynamically

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
 * Get all Lectify CSS styles
 * @returns {string} CSS content
 */
function getLectifyStyles() {
  return `
/* Lectify Styles - Modular Version */
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap");

/* Base styles */
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

/* Config overlay */
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

/* Gradient background */
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

/* Animated gradient orbs */
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

/* Animations */
@keyframes mC {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}

@keyframes mV {
  0% { transform: translateY(-50%); }
  50% { transform: translateY(50%); }
  100% { transform: translateY(-50%); }
}

@keyframes mH {
  0% { transform: translateX(-50%) translateY(-10%); }
  50% { transform: translateX(50%) translateY(10%); }
  100% { transform: translateX(-50%) translateY(-10%); }
}

/* Glass container */
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

/* Content wrapper */
.fcc-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Buttons */
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
  transition: background 0.2s, box-shadow 0.2s, transform 1s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.8s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.heroui-button:hover {
  background: #0062d1;
  box-shadow: 0 4px 12px 0 rgba(0, 114, 245, 0.4);
}

.heroui-button-text {
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  font-family: "Space Grotesk", sans-serif;
}

/* Subtitles */
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

/* Add more styles here from the original user-script.js as needed */
/* This is a simplified version - full CSS should be extracted from lines 33-996 of user-script.js */
`;
}
