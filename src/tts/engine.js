// TTS (Text-to-Speech) Engine Module
// Handles speech synthesis, playback, and word highlighting coordination

import { cE, qS } from "../utils/dom.js";

/**
 * Start TTS playback with the given configuration
 * @param {Object} config - Configuration object
 * @param {string} fullText - Full text to speak
 * @param {Array} contentData - Parsed content data
 * @param {Array} preBlocks - Code blocks
 * @param {HTMLElement} container - Container element for code display
 * @param {Object} subtitleLib - Subtitle library instance
 */
export async function startTTS(config, fullText, contentData, preBlocks, container, subtitleLib) {
  console.log("Starting TTS with:", {
    engine: config.ttsEngine,
    text: fullText.substring(0, 100) + "...",
    preBlocks: preBlocks.length,
  });

  const subtitleSegments = [];
  const codeEvents = [];
  let runningWordCount = 0;

  // Build subtitle segments and code events
  contentData.forEach((item) => {
    if (item.type === "text") {
      const sanitized = (item.content || "").replace(/\[CODE_BLOCK_\d+\]/g, " ").trim();
      if (sanitized.length) {
        subtitleSegments.push(sanitized);
        const words = sanitized.split(/\s+/).filter((w) => w.length > 0);
        runningWordCount += words.length;
      }
    } else if (item.type === "pre") {
      codeEvents.push({ position: runningWordCount, index: item.index });
    }
  });

  const subtitleText = subtitleSegments.join(" ").replace(/\s+/g, " ").trim();

  // Set up code display
  const host =
    qS(container, ".fcc-presentation-bg") || qS(container, ".fcc-content-wrapper") || container;
  let codeDisplay = qS(host, ".fcc-code-display");
  if (!codeDisplay) {
    codeDisplay = cE("div");
    codeDisplay.className = "fcc-code-display";
    host.appendChild(codeDisplay);
  }
  codeDisplay.classList.remove("fcc-visible");
  codeDisplay.innerHTML = "";

  // Initialize subtitle library
  subtitleLib.init(subtitleText);
  subtitleLib.stA();
  subtitleLib.uS();

  // Build chunk metadata
  const chunksMeta = buildChunksMeta(subtitleLib.chunks);

  // Check speech synthesis support
  const speechSupported = checkSpeechSupport(config);

  let voices = [];
  if (speechSupported) {
    voices = await getVoices();
  }

  const targetRate = config.webspeech?.rate ?? 1;
  const wordDuration = Math.max(180, 320 / targetRate);

  // Code block management
  let codePointer = 0;
  let activeCodeIndex = null;
  let lastCodePosition = null;
  let highlightSuppressed = false;

  const showCodeBlock = (position, blockIdx) => {
    if (blockIdx === activeCodeIndex) return;
    const block = preBlocks[blockIdx];
    if (!block) return;
    codeDisplay.innerHTML = "";
    codeDisplay.appendChild(block.cloneNode(true));
    codeDisplay.classList.add("fcc-visible");
    activeCodeIndex = blockIdx;
    lastCodePosition = position;
    highlightSuppressed = true;
    subtitleLib.clearHighlight();
  };

  const hideCodeBlock = () => {
    if (activeCodeIndex === null) return;
    codeDisplay.classList.remove("fcc-visible");
    codeDisplay.innerHTML = "";
    activeCodeIndex = null;
    lastCodePosition = null;
    highlightSuppressed = false;
  };

  const triggerCodeEvents = (globalWordIndex) => {
    while (codePointer < codeEvents.length && codeEvents[codePointer].position <= globalWordIndex) {
      const evt = codeEvents[codePointer];
      if (typeof evt.index === "number") {
        showCodeBlock(evt.position, evt.index);
      }
      codePointer++;
    }
    if (lastCodePosition !== null && globalWordIndex > lastCodePosition) {
      hideCodeBlock();
    }
  };

  // Play individual chunk
  const playChunk = (meta) =>
    createChunkPlayer(
      meta,
      subtitleLib,
      triggerCodeEvents,
      hideCodeBlock,
      highlightSuppressed,
      speechSupported,
      targetRate,
      voices,
      config,
      wordDuration
    );

  // Run full playback
  const runPlayback = async () => {
    if (chunksMeta.length === 0) {
      triggerCodeEvents(0);
      return;
    }
    for (const chunkMeta of chunksMeta) {
      await playChunk(chunkMeta);
    }
  };

  // Start playback
  try {
    await runPlayback();
    triggerCodeEvents(runningWordCount + 1);
    hideCodeBlock();
    subtitleLib.clearHighlight();
  } catch (err) {
    console.error("TTS playback failed", err);
  }
}

