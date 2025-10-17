/**
 * Buffered TTS Engine with Web Speech API
 * Generates audio chunks in background while playing in foreground
 */

import { waitForElement } from "../utils/dom.js";

/**
 * Parse content into subtitle blocks (~2 sentences each)
 * Ensures dots with spaces after them (not console.log() etc)
 */
export function parseIntoBlocks(contentData) {
  const blocks = [];
  let textBuffer = "";

  for (const item of contentData) {
    if (item.type === "text") {
      textBuffer += (textBuffer ? " " : "") + item.content.trim();
    } else if (item.type === "pre") {
      // Add marker to text buffer (item.marker is [CODE_BLOCK_N])
      textBuffer += ` ${item.marker} `;
    }
  }

  // Split into blocks of ~2 sentences
  // Only split on . ! ? that are followed by a space and capital letter (actual sentence end)
  // This prevents splitting on console.log() or similar
  const sentenceRegex = /[.!?]+(?=\s+[A-Z]|\s*$)/g;
  const sentences = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceRegex.exec(textBuffer)) !== null) {
    const sentence = textBuffer.substring(lastIndex, match.index + match[0].length).trim();
    if (sentence) sentences.push(sentence);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < textBuffer.length) {
    const remaining = textBuffer.substring(lastIndex).trim();
    if (remaining) sentences.push(remaining);
  }

  // If no sentences found, use entire text
  if (sentences.length === 0) {
    sentences.push(textBuffer);
  }

  let currentBlock = [];
  let blockText = "";

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    currentBlock.push(sentence);
    blockText += (blockText ? " " : "") + sentence;

    // Create block every 2 sentences or at the end
    if (currentBlock.length >= 2 || i === sentences.length - 1) {
      // Split text by code markers to create segments
      const segments = [];
      let remainingText = blockText;
      let lastIndex = 0;

      // Find all code markers and their positions
      const codeMarkerRegex = /\[CODE_BLOCK_(\d+)\]/g;
      let match;

      while ((match = codeMarkerRegex.exec(blockText)) !== null) {
        const textBefore = remainingText.substring(lastIndex, match.index);

        // Add text segment before code marker (if not empty)
        if (textBefore.trim()) {
          segments.push({
            type: "text",
            subtitleText: textBefore,
            speechText: textBefore.replace(/\s+/g, " ").trim(),
            codeIndex: null,
          });
        }

        // Add code marker segment
        segments.push({
          type: "code",
          subtitleText: match[0],
          speechText: "", // No speech for code marker itself
          codeIndex: parseInt(match[1]),
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text after last code marker
      const textAfter = blockText.substring(lastIndex);
      if (textAfter.trim()) {
        segments.push({
          type: "text",
          subtitleText: textAfter,
          speechText: textAfter.replace(/\s+/g, " ").trim(),
          codeIndex: null,
        });
      }

      // If no code markers found, create single text segment
      if (segments.length === 0) {
        segments.push({
          type: "text",
          subtitleText: blockText,
          speechText: blockText.replace(/\s+/g, " ").trim(),
          codeIndex: null,
        });
      }

      // Add all segments as separate blocks
      segments.forEach((segment) => {
        blocks.push(segment);
      });

      currentBlock = [];
      blockText = "";
    }
  }

  return { blocks };
}

/**
 * Create buffered TTS controller
 */
export function createTTSController(contentData, player, subtitleLib, config) {
  console.log("🎤 Initializing Buffered TTS Engine (Web Speech API)");
  console.log("📝 Content data:", contentData?.length, "items");

  const { blocks } = parseIntoBlocks(contentData);

  console.log("📦 Parsed into", blocks.length, "blocks");

  // Initialize subtitles with all text blocks
  const subtitleTexts = blocks.map((block) => block.subtitleText);
  player.initSubtitles(subtitleTexts);

  // State
  let currentBlockIndex = 0;
  let isPlaying = false;
  let isPaused = false;
  let isStopped = false;

  // Buffer management
  const audioBuffer = []; // Pre-generated utterances ready to play
  const BUFFER_SIZE = 3; // Keep 3 blocks ahead
  let isGenerating = false;
  let nextBlockToGenerate = 0;

  // Playback tracking
  let startTime = 0;
  let elapsedBeforePause = 0;
  let totalDuration = 0;

  // Speech synthesis
  const synth = window.speechSynthesis;
  let currentUtterance = null;

  /**
   * Get or create voice based on config
   */
  function getVoice() {
    const voices = synth.getVoices();
    const voicePref = config.webspeech?.voice || "default";

    if (voicePref === "female") {
      return voices.find((v) => v.name.toLowerCase().includes("female")) || voices[0];
    } else if (voicePref === "male") {
      return voices.find((v) => v.name.toLowerCase().includes("male")) || voices[0];
    }
    return voices[0];
  }

  /**
   * Generate utterance for a block (or null for code blocks)
   */
  function generateUtterance(block, blockIndex) {
    return new Promise((resolve) => {
      // For code blocks, don't create utterance - just return marker
      if (block.type === "code") {
        resolve({
          _isCodeMarker: true,
          _blockIndex: blockIndex,
          _block: block,
          _codeIndex: block.codeIndex,
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(block.speechText);
      utterance.voice = getVoice();
      utterance.rate = config.webspeech?.rate || 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Store metadata
      utterance._blockIndex = blockIndex;
      utterance._block = block;
      utterance._duration = 0;

      // Estimate duration (rough approximation)
      const words = block.speechText.split(/\s+/).length;
      const rate = config.webspeech?.rate || 1.0;
      utterance._duration = (words / (150 * rate)) * 60; // ~150 WPM base

      resolve(utterance);
    });
  }

  /**
   * Background generator - fills buffer ahead of playback
   */
  async function generateAhead() {
    if (isGenerating || isStopped) return;

    isGenerating = true;

    while (audioBuffer.length < BUFFER_SIZE && nextBlockToGenerate < blocks.length && !isStopped) {
      const block = blocks[nextBlockToGenerate];
      const utterance = await generateUtterance(block, nextBlockToGenerate);

      if (!isStopped) {
        audioBuffer.push(utterance);
        nextBlockToGenerate++;
      }
    }

    isGenerating = false;
  }

  /**
   * Play next buffered utterance
   */
  function playNextBuffered() {
    if (isStopped || audioBuffer.length === 0) {
      // Finished playing
      if (currentBlockIndex >= blocks.length) {
        stop();
      }
      return;
    }

    currentUtterance = audioBuffer.shift(); // Take from buffer
    const block = currentUtterance._block;
    currentBlockIndex = currentUtterance._blockIndex;

    // Highlight active subtitle
    player.highlightSubtitle(currentBlockIndex);

    // Check if this is a code marker segment
    if (currentUtterance._isCodeMarker) {
      console.log(`📦 Code marker reached: CODE_BLOCK_${currentUtterance._codeIndex}`);

      // Show the code block
      player.showCodeBlock(currentUtterance._codeIndex);

      // Add a pause (800ms) to let user see the code
      setTimeout(() => {
        playNextBuffered();
      }, 800);
      return;
    }

    // Update progress tracking
    totalDuration = blocks.reduce((sum, b, idx) => {
      if (idx < blocks.length) {
        const words = b.speechText.split(/\s+/).length;
        return sum + (words / (150 * (config.webspeech?.rate || 1.0))) * 60;
      }
      return sum;
    }, 0);

    const elapsedSoFar = blocks.slice(0, currentBlockIndex).reduce((sum, b) => {
      const words = b.speechText.split(/\s+/).length;
      return sum + (words / (150 * (config.webspeech?.rate || 1.0))) * 60;
    }, 0);

    startTime = Date.now() - elapsedSoFar * 1000;

    // Set up utterance events
    currentUtterance.onstart = () => {
      // Continue generating ahead
      generateAhead();
    };

    currentUtterance.onend = () => {
      if (!isPaused && !isStopped) {
        currentBlockIndex++;

        // Update progress
        const progress = currentBlockIndex / blocks.length;
        player.updateProgress(progress);

        const elapsed = (Date.now() - startTime) / 1000;
        player.updateTimeDisplay(elapsed, totalDuration);

        // Play next block
        playNextBuffered();
      }
    };

    currentUtterance.onerror = (e) => {
      console.error("TTS Error:", e);
      playNextBuffered(); // Try to continue
    };

    // Speak the utterance
    synth.speak(currentUtterance);

    // Update progress bar while speaking
    updateProgressLoop();
  }

  /**
   * Update progress bar during playback
   */
  function updateProgressLoop() {
    if (!isPlaying || isPaused || isStopped) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min(elapsed / totalDuration, 1.0);

    player.updateProgress(progress);
    player.updateTimeDisplay(elapsed, totalDuration);

    if (isPlaying && !isPaused) {
      requestAnimationFrame(updateProgressLoop);
    }
  }

  /**
   * Start playback
   */
  async function play() {
    console.log("▶️ Play requested - isPlaying:", isPlaying, "isPaused:", isPaused);

    if (isPlaying && !isPaused) return;

    isStopped = false;

    if (isPaused) {
      // Resume
      console.log("⏯️ Resuming playback");
      isPaused = false;
      isPlaying = true;
      synth.resume();
      startTime = Date.now() - elapsedBeforePause * 1000;
      player.setPlayingState(true);
      updateProgressLoop();
    } else {
      // Start from beginning or current position
      console.log("🎬 Starting playback from beginning");
      console.log("📦 Total blocks:", blocks.length);
      isPlaying = true;
      player.setPlayingState(true);

      // Generate initial buffer
      console.log("🔄 Generating initial buffer...");
      await generateAhead();
      console.log("✅ Buffer ready, audioBuffer.length:", audioBuffer.length);

      // Start playback
      if (audioBuffer.length > 0) {
        playNextBuffered();
      } else {
        console.error("❌ No audio blocks generated");
        stop();
      }
    }
  }

  /**
   * Pause playback
   */
  function pause() {
    if (!isPlaying || isPaused) return;

    isPaused = true;
    elapsedBeforePause = (Date.now() - startTime) / 1000;
    synth.pause();
    player.setPlayingState(false);
  }

  /**
   * Stop playback
   */
  function stop() {
    isStopped = true;
    isPlaying = false;
    isPaused = false;

    synth.cancel();

    // Reset state
    currentBlockIndex = 0;
    nextBlockToGenerate = 0;
    audioBuffer.length = 0;
    elapsedBeforePause = 0;

    // Reset UI
    player.setPlayingState(false);
    player.updateProgress(0);
    player.updateTimeDisplay(0, totalDuration);
    // Don't clear code display - keep history on reset

    if (subtitleLib && blocks.length > 0) {
      subtitleLib.setText(blocks[0].subtitleText);
    }
  }

  /**
   * Toggle play/pause
   */
  function togglePlayPause() {
    if (isPlaying && !isPaused) {
      pause();
    } else {
      play();
    }
  }

  // Wait for voices to load
  if (synth.getVoices().length === 0) {
    synth.addEventListener("voiceschanged", () => {
      // Voices loaded
    });
  }

  // Initialize subtitle library with first block
  if (subtitleLib && blocks.length > 0) {
    // Get parent element for subtitles (inside player)
    const playerContent = document.querySelector(".lectify-subtitle-area");

    // Ensure config has subtitle property
    const subtitleConfig = {
      subtitle: config.subtitle || {
        bgColor: "#000000",
        bgOpacity: 80,
        textColor: "#ffffff",
        textOpacity: 100,
        fontSize: 18,
      },
    };

    subtitleLib.init(blocks[0].subtitleText, playerContent, subtitleConfig);
  }

  return {
    play,
    pause,
    stop,
    togglePlayPause,
    isPlaying: () => isPlaying,
    isPaused: () => isPaused,
  };
}
