// DOM utility functions for Lectify
// Provides helper functions for document manipulation and element creation

export const d = document;
export const h = d.head;
export const b = d.body;

/**
 * Create element shorthand
 * @param {string} tagName - HTML tag name
 * @returns {HTMLElement}
 */
export const cE = (tagName) => d.createElement(tagName);

/**
 * Query selector shorthand
 * @param {string|HTMLElement} elementOrSelector - Element to search in or selector
 * @param {string} [selector] - Selector if first param is element
 * @returns {HTMLElement|null}
 */
export const qS = (elementOrSelector, selector) =>
  selector ? elementOrSelector.querySelector(selector) : d.querySelector(elementOrSelector);

/**
 * Query selector all shorthand
 * @param {string|HTMLElement} elementOrSelector - Element to search in or selector
 * @param {string} [selector] - Selector if first param is element
 * @returns {NodeList}
 */
export const qSA = (elementOrSelector, selector) =>
  selector ? elementOrSelector.querySelectorAll(selector) : d.querySelectorAll(elementOrSelector);

/**
 * Load external resource (script or stylesheet)
 * @param {string} type - 'l' for link/stylesheet, 's' for script
 * @param {string} url - URL of the resource
 * @returns {HTMLElement}
 */
export const L = (type, url) => {
  const element = cE(type === "l" ? "link" : "script");
  if (type === "l") {
    element.rel = "stylesheet";
    element.href = url;
  } else {
    element.src = url;
  }
  h.appendChild(element);
  return element;
};

/**
 * Ensures the SVG goo filter is injected into the page
 * This creates the blur effect for animated gradients
 */
export const ensureGooFilter = (() => {
  let injected = false;
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
    injected = true;
  };
})();

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Max wait time in ms
 * @returns {Promise<HTMLElement>}
 */
export function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = qS(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = qS(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(element);
      }
    });

    observer.observe(d.body, {
      childList: true,
      subtree: true,
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}