/**
 * Build metadata for chunks
 */
function buildChunksMeta(chunks) {
  const chunksMeta = [];
  let cumulativeWords = 0;

  chunks.forEach((chunk) => {
    const chunkText = (chunk || "").trim();
    if (!chunkText.length) return;
    const words = chunkText.split(/\s+/).filter((w) => w.length > 0);
    if (!words.length) return;

    const offsets = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(chunkText)) !== null) {
      offsets.push({ start: match.index, end: match.index + match[0].length });
    }

    chunksMeta.push({
      start: cumulativeWords,
      end: cumulativeWords + words.length,
      text: chunkText,
      words,
      offsets,
    });
    cumulativeWords += words.length;
  });

  return chunksMeta;
}

/**
 * Check if speech synthesis is supported
 */
function checkSpeechSupport(config) {
  return (
    config.ttsEngine === "webspeech" &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * Get available voices
 */
function getVoices() {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      },
      { once: true }
    );

    // Timeout after 2 seconds
    setTimeout(() => resolve([]), 2000);
  });
}

/**
 * Resolve voice based on preference
 */
function resolveVoice(voices, preference) {
  if (!voices || voices.length === 0) return null;
  if (preference === "default") return voices[0] || null;

  const matcher =
    preference === "female" ? /female|woman|girl|samantha|victoria/i : /male|man|boy|david|alex/i;

  const exactMatch = voices.find((v) => matcher.test(v.name || ""));
  if (exactMatch) return exactMatch;

  return voices[0] || null;
}

/**
 * Create chunk player
 */
function createChunkPlayer(
  meta,
  subtitleLib,
  triggerCodeEvents,
  hideCodeBlock,
  highlightSuppressed,
  speechSupported,
  targetRate,
  voices,
  config,
  wordDuration
) {
  return new Promise((resolve) => {
    if (!meta || meta.words.length === 0) {
      triggerCodeEvents(meta ? meta.end : 0);
      resolve();
      return;
    }

    subtitleLib.showChunk(meta.text);
    subtitleLib.uS();
    triggerCodeEvents(meta.start);

    let lastHighlightedIndex = -1;
    let fallbackTimer = null;
    let fallbackIndex = 0;
    let boundaryTriggered = false;

    const cleanup = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const finish = () => {
      cleanup();
      triggerCodeEvents(meta.end + 1);
      hideCodeBlock();
      resolve();
    };

    const highlightWordAt = (idx) => {
      if (idx < 0 || idx >= meta.words.length) return;
      if (idx === lastHighlightedIndex) return;
      const globalIndex = meta.start + idx;
      triggerCodeEvents(globalIndex);
      if (highlightSuppressed) return;
      subtitleLib.highlightWord(idx);
      lastHighlightedIndex = idx;
    };

    const advanceFallback = () => {
      if (fallbackIndex >= meta.words.length) {
        finish();
        return;
      }
      highlightWordAt(fallbackIndex);
      fallbackIndex += 1;
      fallbackTimer = setTimeout(advanceFallback, wordDuration);
    };

    if (speechSupported) {
      const utterance = new SpeechSynthesisUtterance(meta.text);
      utterance.rate = targetRate;
      const voice = resolveVoice(voices, config.webspeech?.voice || "default");
      if (voice) utterance.voice = voice;

      const offsets = meta.offsets || [];
      const findWordIndex = (charIndex) => {
        if (!offsets.length) return -1;
        for (let i = 0; i < offsets.length; i++) {
          if (charIndex < offsets[i].end) {
            return i;
          }
        }
        return offsets.length - 1;
      };

      utterance.onstart = () => {
        if (meta.words.length > 0) {
          highlightWordAt(0);
        }
      };

      utterance.onboundary = (event) => {
        if (typeof event.charIndex !== "number") return;
        const idx = findWordIndex(event.charIndex);
        if (idx === -1) return;
        boundaryTriggered = true;
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        highlightWordAt(idx);
      };

      utterance.onend = () => {
        if (!boundaryTriggered && meta.words.length > 0) {
          highlightWordAt(meta.words.length - 1);
        }
        finish();
      };

      utterance.onerror = () => {
        finish();
      };

      window.speechSynthesis.speak(utterance);

      fallbackTimer = setTimeout(() => {
        if (!boundaryTriggered) {
          advanceFallback();
        }
      }, Math.max(600, wordDuration));
    } else {
      advanceFallback();
    }
  });
}

/**
 * Cancel all ongoing speech
 */
export function cancelTTS() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
