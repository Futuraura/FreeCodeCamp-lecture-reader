# Copilot Instructions: FreeCodeCamp Lecture Reader (Lectify)

## Project Overview

A **Tampermonkey userscript** that adds text-to-speech lecture reading to FreeCodeCamp courses. Recently refactored from a 2,539-line monolith (`user-script.js`) into a modular ES6 architecture using **esbuild** to bundle into a single distributable userscript.

**Core functionality**: TTS playback with synchronized subtitle highlighting, code block display, and interactive configuration wizard.

## Architecture

### Modular Design Pattern

The codebase follows a **single-responsibility module** pattern where `src/lectify-main.js` orchestrates imports from specialized modules. The build system (`build.js`) uses esbuild to bundle everything into `dist/userscript.js` with Tampermonkey headers auto-injected.

**Critical**: All modules use ES6 `import/export`. Never use CommonJS (`require`). The bundler converts this to an IIFE for browser compatibility.

### Module Structure

```
src/
├── lectify-main.js          # Entry point - orchestrates app flow
├── config/
│   └── lectify-settings.js  # localStorage persistence, defaultConfig
├── utils/
│   ├── dom.js               # DOM shortcuts: cE, qS, qSA, L (library loader)
│   └── contentParser.js     # FreeCodeCamp page scraping, waitForContent
├── styles/
│   └── stylesInjector.js    # CSS injection (glass morphism, gradients)
├── tts/
│   └── engine.js            # Web Speech API, chunk-based playback
└── ui/
    ├── wizard.js            # Multi-step config (transitionToPage, showInitialConfig)
    ├── components.js        # Reusable controls (createSlider, initFontSizeControl)
    └── subtitles.js         # SubtitleLibrary class - GSAP animations, word highlighting
```

**Key insight**: Original 2,539-line file mapping documented in `MODULAR-BREAKDOWN.md`. Reference this when tracking features from `user-script.js` to new modules.

## Build & Development Workflow

### Commands

```bash
npm run build       # One-time build → dist/userscript.js
npm run dev         # Watch mode for rapid iteration
```

**Build configuration**: Edit `build.js` to change entry points. Currently uses `configs.lectify` (see line 16-26). To switch examples, modify `selectedEntry` variable.

### Testing Cycle

1. Edit modules in `src/`
2. Run `npm run build`
3. Open Tampermonkey → paste `dist/userscript.js`
4. Visit `https://www.freecodecamp.org/learn/*/lecture-*/*`

**No hot-reload**: Userscripts require manual browser refresh after rebuild.

## Code Conventions

### Naming Patterns (Inherited from Original)

- **Extreme abbreviations** for DOM utilities: `cE` (createElement), `qS` (querySelector), `qSA` (querySelectorAll), `L` (load external library)
- **Short variable names** in original: `d` (document), `b` (body), `h` (head), `gS` (GSAP script), `sC` (SimpleBar CSS)
- **Function abbreviations**: `tTP` (transitionToPage), `sIC` (showInitialConfig), `sMC` (showModelConfig), `sTTS` (startTTS)

**When refactoring**: Preserve these patterns for consistency with the original 2,539-line file. The project intentionally uses terse naming for userscript size optimization (though esbuild can minify).

### Module Export Style

```javascript
// ✅ Correct - Named exports for clarity
export function startTTS(config, fullText, ...) { ... }
export const defaultConfig = { ... };

// ❌ Avoid - Default exports (harder to trace in large codebase)
export default { startTTS, defaultConfig };
```

### External Dependencies

Loaded via CDN using the `L()` utility from `dom.js`:

```javascript
// From lectify-main.js
import { L } from "./utils/dom.js";
const gS = L("s", externalLibraries.gsap); // 's' = script
const sC = L("l", externalLibraries.simplebar.css); // 'l' = link
```

**Available libraries** (see `config/lectify-settings.js`):

- **GSAP**: Subtitle animations, page transitions
- **SimpleBar**: Custom scrollbars in config wizard
- **Coloris**: Color picker for subtitle styling
- **Iconify** (optional): 200k+ icons - see `LIBRARIES.md` for integration guide

**NPM dependencies** are bundled (HeroUI React components available but not yet integrated).

## Critical Implementation Details

