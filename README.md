# FreeCodeCamp Lecture Reader (Lectify)

A Tampermonkey userscript that adds text-to-speech lecture reading to FreeCodeCamp courses with synchronized subtitle highlighting, code block display, and an interactive configuration wizard.

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the userscript:**

   ```bash
   npm run build        # One-time build
   npm run dev          # Watch mode for development
   ```

3. **Install in Tampermonkey:**

   - Copy the contents of `dist/userscript.js`
   - Create a new script in Tampermonkey
   - Paste and save

4. **Use it:**
   - Visit any FreeCodeCamp lecture page: `https://www.freecodecamp.org/learn/*/lecture-*/*`
   - Configure your TTS preferences on first run

## 📁 Project Structure

```text
src/
├── lectify-main.js          # Entry point
├── config/
│   └── lectify-settings.js  # Configuration & localStorage
├── utils/
│   ├── dom.js               # DOM utilities
│   └── contentParser.js     # FreeCodeCamp content extraction
├── styles/
│   └── stylesInjector.js    # CSS injection
├── tts/
│   └── engine.js            # Text-to-speech engine
└── ui/
    ├── wizard.js            # Configuration wizard
    ├── components.js        # Reusable UI controls
    └── subtitles.js         # Subtitle display & animations
```

## 🛠️ Development

This project uses **esbuild** to bundle modular ES6 code into a single userscript. The original 2,539-line monolithic file has been refactored into focused modules for maintainability.

**For AI coding agents:** See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for detailed architecture and development guidelines.

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

**Author:** Mark Pikaro (Futuraura)
