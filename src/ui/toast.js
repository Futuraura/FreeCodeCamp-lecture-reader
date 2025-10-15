/**
 * Toast Notification System
 * Non-blocking, accessible toast/notification component
 */

import { cE, b } from "../utils/dom.js";

// Toast container (singleton)
let toastContainer = null;

/**
 * Initialize toast container if not already created
 */
function ensureToastContainer() {
  if (toastContainer) return toastContainer;

  toastContainer = cE("div");
  toastContainer.className = "fcc-toast-container";
  toastContainer.setAttribute("aria-live", "polite");
  toastContainer.setAttribute("aria-atomic", "true");
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999998;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
    pointer-events: none;
  `;

  b.appendChild(toastContainer);
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {Object} options - Toast configuration
 * @param {string} options.title - Toast title
 * @param {string} options.message - Toast message
 * @param {string} [options.type='info'] - Toast type: 'info', 'success', 'warning', 'error'
 * @param {number} [options.duration=5000] - Duration in ms (0 = persistent)
 * @param {boolean} [options.dismissible=true] - Whether toast can be dismissed
 * @returns {Promise<void>} Resolves when toast is dismissed or auto-closed
 */
export function showToast({ title, message, type = "info", duration = 5000, dismissible = true }) {
  return new Promise((resolve) => {
    const container = ensureToastContainer();

    // Create toast element
    const toast = cE("div");
    toast.className = "fcc-toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    toast.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid ${getTypeColor(type)};
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      color: #ffffff;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      pointer-events: auto;
      transform: translateX(120%);
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease;
      opacity: 0;
      display: flex;
      gap: 12px;
      align-items: start;
      max-width: 100%;
      position: relative;
    `;

    // Icon
    const icon = cE("div");
    icon.style.cssText = `
      font-size: 24px;
      flex-shrink: 0;
      line-height: 1;
    `;
    icon.textContent = getTypeIcon(type);

    // Content wrapper
    const content = cE("div");
    content.style.cssText = `
      flex: 1;
      min-width: 0;
    `;

    // Title
    const titleEl = cE("div");
    titleEl.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: ${getTypeColor(type)};
    `;
    titleEl.textContent = title;

    // Message
    const messageEl = cE("div");
    messageEl.style.cssText = `
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.9);
      white-space: pre-wrap;
      word-break: break-word;
    `;
    messageEl.textContent = message;

    // Close button (if dismissible)
    let closeBtn = null;
    if (dismissible) {
      closeBtn = cE("button");
      closeBtn.className = "fcc-toast-close";
      closeBtn.setAttribute("aria-label", "Close notification");
      closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: 18px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
        padding: 0;
        line-height: 1;
      `;
      closeBtn.textContent = "×";
      closeBtn.onmouseover = () => {
        closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
        closeBtn.style.color = "#ffffff";
      };
      closeBtn.onmouseout = () => {
        closeBtn.style.background = "rgba(255, 255, 255, 0.1)";
        closeBtn.style.color = "rgba(255, 255, 255, 0.7)";
      };
      closeBtn.onclick = () => dismissToast();
    }

    // Progress bar (if auto-dismiss)
    let progressBar = null;
    if (duration > 0) {
      progressBar = cE("div");
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: ${getTypeColor(type)};
        width: 100%;
        border-radius: 0 0 10px 10px;
        transform-origin: left;
        transition: transform ${duration}ms linear;
      `;
      toast.appendChild(progressBar);
    }

    // Assemble toast
    content.appendChild(titleEl);
    content.appendChild(messageEl);
    toast.appendChild(icon);
    toast.appendChild(content);
    if (closeBtn) toast.appendChild(closeBtn);

    // Add to container
    container.appendChild(toast);

    // Dismiss function
    const dismissToast = () => {
      toast.style.transform = "translateX(120%)";
      toast.style.opacity = "0";

      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        // Remove container if no more toasts
        if (container.children.length === 0) {
          container.parentNode?.removeChild(container);
          toastContainer = null;
        }
        resolve();
      }, 300);
    };

    // Keyboard support
    if (dismissible) {
      toast.setAttribute("tabindex", "0");
      toast.onkeydown = (e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dismissToast();
        }
      };
    }

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";

        // Start progress bar animation
        if (progressBar) {
          requestAnimationFrame(() => {
            progressBar.style.transform = "scaleX(0)";
          });
        }
      });
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(dismissToast, duration);
    }
  });
}

/**
 * Show an info toast
 */
export function showInfoToast(title, message, duration) {
  return showToast({ title, message, type: "info", duration });
}

/**
 * Show a success toast
 */
export function showSuccessToast(title, message, duration) {
  return showToast({ title, message, type: "success", duration });
}

/**
 * Show a warning toast
 */
export function showWarningToast(title, message, duration) {
  return showToast({ title, message, type: "warning", duration });
}

/**
 * Show an error toast
 */
export function showErrorToast(title, message, duration) {
  return showToast({ title, message, type: "error", duration });
}

/**
 * Get color for toast type
 */
function getTypeColor(type) {
  const colors = {
    info: "#4dabf7",
    success: "#51cf66",
    warning: "#ffd43b",
    error: "#ff6b6b",
  };
  return colors[type] || colors.info;
}

/**
 * Get icon for toast type
 */
function getTypeIcon(type) {
  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };
  return icons[type] || icons.info;
}
