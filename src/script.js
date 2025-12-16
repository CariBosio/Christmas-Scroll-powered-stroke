import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

// --- START SETUP LENIS, SCROLL AND ANIMATIONS ---
document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 500);
  });
  gsap.ticker.lagSmoothing(0);

  // 1. PATH LOGIC (Line that is drawn)
  const path = document.getElementById("mask-path");
  if (path) {
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".spotlight",
        start: "top 25%",
        end: "bottom bottom",
        scrub: true,
      },
    });
  }

  // 2. SPLITTEXT LOGIC (Titles and Buttons)
  const titleEl = document.getElementById("titleRef");

  if (titleEl) {
    const h1 = titleEl.querySelector("h1");
    if (h1) {
      const splitText = new SplitText(h1, { type: "words" });
      gsap.from(splitText.words, {
        duration: 3,
        y: 10,
        stagger: 0.1,
        autoAlpha: 0,
        filter: "blur(10px)",
        ease: "power2.out",
      });
    }
  }
});

// 3. MUSIC LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("christmas-audio");
  const btn = document.getElementById("music-btn");

  if (!btn || !audio) return;

  const iconPlay = btn.querySelector(".icon-play");
  const iconPause = btn.querySelector(".icon-pause");

  let audioContext, analyser, source;
  let isAudioContextSetup = false;
  let animationFrameId;

  function setupAudioContext() {
    if (isAudioContextSetup) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    isAudioContextSetup = true;
  }

  function visualize() {
    if (!analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    const bassFrequencies = 20;
    for (let i = 0; i < bassFrequencies; i++) {
      sum += dataArray[i];
    }
    const average = sum / bassFrequencies;
    const scale = 0.5 + average / 300;

    gsap.set(btn, {
      scale: scale,
      backgroundColor: average > 150 ? "#ff2f32" : "#D42426",
    });
    animationFrameId = requestAnimationFrame(visualize);
  }

  btn.addEventListener("click", () => {
    if (!isAudioContextSetup) setupAudioContext();
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (audio.paused) {
      audio.play();
      iconPlay.style.display = "none";
      iconPause.style.display = "block";
      visualize();
    } else {
      audio.pause();
      iconPlay.style.display = "block";
      iconPause.style.display = "none";
      btn.style.backgroundColor = "#D42426";
      cancelAnimationFrame(animationFrameId);
      gsap.to(btn, { scale: 1, duration: 0.3 });
    }
  });
});

// 4. CONFETTI LOGIC
function confetti() {
  const confettiContainer = document.querySelector(".quiz-confetti");
  if (!confettiContainer) return;

  gsap.set(confettiContainer, { display: "block" });

  const w = confettiContainer.offsetWidth;
  const h = confettiContainer.offsetHeight;
  const total = 100;

  gsap.to(confettiContainer, { autoAlpha: 1, duration: 2, delay: 1 });

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function animm(elm, height) {
    gsap.to(elm, {
      y: height + 100,
      duration: random(4, 9),
      ease: "none",
      repeat: -1,
      delay: -5,
    });
    gsap.to(elm, {
      x: "+=100",
      duration: random(1, 6),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(elm, {
      rotation: random(0, 360),
      scaleX: 0.2,
      duration: random(1, 6),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    confettiContainer.appendChild(dot);

    gsap.set(dot, {
      x: random(0, w),
      y: random(-200, -50),
      opacity: 1,
      scale: random(0.5, 1.5),
      backgroundColor: "hsl(" + random(0, 360) + ", 50%, 50%)",
    });
    animm(dot, h);
  }
}
confetti();

// 5. LOTTIE 3 LOGIC (With ScrollTrigger)
const treePlayer = document.getElementById("lottie-tree");

if (treePlayer) {
  treePlayer.addEventListener("ready", () => {
    ScrollTrigger.create({
      trigger: ".outro",
      start: "center 80%",
      end: "bottom top",
      onEnter: () => {
        try {
          treePlayer.play();
        } catch (e) {}
      },
      onLeave: () => {
        try {
          treePlayer.pause();
        } catch (e) {}
      },
      onEnterBack: () => {
        try {
          treePlayer.play();
        } catch (e) {}
      },
      onLeaveBack: () => {
        try {
          treePlayer.pause();
        } catch (e) {}
      },
    });
  });
}

const mySplitText = new SplitText(".split", { type: "chars" });
let chars = mySplitText.chars;

gsap.from(chars, {
  yPercent: 130,
  stagger: 0.02,
  ease: "back.out",
  duration: 1,
  scrollTrigger: {
    trigger: ".split",
    start: "top 80%",
  },
});

// 6. REINDEER LOGIC (With ScrollTrigger and Timeline)
const reindeerImg = document.getElementById("reindeer-img");
const noseLight = document.querySelector(".light-nose");

if (reindeerImg && noseLight) {
  // A. INITIAL STATES (Everything off and invisible)
  gsap.set(reindeerImg, { opacity: 0, y: 50 });
  gsap.set(noseLight, {
    opacity: 0, 
    backgroundColor: "rgb(150, 0, 0)",
    boxShadow: "none",
  });

  // B. CREATE THE TIMELINE
  const reindeerTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".spotlight",
      start: "top 80%",
      end: "top 20%",
      toggleActions: "play none none reset",
    },
  });

  // --- ANIMATION SEQUENCE ---

  // STEP 1: Deer entry (Duration: 1s)
  reindeerTl.to(reindeerImg, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out",
  });

  // STEP 2: Soft nose ignition (Duration: 0.3s)
  // This occurs immediately after Step 1 ends.
  // The nose goes from opacity: 0 (initial state) to opacity: 0.6 smoothly.
  reindeerTl.to(noseLight, {
    opacity: 0.6,
    backgroundColor: "rgb(120, 0, 0)",
    duration: 0.3, 
    ease: "sine.in",
  });

  // STEP 3: Infinite blink loop
  // Starts immediately after Step 2.
  // Since we're already at opacity: 0.6, we only need a .to() to the bright state.
  reindeerTl.to(noseLight, {
      opacity: 0.9, 
      backgroundColor: "rgb(255, 0, 0)",
      boxShadow: "0 0 30px 15px rgba(255, 30, 30, 0.8)",
      duration: 0.8,
      ease: "sine.inOut",
      repeat: -1, 
      yoyo: true, 
    }
      );
}

// 7. SCROLL INDICATOR LOGIC (With ScrollTrigger)
const scrollIndicatorIcon = document.querySelector(".scroll-indicator img");

if (scrollIndicatorIcon) {
  gsap.fromTo(
    scrollIndicatorIcon,
    {
      //Initial state (0% and 100% in CSS)
      y: 0,
      scale: 0.9,
      opacity: 0.8,
    },
    {
      // Intermediate state (50% in CSS)
      y: -5,
      scale: 1,
      opacity: 1,

      // Animation configuration
      duration: 1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    }
  );

  gsap.to(".scroll-indicator", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "20% top",
      scrub: true,
    },
  });
}
