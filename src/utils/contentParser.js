// Content parser for FreeCodeCamp lectures
// Extracts and parses lecture content, separating text from code blocks

import { qS } from "./dom.js";

/**
 * Parse lecture content from FreeCodeCamp page
 * @returns {Object} - Parsed content with title, text, and code blocks
 */
export function parseLectureContent() {
  const contentStart = qS("#content-start");
  const description = qS("#description");

  if (!contentStart || !description) {
    throw new Error("Could not find #content-start or #description elements");
  }

  const title = contentStart.textContent.trim();
  const contentData = [];
  const preBlocks = [];

  // Parse all child nodes
  Array.from(description.childNodes).forEach((node) => {
    if (node.nodeType === 1 && node.tagName === "PRE") {
      // Code block
      contentData.push({
        type: "pre",
        index: preBlocks.length,
        marker: `[CODE_BLOCK_${preBlocks.length}]`,
      });
      preBlocks.push(node.cloneNode(true));
    } else if (node.nodeType === 3) {
      // Text node
      const txt = node.textContent.trim();
      if (txt) {
        contentData.push({ type: "text", content: txt });
      }
    } else if (node.nodeType === 1) {
      // Element node
      const txt = node.textContent.trim();
      if (txt) {
        contentData.push({ type: "text", content: txt });
      }
    }
  });

  // Build full text with markers for code blocks
  const fullText = contentData
    .map((item) => (item.type === "text" ? item.content : item.marker || ""))
    .join(" ");

  return {
    title,
    contentData,
    preBlocks,
    fullText,
  };
}

/**
 * Wait for lecture content to load
 * @param {number} timeout - Maximum wait time in ms
 * @returns {Promise<Object>} - Resolved when content is loaded
 */
export function waitForContent(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const checkContent = () => {
      const contentStart = qS("#content-start");
      const description = qS("#description");

      if (contentStart && description) {
        try {
          const parsed = parseLectureContent();
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      }
    };

    // Check immediately
    checkContent();

    // Poll for content
    const interval = setInterval(() => {
      checkContent();
    }, 100);

    // Timeout after specified time
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Timeout waiting for lecture content"));
    }, timeout);
  });
}

/**
 * Build subtitle segments from content data
 * @param {Array} contentData - Parsed content data
 * @returns {Object} - Segments and code events
 */
export function buildSubtitleSegments(contentData) {
  const subtitleSegments = [];
  const codeEvents = [];
  let runningWordCount = 0;

  contentData.forEach((item) => {
    if (item.type === "text") {
      const sanitized = (item.content || "").replace(/\[CODE_BLOCK_\d+\]/g, " ").trim();

      if (sanitized.length) {
        subtitleSegments.push(sanitized);
        const words = sanitized.split(/\s+/).filter((w) => w.length > 0);
        runningWordCount += words.length;
      }
    } else if (item.type === "pre") {
      codeEvents.push({
        position: runningWordCount,
        index: item.index,
      });
    }
  });

  const subtitleText = subtitleSegments.join(" ").replace(/\s+/g, " ").trim();

  return {
    subtitleText,
    subtitleSegments,
    codeEvents,
  };
}
