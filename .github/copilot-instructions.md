# Copilot Instructions: FreeCodeCamp Lecture Reader

## Project Overview

This is a **Tampermonkey/Greasemonkey userscript** that adds a configurable Text-to-Speech (TTS) lecture reader to FreeCodeCamp's lecture pages. The script replaces video content with an accessible reading experience featuring a sophisticated UI built with vanilla JavaScript.

**Target Environment**: Browser userscript (runs in user's browser via Tampermonkey/Greasemonkey)  
**License**: AGPL-3.0 (network use requires source disclosure)  
**Match Pattern**: `https://www.freecodecamp.org/learn/*/lecture-*/*`

## Architecture & Code Organization

### Single-File Architecture

All code lives in `user-script.js` - this is intentional for userscript deployment:

- **Userscript metadata** (lines 1-11): Tampermonkey directives defining name, version, match patterns, and grants
- **Self-executing anonymous function**: Wraps all logic to avoid global scope pollution
- **External CDN dependencies**: GSAP (animations), SimpleBar (scrollbars) loaded dynamically via `L()` function
- **Inline CSS**: ~5KB of styles injected via `<style>` tag for the configuration overlay UI

### Key Code Patterns

**Variable Naming Convention**: Extreme abbreviation for minification preparation

- `d` = document, `h` = document.head, `b` = document.body
- `cE` = createElement, `qS` = querySelector, `qSA` = querySelectorAll
- `gC` = glass container, `gI` = glass content inner, `sB` = SimpleBar instance
- When adding features, maintain this pattern (e.g., `nB` for "next button", `wT` for "welcome text")

**DOM Manipulation Pattern**:

```javascript
const elem = cE("div"); // Create
elem.className = "fcc-custom"; // Configure
elem.innerHTML = "..."; // Set content
parent.appendChild(elem); // Mount
```

**CDN Loading Pattern** (lines 24-27):

```javascript
const L = (s, u) => {
  const e = cE(s == "l" ? "link" : "script");
  s == "l" ? ((e.rel = "stylesheet"), (e.href = u)) : (e.src = u);
  h.appendChild(e);
  return e;
};
```

- Returns element for `.onload` event handling
- All external dependencies must use this pattern

### UI State Management

**Configuration Flow**: Multi-step wizard using DOM replacement

1. **Welcome screen** → Start button
2. **Engine selection** → Radio options (webspeech/transformers/piper)
3. **Model configuration** → Engine-specific settings
4. **Completion** → Save config (not yet implemented)

**Transition System** (`tTP` function, lines 179-223):

- Slides out old content (left/right based on `bw` parameter)
- Replaces DOM content
- Dynamically resizes glass container based on new content
- Slides in new content with staggered animations (200ms delay per element)
- **Critical**: Always add `fcc-animate-element` class to animated elements

**Animation Dependencies**:

- GSAP for custom cursor tracking (lines 144-163)
- CSS transitions for UI state changes (defined in inline `<style>`)
- `requestAnimationFrame` for layout measurements before animations

### TTS Engine Architecture (Not Yet Implemented)

The configuration saves to `cfg` object (line 169) with structure:

```javascript
cfg = {
  ttsEngine: "webspeech" | "transformers" | "piper",
  // Additional properties based on engine choice
};
```

**Engine-specific configs**:

- **Web Speech API**: voice selection (default/female/male), speech rate slider (0.5x-2x)
- **Transformers.js**: model selection (speecht5/vits), voice type (neutral/female/male)
- **Piper TTS**: voice model (en_US-lessac-medium/high, en_GB-alan-medium), speed slider (0.8-1.2)

## Critical Implementation Details

### localStorage Guard (line 14)

```javascript
if (localStorage.getItem("freecodecampLectureReader")) return;
```

**Purpose**: Prevents script from running after initial configuration. Remove this check when debugging.

### Glass Morphism Container Sizing (lines 103-118, 187-201)

Container dimensions are **dynamically calculated** based on content:

1. Measure content bounding boxes after DOM insertion
2. Calculate with padding (96px) and gaps (32px between elements)
3. Animate `width` and `height` via CSS transitions
4. Recalculate SimpleBar scrollable area after resize

**When adding new screens**: Follow this pattern or container will be incorrectly sized.

### Custom Cursor System (lines 144-163)

- Desktop only (`min-width: 768px` media query)
- Two circles: big (40px) scales on hover, small (10px) tracks precisely
- GSAP handles smooth tracking with different easing for each ball
- All interactive elements must call `aHL()` to bind hover handlers

### Slider Component (lines 170-178, 224-262)

Reusable slider with custom labels via `cCS()` and `iS()`:

```javascript
const labels = { 0.5: "Slow", 1: "Normal", 1.5: "Fast" };
container.innerHTML = cCS(min, max, step, defaultValue, labels, valueElementId);
iS(querySelector(".fcc-slider-track"), labels, valueElement);
```

- `cCS` = create slider HTML with initial positioning
- `iS` = initialize event handlers (mouse + touch support)
- Values snap to step increments

## Development Workflow

### Testing the Userscript

1. Install Tampermonkey browser extension
2. Create new script and paste `user-script.js` content
3. Navigate to any FreeCodeCamp lecture URL matching the pattern
4. Clear localStorage: `localStorage.removeItem("freecodecampLectureReader")`
5. Refresh page to re-trigger initialization

### External Dependencies (CDN)

- **GSAP 3.12.2**: Animation library for cursor tracking
- **SimpleBar**: Custom scrollbar styling (CSS + JS)
- **Google Fonts**: Space Grotesk font family

**Do not bundle or self-host** - userscripts must load from public CDNs.

### Debugging Tips

- Check browser console for CDN loading errors
- Verify `@match` pattern in Tampermonkey editor
- Use `@grant none` - script doesn't require special permissions
- Test responsive behavior at 768px breakpoint (desktop cursor threshold)

## Code Style Guidelines

1. **Minification-ready**: Use single-letter variables for common DOM operations
2. **No semicolons after function declarations** (but yes for statements)
3. **Template literals** for multi-line HTML strings
4. **Arrow functions** for callbacks and utilities
5. **Ternary operators** over if/else when concise
6. **CSS classes prefixed** with `fcc-` to avoid conflicts with FreeCodeCamp's styles

## Known Limitations & TODOs

- [ ] TTS functionality not implemented (UI only)
- [ ] Configuration persistence (localStorage save/load)
- [ ] Actual lecture content extraction from FreeCodeCamp
- [ ] Audio playback controls (play/pause/speed)
- [ ] Voice model loading and initialization
- [ ] Error handling for model download failures

## Adding New Features

**Example: Adding a new configuration option**

1. Add HTML to appropriate `sIC()` or `sMC()` section
2. Include `fcc-animate-element` class on wrapper
3. Add event listeners after `eLD` timeout
4. Update `cfg` object with new property
5. Recalculate container size in `tTP()` callback
6. Test animation timing (200ms \* element count)

**Example: Adding a new TTS engine**

1. Add radio option in `sIC()` with data-value attribute
2. Create engine-specific configuration HTML in `sMC()`
3. Update `cfg.ttsEngine` validation
4. Implement engine-specific initialization logic
5. Document model download sizes in UI descriptions
