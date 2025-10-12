// ==UserScript==
// @name         FreeCodeCamp lecture reader
// @namespace    http://tampermonkey.net/
// @version      2025-10-12.05
// @description  Adds a configurable lecture reader to replace the videos.
// @author       Mark Pikaro (Futuraura)
// @match        https://www.freecodecamp.org/learn/*/lecture-*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function () {
  if (localStorage.getItem("freecodecampLectureReader")) return;
  const d = document,
    h = d.head,
    b = d.body,
    cE = (t) => d.createElement(t),
    qS = (e, s) => e.querySelector(s),
    qSA = (e, s) => e.querySelectorAll(s);
  b.style.overflow = "hidden";
  const L = (s, u) => {
      const e = cE(s == "l" ? "link" : "script");
      s == "l" ? ((e.rel = "stylesheet"), (e.href = u)) : (e.src = u);
      h.appendChild(e);
      return e;
    },
    gS = L("s", "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
    sC = L("l", "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.css"),
    sJ = L("s", "https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js");

  const s = cE("style");
  s.textContent =
    "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');body:has(.fcc-config-overlay){overflow:hidden!important}@media (min-width:768px){body:has(.fcc-config-overlay){cursor:none!important}body:has(.fcc-config-overlay) *{cursor:none!important}}.fcc-config-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;font-family:'Space Grotesk',sans-serif;overflow:hidden;opacity:0;transition:opacity 1s}.fcc-config-overlay.fcc-visible{opacity:1}.fcc-cursor{display:none;pointer-events:none}@media (min-width:768px){.fcc-cursor{display:block}.fcc-cursor__ball{left:0;mix-blend-mode:difference;position:fixed;top:0;z-index:10001}.fcc-cursor__ball circle{fill:#f7f8fa}.fcc-cursor__ball--big{will-change:transform}.fcc-cursor__ball--small{will-change:transform}}.fcc-gradient-bg{width:100%;height:100%;position:relative;overflow:hidden;background:linear-gradient(40deg,#6c00a2,#001152)}.fcc-gradient-bg svg{position:fixed;top:0;left:0;width:0;height:0}.fcc-gradients-container{filter:url(#goo) blur(40px);width:100%;height:100%;position:relative;z-index:0}.fcc-gradient-bg .g1,.fcc-gradient-bg .g2,.fcc-gradient-bg .g3,.fcc-gradient-bg .g4,.fcc-gradient-bg .g5{position:absolute;width:80%;height:80%;top:calc(50% - 40%);left:calc(50% - 40%);mix-blend-mode:hard-light}.fcc-gradient-bg .g1{background:radial-gradient(circle,#1271ff 0,rgba(18,113,255,0) 50%) no-repeat;animation:mV 30s ease infinite}.fcc-gradient-bg .g2{background:radial-gradient(circle,#dd4aff 0,rgba(221,74,255,0) 50%) no-repeat;transform-origin:calc(50% - 400px);animation:mC 20s reverse infinite}.fcc-gradient-bg .g3{background:radial-gradient(circle,#64dcff 0,rgba(100,220,255,0) 50%) no-repeat;top:calc(50% - 40% + 200px);left:calc(50% - 40% - 500px);transform-origin:calc(50% + 400px);animation:mC 40s linear infinite}.fcc-gradient-bg .g4{background:radial-gradient(circle,#c83232 0,rgba(200,50,50,0) 50%) no-repeat;transform-origin:calc(50% - 200px);animation:mH 40s ease infinite;opacity:.7}.fcc-gradient-bg .g5{width:160%;height:160%;top:calc(50% - 80%);left:calc(50% - 80%);background:radial-gradient(circle,#d6d62b 0,rgba(180,180,50,0) 50%) no-repeat;transform-origin:calc(50% - 800px) calc(50% + 200px);animation:mC 20s ease infinite}@keyframes mC{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}@keyframes mV{0%{transform:translateY(-50%)}50%{transform:translateY(50%)}100%{transform:translateY(-50%)}}@keyframes mH{0%{transform:translateX(-50%) translateY(-10%)}50%{transform:translateX(50%) translateY(10%)}100%{transform:translateX(-50%) translateY(-10%)}}.fcc-glass-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:rgba(0,0,0,.7);border-radius:.75rem;padding:0;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 8px 32px 0 rgba(0,0,0,.37);display:flex;flex-direction:column;align-items:center;overflow:hidden;transition:all .8s cubic-bezier(.65,0,.35,1);max-height:80vh;max-width:90vw;width:0;height:0}.fcc-glass-container.fcc-sized{width:auto;height:auto}.fcc-glass-content-wrapper{width:100%;max-height:80vh}.fcc-glass-content-inner{padding:3rem;display:flex;flex-direction:column;align-items:center;gap:2rem}.simplebar-scrollbar::before{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.1);border-radius:3px;transition:background .2s}.simplebar-scrollbar.simplebar-visible::before{opacity:1}.simplebar-scrollbar:hover::before{background:rgba(255,255,255,.35)}.simplebar-track{background:transparent;right:6px;width:6px;border-radius:3px}.simplebar-track.simplebar-vertical{top:12px;bottom:12px}.simplebar-content-wrapper{transition:all .8s cubic-bezier(.65,0,.35,1)}.fcc-welcome-text{color:#fff;font-size:3rem;font-weight:700;text-align:center;margin:0;white-space:nowrap;position:relative;opacity:0;transition:opacity .8s}.fcc-welcome-text.fcc-visible{opacity:1}.fcc-config-title{color:#fff;font-size:2.5rem;font-weight:700;text-align:center;margin:0;white-space:nowrap;position:relative}.fcc-animate-element{transition:transform 1s cubic-bezier(.65,0,.35,1),opacity 1s cubic-bezier(.65,0,.35,1)}.fcc-slide-out-right{transform:translateX(calc(100% + 3rem + 50vw));opacity:0}.fcc-slide-out-left{transform:translateX(calc(-100% - 3rem - 50vw));opacity:0}.heroui-button{position:relative;display:inline-flex;align-items:center;justify-content:center;padding:.75rem 2rem;font-size:1.125rem;font-weight:600;line-height:1.5;background:#0072f5;color:#fff;border:none;border-radius:.875rem;cursor:pointer;transition:background .2s,box-shadow .2s,transform 1s cubic-bezier(.65,0,.35,1),opacity .8s;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);overflow:hidden}.heroui-button.fcc-initial{opacity:0}.heroui-button.fcc-visible{opacity:1}.heroui-button::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,0) 100%);z-index:0}.heroui-button:hover{background:#0062d1;box-shadow:0 4px 12px 0 rgba(0,114,245,.4)}.heroui-button:active{box-shadow:0 1px 2px 0 rgba(0,0,0,.05)}.heroui-button-text{position:relative;z-index:1;font-size:1.5rem;font-family:'Space Grotesk',sans-serif}.fcc-config-content{display:flex;flex-direction:column;gap:1.5rem;width:100%;max-width:600px}.fcc-option-group{background:rgba(255,255,255,.05);border-radius:1rem;padding:1.5rem;border:1px solid rgba(255,255,255,.1);width:100%}.fcc-option-label{color:#fff;font-size:1.25rem;font-weight:600;margin-bottom:.5rem;display:block}.fcc-option-desc{color:rgba(255,255,255,.8);font-size:.95rem;margin-bottom:1rem;line-height:1.5}.fcc-select{width:100%;padding:.75rem 1rem;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.2);border-radius:.5rem;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:1rem;cursor:pointer;transition:all .2s}.fcc-select:hover{background:rgba(0,0,0,.4);border-color:rgba(255,255,255,.3)}.fcc-select:focus{outline:none;border-color:#0072f5;box-shadow:0 0 0 3px rgba(0,114,245,.2)}.fcc-select option{background:#1a1a2e;color:#fff}.fcc-slider-container{margin-top:1rem;padding:0 .5rem}.fcc-slider-track{position:relative;width:100%;height:8px;border-radius:4px;background:rgba(255,255,255,.1);cursor:pointer;transition:background .2s}.fcc-slider-track:hover{background:rgba(255,255,255,.15)}.fcc-slider-fill{position:absolute;left:0;top:0;height:100%;background:#0072f5;border-radius:4px;pointer-events:none;transition:width .1s}.fcc-slider-thumb{position:absolute;top:50%;width:20px;height:20px;border-radius:50%;background:#0072f5;cursor:grab;transition:all .2s;box-shadow:0 2px 4px rgba(0,0,0,.3);transform:translate(-50%,-50%)}.fcc-slider-thumb:hover{background:#0062d1;transform:translate(-50%,-50%) scale(1.1)}.fcc-slider-thumb:active{cursor:grabbing;transform:translate(-50%,-50%) scale(1.15)}.fcc-slider-value{color:#fff;font-size:1.125rem;font-weight:600;text-align:center;margin-top:.75rem;min-height:1.5rem}.fcc-radio-group{display:flex;flex-direction:column;gap:.75rem;margin-top:.5rem}.fcc-button-group{display:flex;gap:1rem;margin-top:1rem;justify-content:center}.heroui-button-secondary{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}.heroui-button-secondary:hover{background:rgba(255,255,255,.15)}.heroui-button-outline{background:transparent;border:2px solid rgba(255,255,255,.3);cursor:not-allowed;opacity:.5}.heroui-button-outline:hover{background:transparent;box-shadow:none;transform:none}.fcc-hidden{visibility:hidden;position:absolute;pointer-events:none}.fcc-radio-option{background:rgba(255,255,255,.05);border-radius:1rem;padding:1.5rem;border:2px solid rgba(255,255,255,.1);cursor:pointer;transition:all .2s;margin-bottom:1rem;width:100%}.fcc-radio-option:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}.fcc-radio-option.selected{background:rgba(0,114,245,.15);border-color:#0072f5}.fcc-radio-option input[type=radio]{margin-right:1rem;width:1.25rem;height:1.25rem;cursor:pointer}.fcc-radio-label{display:flex;align-items:center;cursor:pointer}.fcc-radio-title{color:#fff;font-size:1.25rem;font-weight:600;margin:0}.fcc-radio-desc{color:rgba(255,255,255,.8);font-size:.95rem;margin:.5rem 0 0 2.25rem;line-height:1.5}.fcc-compact-radio{background:rgba(255,255,255,.05);border-radius:.75rem;padding:1rem 1.25rem;border:2px solid rgba(255,255,255,.1);cursor:pointer;transition:all .2s}.fcc-compact-radio:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}.fcc-compact-radio.selected{background:rgba(0,114,245,.15);border-color:#0072f5}.fcc-compact-radio input[type=radio]{margin-right:.75rem;width:1.125rem;height:1.125rem;cursor:pointer}.fcc-compact-radio label{display:flex;align-items:center;cursor:pointer;margin:0}.fcc-compact-radio .fcc-radio-title{font-size:1.125rem}";
  h.appendChild(s);

  const o = cE("div");
  o.className = "fcc-config-overlay";
  o.innerHTML =
    '<div class="fcc-cursor"><div class="fcc-cursor__ball fcc-cursor__ball--big"><svg height="40" width="40"><circle cx="20" cy="20" r="20" stroke-width="0"></circle></svg></div><div class="fcc-cursor__ball fcc-cursor__ball--small"><svg height="10" width="10"><circle cx="5" cy="5" r="5" stroke-width="0"></circle></svg></div></div><div class="fcc-gradient-bg"><svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo"/><feBlend in="SourceGraphic" in2="goo"/></filter></defs></svg><div class="fcc-gradients-container"><div class="g1"></div><div class="g2"></div><div class="g3"></div><div class="g4"></div><div class="g5"></div></div></div><div class="fcc-glass-container"><div class="fcc-glass-content-wrapper" data-simplebar><div class="fcc-glass-content-inner"><h1 class="fcc-welcome-text fcc-animate-element">Welcome to Lectify</h1><button class="heroui-button fcc-initial"><span class="heroui-button-text">Start</span></button></div></div></div>';
  b.appendChild(o);
  const gC = qS(o, ".fcc-glass-container"),
    gI = qS(o, ".fcc-glass-content-inner");
  requestAnimationFrame(() => o.classList.add("fcc-visible"));
  let sB = null;
  sJ.onload = () => {
    const w = qS(o, "[data-simplebar]");
    w && window.SimpleBar && (sB = new SimpleBar(w, { autoHide: !1, forceVisible: !0 }));
  };
  setTimeout(() => {
    const wT = qS(gI, ".fcc-welcome-text"),
      stB = qS(gI, ".heroui-button");
    if (wT && stB) {
      const tR = wT.getBoundingClientRect(),
        bR = stB.getBoundingClientRect(),
        p = 96,
        g = 32,
        w = Math.max(tR.width, bR.width) + p,
        he = tR.height + bR.height + g + p;
      gC.style.width = w + "px";
      gC.style.height = he + "px";
      gC.classList.add("fcc-sized");
      sB && sB.recalculate();
      setTimeout(() => {
        wT.classList.add("fcc-visible");
        stB.classList.add("fcc-visible");
      }, 1e3);
    }
  }, 1e3);
  let c,
    bB,
    sB2,
    wM = !1;
  const oMH = () => {
      gsap && bB && gsap.to(bB, { scale: 2, duration: 0.3 });
    },
    oMHO = () => {
      gsap && bB && gsap.to(bB, { scale: 1, duration: 0.3 });
    };
  gS.onload = () => {
    c = qS(o, ".fcc-cursor");
    bB = qS(o, ".fcc-cursor__ball--big");
    sB2 = qS(o, ".fcc-cursor__ball--small");
    const tPC = (e) => {
        wM = e.matches;
        !e.matches && (c.style.display = "none");
      },
      mQ = matchMedia("(min-width:768px)");
    tPC(mQ);
    mQ.addListener(tPC);
    o.addEventListener("mousemove", (e) => {
      wM && (c.style.display = "block");
      gsap.to(bB, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.4, ease: "power2.out" });
      gsap.to(sB2, { x: e.clientX - 5, y: e.clientY - 5, duration: 0.1 });
    });
    aHL();
  };
  const aHL = () =>
      qSA(o, ".heroui-button,.fcc-radio-option,.fcc-compact-radio,.fcc-slider-track").forEach(
        (e) => {
          e.addEventListener("mouseenter", oMH);
          e.addEventListener("mouseleave", oMHO);
        }
      ),
    cfg = { ttsEngine: null },
    cCS = (mi, ma, st, dV, lb, vI) => {
      const p = ((dV - mi) / (ma - mi)) * 100;
      return `<div class="fcc-slider-track" data-min="${mi}" data-max="${ma}" data-step="${st}" data-value="${dV}"><div class="fcc-slider-fill" style="width:${p}%"></div><div class="fcc-slider-thumb" style="left:${p}%"></div></div><div class="fcc-slider-value" id="${vI}">${
        lb[dV] || dV
      }</div>`;
    },
    iS = (t, lb, vE) => {
      const th = qS(t, ".fcc-slider-thumb"),
        fi = qS(t, ".fcc-slider-fill"),
        mi = parseFloat(t.dataset.min),
        ma = parseFloat(t.dataset.max),
        st = parseFloat(t.dataset.step);
      let iD = !1;
      const uS = (cX) => {
          const r = t.getBoundingClientRect();
          let p = ((cX - r.left) / r.width) * 100;
          p = Math.max(0, Math.min(100, p));
          let v = mi + (p / 100) * (ma - mi);
          v = Math.round(v / st) * st;
          v = Math.max(mi, Math.min(ma, v));
          p = ((v - mi) / (ma - mi)) * 100;
          th.style.left = p + "%";
          fi.style.width = p + "%";
          t.dataset.value = v;
          vE && (vE.textContent = lb[v] || v);
          return v;
        },
        sD = (e) => {
          iD = !0;
          const cX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
          uS(cX);
          e.preventDefault();
        },
        dr = (e) => {
          if (!iD) return;
          const cX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
          uS(cX);
          e.preventDefault();
        },
        stD = () => (iD = !1);
      th.addEventListener("mousedown", sD);
      t.addEventListener("mousedown", sD);
      d.addEventListener("mousemove", dr);
      d.addEventListener("mouseup", stD);
      th.addEventListener("touchstart", sD);
      t.addEventListener("touchstart", sD);
      d.addEventListener("touchmove", dr);
      d.addEventListener("touchend", stD);
    },
    tTP = (nH, nT = null, bw = !1) => {
      const cE2 = Array.from(gI.children);
      cE2.forEach((e, i) => {
        e.classList.add("fcc-animate-element");
        setTimeout(
          () => e.classList.add(bw ? "fcc-slide-out-left" : "fcc-slide-out-right"),
          i * 200
        );
      });
      const sOD = cE2.length * 200 + 1e3;
      setTimeout(() => {
        gI.innerHTML = "";
        const nE = [];
        if (nT) {
          const nTi = cE("h1");
          nTi.className = "fcc-config-title fcc-animate-element";
          nTi.classList.add(bw ? "fcc-slide-out-right" : "fcc-slide-out-left");
          nTi.textContent = nT;
          nE.push(nTi);
          gI.appendChild(nTi);
        }
        const tC = cE("div");
        tC.innerHTML = nH;
        Array.from(tC.children).forEach((ch) => {
          ch.classList.add(bw ? "fcc-slide-out-right" : "fcc-slide-out-left");
          nE.push(ch);
          gI.appendChild(ch);
        });
        requestAnimationFrame(() => {
          let tH = 0,
            mW = 0;
          nE.forEach((e) => {
            const r = e.getBoundingClientRect();
            tH += r.height;
            mW = Math.max(mW, r.width);
          });
          const p = 96,
            g = (nE.length - 1) * 32,
            nW = Math.max(696, mW + p),
            nH2 = Math.min(innerHeight * 0.8, tH + g + p);
          gC.style.width = nW + "px";
          gC.style.height = nH2 + "px";
          sB && (sB.recalculate(), (sB.getScrollElement().scrollTop = 0));
          aHL();
          setTimeout(
            () =>
              nE.forEach((e, i) =>
                setTimeout(
                  () => e.classList.remove("fcc-slide-out-left", "fcc-slide-out-right"),
                  i * 200
                )
              ),
            100
          );
        });
      }, sOD);
    },
    sIC = (bw = !1) => {
      const cH =
        '<div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Choose TTS Engine</label><div class="fcc-radio-option" data-value="webspeech"><label class="fcc-radio-label"><input type="radio" name="tts-engine" value="webspeech"><div class="fcc-radio-title">Web Speech API</div></label><p class="fcc-radio-desc">Built-in browser API. Works instantly with no downloads. Lightweight and fast, perfect for quick setup.</p></div><div class="fcc-radio-option" data-value="transformers"><label class="fcc-radio-label"><input type="radio" name="tts-engine" value="transformers"><div class="fcc-radio-title">Transformers.js</div></label><p class="fcc-radio-desc">High-quality AI models running locally in your browser. Offers the best voice quality with advanced neural networks (170-350MB download).</p></div><div class="fcc-radio-option" data-value="piper"><label class="fcc-radio-label"><input type="radio" name="tts-engine" value="piper"><div class="fcc-radio-title">Piper TTS</div></label><p class="fcc-radio-desc">Balanced quality and performance. Fast neural TTS with natural-sounding voices (30-60MB download).</p></div></div><div class="fcc-button-group fcc-animate-element"><button class="heroui-button heroui-button-outline" id="next-btn" disabled><span class="heroui-button-text">Next</span></button></div>';
      tTP(cH, "Initial Configuration", bw);
      const eLD = 1200 + 3 * 200;
      setTimeout(() => {
        const rO = qSA(gI, ".fcc-radio-option"),
          rI = qSA(gI, 'input[name="tts-engine"]'),
          nB = qS(gI, "#next-btn");
        rO.forEach((op, i) => {
          op.addEventListener("click", () => {
            rI[i].checked = !0;
            cfg.ttsEngine = rI[i].value;
            rO.forEach((o) => o.classList.remove("selected"));
            op.classList.add("selected");
            nB.disabled = !1;
            nB.classList.remove("heroui-button-outline");
          });
        });
        rI.forEach((r) => {
          r.addEventListener("change", () => {
            cfg.ttsEngine = r.value;
            rO.forEach((o) => o.classList.remove("selected"));
            const sO = qS(gI, `.fcc-radio-option[data-value="${r.value}"]`);
            sO && sO.classList.add("selected");
            nB.disabled = !1;
            nB.classList.remove("heroui-button-outline");
          });
        });
        nB.addEventListener("click", () => !nB.disabled && sMC());
      }, eLD);
    },
    sMC = () => {
      let oH = "";
      if (cfg.ttsEngine === "webspeech") {
        oH =
          '<div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Voice</label><p class="fcc-option-desc">Select a voice from your system\'s available voices.</p><div class="fcc-radio-group"><div class="fcc-compact-radio selected" data-value="default"><label><input type="radio" name="voice" value="default" checked><span class="fcc-radio-title">Default Voice</span></label></div><div class="fcc-compact-radio" data-value="female"><label><input type="radio" name="voice" value="female"><span class="fcc-radio-title">Female Voice</span></label></div><div class="fcc-compact-radio" data-value="male"><label><input type="radio" name="voice" value="male"><span class="fcc-radio-title">Male Voice</span></label></div></div></div><div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Speech Rate</label><p class="fcc-option-desc">Adjust how fast the text is read.</p><div class="fcc-slider-container" id="rate-slider-container"></div></div>';
      } else if (cfg.ttsEngine === "transformers") {
        oH =
          '<div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Model</label><p class="fcc-option-desc">Choose the AI model to use. Larger models offer better quality but require more resources.</p><div class="fcc-radio-group"><div class="fcc-compact-radio selected" data-value="speecht5"><label><input type="radio" name="model" value="speecht5" checked><span class="fcc-radio-title">SpeechT5 - Balanced (170MB)</span></label></div><div class="fcc-compact-radio" data-value="vits"><label><input type="radio" name="model" value="vits"><span class="fcc-radio-title">VITS - High Quality (350MB)</span></label></div></div></div><div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Voice Type</label><p class="fcc-option-desc">Select the voice characteristics.</p><div class="fcc-radio-group"><div class="fcc-compact-radio selected" data-value="neutral"><label><input type="radio" name="voice-type" value="neutral" checked><span class="fcc-radio-title">Neutral</span></label></div><div class="fcc-compact-radio" data-value="female"><label><input type="radio" name="voice-type" value="female"><span class="fcc-radio-title">Female</span></label></div><div class="fcc-compact-radio" data-value="male"><label><input type="radio" name="voice-type" value="male"><span class="fcc-radio-title">Male</span></label></div></div></div>';
      } else if (cfg.ttsEngine === "piper") {
        oH =
          '<div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Voice Model</label><p class="fcc-option-desc">Choose a Piper voice model. Quality affects file size and processing time.</p><div class="fcc-radio-group"><div class="fcc-compact-radio selected" data-value="en_US-lessac-medium"><label><input type="radio" name="piper-voice" value="en_US-lessac-medium" checked><span class="fcc-radio-title">US English - Lessac (Medium, 30MB)</span></label></div><div class="fcc-compact-radio" data-value="en_US-lessac-high"><label><input type="radio" name="piper-voice" value="en_US-lessac-high"><span class="fcc-radio-title">US English - Lessac (High, 60MB)</span></label></div><div class="fcc-compact-radio" data-value="en_GB-alan-medium"><label><input type="radio" name="piper-voice" value="en_GB-alan-medium"><span class="fcc-radio-title">British English - Alan (Medium, 30MB)</span></label></div></div></div><div class="fcc-option-group fcc-animate-element"><label class="fcc-option-label">Speaking Speed</label><p class="fcc-option-desc">Adjust the speed of speech generation.</p><div class="fcc-slider-container" id="speed-slider-container"></div></div>';
      }
      const cH =
        oH +
        '<div class="fcc-button-group fcc-animate-element"><button class="heroui-button heroui-button-secondary" id="back-btn"><span class="heroui-button-text">Back</span></button><button class="heroui-button" id="finish-btn"><span class="heroui-button-text">Finish</span></button></div>';
      tTP(cH, "Model Configuration");
      const eLD = 1200 + 4 * 200;
      setTimeout(() => {
        qSA(gI, ".fcc-compact-radio").forEach((r) => {
          r.addEventListener("click", () => {
            const i = qS(r, 'input[type="radio"]');
            i.checked = !0;
            const rN = i.name;
            qSA(gI, `input[name="${rN}"]`).forEach((r2) =>
              r2.closest(".fcc-compact-radio").classList.remove("selected")
            );
            r.classList.add("selected");
          });
        });
        if (cfg.ttsEngine === "webspeech") {
          const rL = {
              0.5: "0.5x - Slow",
              0.75: "0.75x - Slightly Slow",
              1: "1x - Normal",
              1.25: "1.25x - Slightly Fast",
              1.5: "1.5x - Fast",
              1.75: "1.75x - Very Fast",
              2: "2x - Very Fast",
            },
            rC = qS(gI, "#rate-slider-container");
          rC.innerHTML = cCS(0.5, 2, 0.25, 1, rL, "rate-value");
          iS(qS(rC, ".fcc-slider-track"), rL, qS(rC, "#rate-value"));
        } else if (cfg.ttsEngine === "piper") {
          const sL = {
              0.8: "Slow",
              0.9: "Slightly Slow",
              1: "Normal",
              1.1: "Slightly Fast",
              1.2: "Fast",
            },
            sC = qS(gI, "#speed-slider-container");
          sC.innerHTML = cCS(0.8, 1.2, 0.1, 1, sL, "speed-value");
          iS(qS(sC, ".fcc-slider-track"), sL, qS(sC, "#speed-value"));
        }
        qS(gI, "#back-btn").addEventListener("click", () => sIC(!0));
        qS(gI, "#finish-btn").addEventListener("click", () => {
          console.log("Configuration saved:", cfg);
          alert("Configuration will be saved! (Not yet implemented)");
        });
      }, eLD);
    };
  qS(gI, ".heroui-button").addEventListener("click", () => sIC());
})();
