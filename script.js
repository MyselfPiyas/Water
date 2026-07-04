(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

 
  const waveformEl = document.getElementById("waveform");
  const acousticReadingEl = document.getElementById("acoustic-reading");
  const thermalBandEl = document.getElementById("thermal-band");
  const leakPointEl = document.getElementById("leak-point");
  const leakRingsEl = document.getElementById("leak-rings");

  let heroT = 0;
  let heroLeakBoost = 0;

  function buildWaveformPoints(t, amplitudeBoost) {
    const points = [];
    const baseX = 40;
    const width = 340;
    const midY = 240;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = baseX + (width * i) / steps;
      const noise = Math.sin(i * 0.9 + t * 2.2) * 3 + Math.sin(i * 0.35 + t) * 2;
      const spike =
        amplitudeBoost > 0.01 && i > steps * 0.5 && i < steps * 0.62
          ? Math.sin((i - steps * 0.5) * 1.4) * 22 * amplitudeBoost
          : 0;
      const y = midY + noise * (0.4 + amplitudeBoost) + spike;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(" ");
  }

  function heroTick() {
    heroT += 0.035;
    if (waveformEl) {
      waveformEl.setAttribute("points", buildWaveformPoints(heroT, heroLeakBoost));
    }
    if (acousticReadingEl) {
      const amp = 0.12 + heroLeakBoost * 0.55 + Math.sin(heroT * 3) * 0.01;
      acousticReadingEl.textContent = `amplitude ${amp.toFixed(2)}`;
    }
    if (thermalBandEl) {
      const width = 90 + heroLeakBoost * 40;
      const x = 220 - heroLeakBoost * 20;
      thermalBandEl.setAttribute("width", width.toFixed(0));
      thermalBandEl.setAttribute("x", x.toFixed(0));
      thermalBandEl.setAttribute("opacity", (0.55 + heroLeakBoost * 0.45).toFixed(2));
    }
    if (leakRingsEl) {
      leakRingsEl.setAttribute("opacity", heroLeakBoost > 0.15 ? "1" : "0");
    }
    if (leakPointEl) {
      leakPointEl.setAttribute("r", (4 + heroLeakBoost * 3).toFixed(1));
    }
    requestAnimationFrame(heroTick);
  }

  if (waveformEl && !prefersReducedMotion) {
    requestAnimationFrame(heroTick);
  } else if (waveformEl) {
   
    waveformEl.setAttribute("points", buildWaveformPoints(0, 0));
  }

  
  const canvas = document.getElementById("wave-canvas");
  const acousticValueEl = document.getElementById("acoustic-value");
  const thermalValueEl = document.getElementById("thermal-value");
  const acousticBarEl = document.getElementById("acoustic-bar");
  const thermalBarEl = document.getElementById("thermal-bar");
  const statusPillEl = document.getElementById("status-pill");
  const triggerBtn = document.getElementById("trigger-leak");
  const resetBtn = document.getElementById("reset-leak");
  const logLineEl = document.getElementById("log-line");

  let leakActive = false;
  let leakProgress = 0; 
  let alertLogged = false;

  function setLog(message) {
    if (logLineEl) logLineEl.textContent = `> ${message}`;
  }

  function drawWaveform() {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.strokeStyle = leakProgress > 0.15 ? "#FF5D5D" : "#4FD9D0";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const points = 220;
    for (let i = 0; i <= points; i++) {
      const x = (w * i) / points;
      const noise =
        Math.sin(i * 0.15 + dashT * 2.4) * 8 +
        Math.sin(i * 0.05 + dashT * 1.1) * 5;
      const spikeZone = i > points * 0.55 && i < points * 0.72;
      const spike = spikeZone ? Math.sin((i - points * 0.55) * 2.1) * 46 * leakProgress : 0;
      const y = h / 2 + noise * (0.5 + leakProgress * 0.6) + spike;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function dashboardTick() {
    dashT += 0.045;

    
    const target = leakActive ? 1 : 0;
    leakProgress += (target - leakProgress) * 0.04;
    if (leakProgress < 0.001) leakProgress = 0;

    heroLeakBoost = leakProgress; 

    const acousticAmp = 0.12 + leakProgress * 0.68 + Math.sin(dashT * 3) * 0.008;
    const thermalDelta = 0.03 + leakProgress * 2.3 + Math.sin(dashT * 1.6) * 0.01;

    if (acousticValueEl) acousticValueEl.textContent = acousticAmp.toFixed(2);
    if (thermalValueEl) thermalValueEl.textContent = `${thermalDelta.toFixed(2)}`;
    if (acousticBarEl) acousticBarEl.style.width = `${Math.min(100, (acousticAmp / 0.9) * 100)}%`;
    if (thermalBarEl) thermalBarEl.style.width = `${Math.min(100, (thermalDelta / 2.6) * 100)}%`;

    if (acousticBarEl) acousticBarEl.style.background = leakProgress > 0.5 ? "#FF5D5D" : "#4FD9D0";
    if (thermalBarEl) thermalBarEl.style.background = leakProgress > 0.5 ? "#FF5D5D" : "#E8A33D";

    if (statusPillEl) {
      if (leakProgress > 0.6) {
        statusPillEl.textContent = "Leak suspected";
        statusPillEl.classList.add("is-alert");
        if (!alertLogged) {
          setLog("both channels deviated at joint J-14 — alert dispatched to maintenance queue");
          alertLogged = true;
        }
      } else if (leakProgress > 0.15) {
        statusPillEl.textContent = "Monitoring deviation";
        statusPillEl.classList.remove("is-alert");
      } else {
        statusPillEl.textContent = "Nominal";
        statusPillEl.classList.remove("is-alert");
        alertLogged = false;
      }
    }

    drawWaveform();
    requestAnimationFrame(dashboardTick);
  }

  if (canvas) {
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(300, rect.width) * 2;
      canvas.height = 140 * 2;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(dashboardTick);
  }

  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => {
      leakActive = true;
      setLog("synthetic leak injected — watching for cross-channel agreement...");
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      leakActive = false;
      setLog("system reset — both channels returning to nominal");
    });
  }

 
  const contactForm = document.getElementById("contact-form");
  const formNoteEl = document.getElementById("form-note");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        if (formNoteEl) {
          formNoteEl.textContent = "Please fill in your name and a valid email before sending.";
          formNoteEl.style.color = "#FF5D5D";
        }
        return;
      }
      const name = document.getElementById("name").value.trim();
      if (formNoteEl) {
        formNoteEl.style.color = "#4FD9D0";
        formNoteEl.textContent = `Thanks, ${name}. A surveyor will reach out within two working days.`;
      }
      contactForm.reset();
    });
  }
})();