### TTS Engine (`tts/engine.js`)

**Chunk-based playback**: Text split into sentence chunks, each played via `speechSynthesis.speak()`. Uses `boundary` events for word highlighting but has **fallback timing** when browser support is poor (line 200-250 in engine.js).

**Code block handling**: When lecture content contains code snippets, playback pauses to display code, then resumes. See `showCodeBlock()` logic in `startTTS()`.

**Promises for async flow**: Each chunk returns a Promise that resolves on `end` event. Chain with `.then()` for sequential playback.

### SubtitleLibrary (`ui/subtitles.js`)

**GSAP dependency**: All animations use `gsap.to()`. Never use CSS transitions for subtitle effects.

**Highlight modes**:

- `text`: Changes word color (default gold `#ffd700`)
- `background`: Adds background behind word

**Word indexing**: Text split into words with `buildWordMap()`. Highlighting uses word indices, not character offsets.

### Configuration Wizard (`ui/wizard.js`)

**Page transitions**: `transitionToPage()` slides content left/right with staggered element animations (100ms delay per element). Uses `transitionLock` to prevent double-clicks.

**SimpleBar integration**: Each page recalculates scrollbar via `simpleBar.recalculate()` after DOM updates.

**Config flow**: Initial → Model Selection → Subtitle Appearance → Save → Start Player

### Content Parser (`utils/contentParser.js`)

**FreeCodeCamp-specific selectors**: Targets `.fcc-content-wrapper` and `.lecture-content`. Use `waitForElement()` utility to handle dynamic page loading.

**Code block extraction**: Finds `<pre>` tags, replaces with placeholders in text, stores separately for TTS timing.

## Common Tasks

### Adding a New UI Control

1. Create component function in `ui/components.js`:
   ```javascript
   export function createMyControl(options) { ... }
   ```
2. Import in `ui/wizard.js`:
   ```javascript
   import { createMyControl } from "./components.js";
   ```
3. Call within wizard page HTML builder
4. Run `npm run build`

### Adding a New TTS Engine

1. Edit `tts/engine.js` → add new `case` in engine selection
2. Update `config/lectify-settings.js` → add to `defaultConfig`
3. Create new wizard step in `ui/wizard.js` for engine-specific settings
4. Test with `npm run build` and manual browser check

### Debugging TTS Playback Issues

**Check console**: All TTS events logged (`Starting TTS with:`, `Chunk complete:`)

**Browser support**: Test with `checkSpeechSupport()` - returns false if `speechSynthesis` unavailable

**Timing fallbacks**: If word boundaries fail, engine falls back to `wordDuration` calculation (line 67 in engine.js)

## Integration Points

- **FreeCodeCamp DOM**: Lecture content loaded asynchronously - always use `waitForContent()` (contentParser.js)
- **LocalStorage**: Config saved as JSON string with key `freecodecampLectureReader` (lectify-settings.js)
- **Web Speech API**: Global `window.speechSynthesis` - check browser compatibility at caniuse.com/speech-synthesis

## Documentation Map

- `MODULAR-BREAKDOWN.md` - Line-by-line mapping from original to modules
- `WORKFLOW-GUIDE.md` - Build commands, development cycle
- `LIBRARIES.md` - External library integration patterns
- `MODULARIZATION-COMPLETE.md` - Refactoring completion summary
- `user-script.js` - **Original monolith** (preserved for reference - DO NOT EDIT)

## Anti-Patterns to Avoid

- ❌ **Don't edit `user-script.js`** - it's archived for reference only
- ❌ **Don't use jQuery** - uses vanilla JS with shorthand utilities
- ❌ **Don't import CSS files** - CSS injected via `stylesInjector.js` as template literal
- ❌ **Don't assume synchronous DOM** - FreeCodeCamp uses React, content loads async
- ❌ **Don't break chunking logic** - TTS playback depends on precise sentence boundaries

## Current Status

**Completed**: All 10 modules extracted, build system functional, TTS engine operational

**In Progress**: Full player UI integration (see TODO comments in `lectify-main.js` lines 50-60)

**Next Steps** (from lectify-main.js):

1. Complete wizard UI implementation
2. Integrate player controls with TTS engine
3. Test presentation mode with code block display
