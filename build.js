const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Read the userscript header template
const header = `// ==UserScript==
// @name         FreeCodeCamp lecture reader (Lectify)
// @namespace    http://tampermonkey.net/
// @version      ${new Date().toISOString().split("T")[0]}
// @description  Adds a configurable lecture reader to replace the videos
// @author       Mark Pikaro (Futuraura)
// @match        https://www.freecodecamp.org/learn/*/lecture-*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

`;

const isWatch = process.argv.includes("--watch");
const buildExtension = process.argv.includes("--extension");

// Main entry point for the modular Lectify userscript
const entryPoint = "src/lectify-main.js";

const userscriptOptions = {
  entryPoints: [entryPoint],
  bundle: true,
  outfile: "dist/userscript.js",
  format: "iife", // Immediately Invoked Function Expression
  platform: "browser",
  target: "es2020",
  banner: {
    js: header,
  },
  minify: false, // Keep readable for userscript review
  sourcemap: false,
};

const extensionOptions = {
  entryPoints: [entryPoint],
  bundle: true,
  outfile: "dist/extension-content.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: false,
  sourcemap: true,
  define: {
    IS_EXTENSION: "true",
  },
};

async function build() {
  try {
    if (buildExtension) {
      console.log("🧩 Building browser extension...");
      await esbuild.build(extensionOptions);

      // Copy extension files
      const extensionFiles = [
        "manifest.json",
        "extension/background.js",
        "extension/popup.html",
        "extension/popup.js",
      ];

      for (const file of extensionFiles) {
        const src = path.join(__dirname, file);
        const dest = path.join(__dirname, "dist", path.basename(file));
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      // Create icons directory if needed
      const iconsDir = path.join(__dirname, "dist", "icons");
      if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
      }

      // Copy icons if they exist
      const iconFiles = ["icon16.png", "icon48.png", "icon128.png", "icon.svg"];
      for (const iconFile of iconFiles) {
        const src = path.join(__dirname, "icons", iconFile);
        const dest = path.join(iconsDir, iconFile);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      // Create README for the dist folder
      const readmeSrc = path.join(__dirname, "EXTENSION.md");
      const readmeDest = path.join(__dirname, "dist", "README.md");
      if (fs.existsSync(readmeSrc)) {
        fs.copyFileSync(readmeSrc, readmeDest);
      }

      console.log("✅ Extension build complete! Check dist/ folder");

      // Create ZIP file
      console.log("📦 Creating ZIP archive...");
      try {
        // Check if zip command exists (for macOS/Linux) or use PowerShell (for Windows)
        const isWindows = process.platform === "win32";
        const zipFile = path.join(__dirname, "lectify-extension.zip");

        // Remove old zip if exists
        if (fs.existsSync(zipFile)) {
          fs.unlinkSync(zipFile);
        }

        if (isWindows) {
          // Use PowerShell's Compress-Archive
          const distPath = path.join(__dirname, "dist");
          execSync(
            `powershell -Command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipFile}' -Force"`,
            {
              stdio: "inherit",
            }
          );
        } else {
          // Use zip command on macOS/Linux
          execSync(`cd dist && zip -r ../lectify-extension.zip .`, {
            stdio: "inherit",
          });
        }

        console.log("✅ ZIP created: lectify-extension.zip");
        console.log("");
        console.log("📦 Installation instructions:");
        console.log("   Chrome/Edge/Brave: Load unpacked extension from dist/ folder");
        console.log(
          "   Firefox: about:debugging → Load Temporary Add-on → Select manifest.json from dist/"
        );
        console.log("   Or: Extract lectify-extension.zip and load from extracted folder");
      } catch (zipError) {
        console.warn("⚠️ Could not create ZIP file:", zipError.message);
        console.log("📦 You can manually ZIP the dist/ folder");
      }
    } else if (isWatch) {
      console.log("👀 Watching for changes...");
      const ctx = await esbuild.context(userscriptOptions);
      await ctx.watch();
    } else {
      await esbuild.build(userscriptOptions);
      console.log("✅ Build complete! Check dist/userscript.js");
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
