/**
 * Simple TTS Engine - Web Speech API implementation
 * Handles text-to-speech playback with word-by-word tracking
 */

/**
 * Create a TTS controller for the player
 * @param {Object} config - User configuration
 * @param {Object} lectureData - Parsed lecture content
 * @param {Object} player - Player interface
 * @param {Object} subtitleLib - Subtitle library instance
 * @returns {Object} - TTS controller interface
 */
export function createTTSController(config, lectureData, player, subtitleLib) {
  const { fullText, preBlocks, contentData } = lectureData;

  // State
  let isPlaying = false;
  let isPaused = false;
  let currentUtterance = null;
  let currentWordIndex = 0;
  let totalWords = 0;
  let startTime = 0;
  let pausedTime = 0;
  let elapsedBeforePause = 0;
  let currentSegmentIndex = 0;

  // Parse content to build word timeline and code events
  const { words, codeEvents, subtitleText, speechText } = parseContent(contentData);
  totalWords = words.length;

  // Break text into sentence segments for subtitle display
  const subtitleSegments = subtitleText.match(/[^.!?]+[.!?]+/g) || [subtitleText];

  // Initialize subtitle with first segment
  const subtitleArea = player.getSubtitleArea();
  if (subtitleArea && subtitleLib) {
    subtitleLib.init(subtitleSegments[0] || subtitleText, subtitleArea, config);
  }

  // Estimate total duration (rough estimate based on word count and rate)
  const rate = config.webspeech?.rate ?? 1;
  const avgWordsPerMinute = 150 * rate; // Base 150 WPM adjusted by rate
  const estimatedDuration = (totalWords / avgWordsPerMinute) * 60;

  /**
   * Parse content data into words and code events
   * IMPORTANT: Remove code block markers from text to avoid speaking them
   */
  function parseContent(contentData) {
    const allWords = [];
    const codeEvents = [];
    const textSegments = [];
    let wordIndex = 0;

    contentData.forEach((item) => {
      if (item.type === "text") {
        // Remove code block markers completely
        const text = item.content.replace(/\[CODE_BLOCK_\d+\]/g, "").trim();
        if (text) {
          const itemWords = text.split(/\s+/).filter((w) => w.length > 0);
          allWords.push(...itemWords);
          textSegments.push(text);
          wordIndex += itemWords.length;
        }
      } else if (item.type === "pre") {
        // Add code event at current word position
        codeEvents.push({
          wordIndex: wordIndex,
          blockIndex: item.index,
        });
      }
    });

    // Build clean text without any code markers
    const subtitleText = allWords.join(" ");
    const speechText = textSegments.join(" "); // Clean text for TTS

    return { words: allWords, codeEvents, subtitleText, speechText };
  }

  /**
   * Get available voices
   */
  function getVoice() {
    const voices = speechSynthesis.getVoices();
    const voicePref = config.webspeech?.voice || "default";

    if (voicePref === "default") {
      return voices[0] || null;
    }

    // Try to find a voice matching preference
    const matchingVoice = voices.find((v) => {
      const lowerName = v.name.toLowerCase();
      if (voicePref === "female") {
        return (
          lowerName.includes("female") ||
          lowerName.includes("woman") ||
          lowerName.includes("samantha") ||
          lowerName.includes("victoria")
        );
      } else if (voicePref === "male") {
        return (
          lowerName.includes("male") ||
          lowerName.includes("man") ||
          lowerName.includes("daniel") ||
          lowerName.includes("alex")
        );
      }
      return false;
    });

    return matchingVoice || voices[0] || null;
  }

  /**
   * Handle word boundary events
   * Note: Web Speech API word boundaries can be unreliable, so we track carefully
   */
  function handleWordBoundary(event) {
    if (!isPlaying) return;

    // Increment word index
    currentWordIndex++;

    // Update progress based on actual word count
    const progress = Math.min(100, (currentWordIndex / totalWords) * 100);
    player.updateProgress(progress);

    // Update time display based on actual elapsed time
    const elapsed = (Date.now() - startTime + elapsedBeforePause) / 1000;
    player.updateTimeDisplay(elapsed, estimatedDuration);

    // Update subtitle by segment (not scrolling, but showing complete sentences)
    if (subtitleLib) {
      // Calculate which segment we should be showing based on word progress
      const wordsPerSegment = totalWords / subtitleSegments.length;
      const targetSegment = Math.floor(currentWordIndex / wordsPerSegment);

      if (targetSegment !== currentSegmentIndex && targetSegment < subtitleSegments.length) {
        currentSegmentIndex = targetSegment;
        subtitleLib.setText(subtitleSegments[currentSegmentIndex]);
      }
    }

    // Check for code block events
    const codeEvent = codeEvents.find((e) => e.wordIndex === currentWordIndex);
    if (codeEvent) {
      player.showCodeBlock(codeEvent.blockIndex);
    }
  }

  /**
   * Start playback
   */
  function play() {
    if (isPlaying && !isPaused) return;

    if (isPaused) {
      // Resume
      speechSynthesis.resume();
      isPaused = false;
      isPlaying = true;
      startTime = Date.now();
      player.setPlayingState(true);
      return;
    }

    // Start new playback
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }

    // Wait for voices to load
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          play();
        },
        { once: true }
      );
      return;
    }

    isPlaying = true;
    isPaused = false;
    currentWordIndex = 0;
    currentSegmentIndex = 0;
    startTime = Date.now();
    elapsedBeforePause = 0;
    player.setPlayingState(true);

    // Reset subtitle to first segment
    if (subtitleLib && subtitleSegments.length > 0) {
      subtitleLib.setText(subtitleSegments[0]);
    }

    // Create utterance with CLEAN text (no code blocks)
    currentUtterance = new SpeechSynthesisUtterance(speechText);
    currentUtterance.rate = rate;
    currentUtterance.voice = getVoice();

    // Event listeners
    currentUtterance.onboundary = handleWordBoundary;

    currentUtterance.onend = () => {
      isPlaying = false;
      isPaused = false;
      player.setPlayingState(false);
      player.updateProgress(100);
      player.updateTimeDisplay(estimatedDuration, estimatedDuration);
      if (subtitleLib) {
        subtitleLib.setText("Playback complete");
      }
    };

    currentUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      isPlaying = false;
      isPaused = false;
      player.setPlayingState(false);
    };

    // Start speaking
    speechSynthesis.speak(currentUtterance);
  }

  /**
   * Pause playback
   */
  function pause() {
    if (!isPlaying || isPaused) return;

    speechSynthesis.pause();
    isPaused = true;
    isPlaying = false;
    elapsedBeforePause += Date.now() - startTime;
    player.setPlayingState(false);
  }

  /**
   * Stop playback
   */
  function stop() {
    if (currentUtterance) {
      speechSynthesis.cancel();
    }
    isPlaying = false;
    isPaused = false;
    currentWordIndex = 0;
    currentSegmentIndex = 0;
    elapsedBeforePause = 0;
    player.setPlayingState(false);
    player.updateProgress(0);
    player.updateTimeDisplay(0, estimatedDuration);
    player.clearCodeDisplay();
    if (subtitleLib && subtitleSegments.length > 0) {
      subtitleLib.setText(subtitleSegments[0]);
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

  // Set initial time display
  player.updateTimeDisplay(0, estimatedDuration);

  // Return controller interface
  return {
    play,
    pause,
    stop,
    togglePlayPause,
    isPlaying: () => isPlaying && !isPaused,
    isPaused: () => isPaused,
  };
}
