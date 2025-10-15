const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Read the userscript header template
const header = `// ==UserScript==
// @name         FreeCodeCamp lecture reader (Lectify)
// @namespace    http://tampermonkey.net/
// @version      ${new Date().toISOString().split("T")[0]}
// @description  Adds a configurable lecture reader to replace the videos - Modular version
// @author       Mark Pikaro (Futuraura)
// @match        https://www.freecodecamp.org/learn/*/lecture-*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

`;

const isWatch = process.argv.includes("--watch");

// Build configurations for different entry points
const configs = {
  // Original examples
  basic: "src/main.js",
  icons: "src/main-with-icons.js",
  enhanced: "src/main-enhanced.js",

  // Lectify modular version
  lectify: "src/lectify-main.js",
};

// Select which entry point to use (change this to switch examples)
const selectedEntry = configs.lectify; // Change to configs.basic, configs.icons, etc.

const buildOptions = {
  entryPoints: [selectedEntry],
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

async function build() {
  try {
    if (isWatch) {
      console.log("👀 Watching for changes...");
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
    } else {
      await esbuild.build(buildOptions);
      console.log("✅ Build complete! Check dist/userscript.js");
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
