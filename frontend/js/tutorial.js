
const steps = [
  {
    title: "Welcome to BiteNow 🍔",
    text: "Let’s learn how to order food easily.",
    highlight: null
  },
  {
    title: "Browse Menu",
    text: "Go to Menu and choose your favorite food.",
    highlight: "a[href='menu.html']"
  },
  {
    title: "Your Cart 🛒",
    text: "Add items and manage your order here.",
    highlight: "a[href='cart.html']"
  },
  {
    title: "Profile 👤",
    text: "See your info, phone, and location.",
    highlight: "a[href='profile.html']"
  }
];

let currentStep = 0;

// ── START ───────────────────────────────
function startTutorial() {
  document.getElementById("tutorial-box").classList.remove("hidden");
  document.getElementById("tutorial-overlay").classList.remove("hidden");
  showStep();
}

// ── SHOW STEP ───────────────────────────
function showStep() {
  const step = steps[currentStep];

  document.getElementById("tutorial-title").innerText = step.title;
  document.getElementById("tutorial-text").innerText = step.text;

  document.querySelectorAll(".spotlight").forEach(e => {
    e.classList.remove("spotlight");
  });

  if (step.highlight) {
    const el = document.querySelector(step.highlight);
    if (el) el.classList.add("spotlight");
  }
}

// ── NEXT STEP ───────────────────────────
function nextStep() {
  currentStep++;

  if (currentStep >= steps.length) {
    closeTutorial();
    return;
  }

  showStep();
}

// ── CLOSE ───────────────────────────────
function closeTutorial() {
  document.getElementById("tutorial-box").classList.add("hidden");
  document.getElementById("tutorial-overlay").classList.add("hidden");

  document.querySelectorAll(".spotlight").forEach(e => {
    e.classList.remove("spotlight");
  });
}

// ── AUTO START (FIRST TIME ONLY) ────────
window.addEventListener("load", () => {
  if (!localStorage.getItem("tutorial_seen")) {
    setTimeout(() => {
      startTutorial();
      localStorage.setItem("tutorial_seen", "true");
    }, 500);
  }
});