const holesContainer = document.querySelector(".holes");
const timerDisplay = document.getElementById("timer");
const secLabel = document.getElementById("sec-label");
const scoreDisplay = document.getElementById("score");
const ptsLabel = document.getElementById("pts-label");
const gameOverMsg = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("score-value");
const startBtn = document.getElementById("start-btn");
const startBtnBg = document.getElementById("start-btn-bg");
const darkOverlay = document.getElementById("dark-overlay");
const backBtn = document.getElementById("back-btn");
const shareBtn = document.getElementById("share-btn");
const restartBtn = document.getElementById("restart-btn");

// Selettori per i contatori
const moleCounter = document.querySelector('.mole-counter');
const chuckyCounter = document.querySelector('.chucky-counter');
const eggCounter = document.querySelector('.egg-counter');
const goldenEggCounter = document.querySelector('.golden-egg-counter');

const characters = [
  { type: "mole", value: 0, weight: 50 },
  { type: "chucky", value: -1, weight: 25 },
  { type: "egg", value: -2, weight: 24.9 },
  { type: "golden_egg", value: 0, weight: 0.1 }
];

const hitboxOffsets = {
  mole: [
    { width: 120, height: 128, x: -61, y: 6 },
    { width: 120, height: 128, x: -55, y: -12 },
    { width: 120, height: 128, x: -49, y: 6 },
    { width: 120, height: 128, x: -59, y: 7 },
    { width: 120, height: 128, x: -55, y: -6 },
    { width: 120, height: 128, x: -51, y: 7 },
    { width: 120, height: 128, x: -63, y: 8 },
    { width: 120, height: 128, x: -55, y: -2 },
    { width: 120, height: 128, x: -52, y: 8 },
    { width: 120, height: 128, x: -65, y: 8 },
    { width: 120, height: 128, x: -58, y: -3 },
    { width: 120, height: 128, x: -47, y: 7 }
  ],
  chucky: [
    { width: 130, height: 138, x: -70, y: 12 },
    { width: 130, height: 138, x: -63, y: -6 },
    { width: 130, height: 138, x: -56, y: 12 },
    { width: 130, height: 138, x: -67, y: 12 },
    { width: 130, height: 138, x: -62, y: 1 },
    { width: 130, height: 138, x: -60, y: 12 },
    { width: 130, height: 138, x: -70, y: 14 },
    { width: 130, height: 138, x: -63, y: 3 },
    { width: 130, height: 138, x: -59, y: 13 },
    { width: 130, height: 138, x: -72, y: 14 },
    { width: 130, height: 138, x: -64, y: 5 },
    { width: 130, height: 138, x: -58, y: 13 }
  ],
  egg: [
    { width: 120, height: 120, x: -61, y: 12 },
    { width: 120, height: 120, x: -57, y: -6 },
    { width: 120, height: 120, x: -50, y: 12 },
    { width: 120, height: 120, x: -58, y: 12 },
    { width: 120, height: 120, x: -55, y: 1 },
    { width: 120, height: 120, x: -52, y: 13 },
    { width: 120, height: 120, x: -62, y: 13 },
    { width: 120, height: 120, x: -55, y: 3 },
    { width: 120, height: 120, x: -52, y: 14 },
    { width: 120, height: 120, x: -65, y: 14 },
    { width: 120, height: 120, x: -56, y: 4 },
    { width: 120, height: 120, x: -48, y: 13 }
  ],
  golden_egg: [
    { width: 120, height: 120, x: -61, y: 12 },
    { width: 120, height: 120, x: -57, y: -6 },
    { width: 120, height: 120, x: -50, y: 12 },
    { width: 120, height: 120, x: -58, y: 12 },
    { width: 120, height: 120, x: -55, y: 1 },
    { width: 120, height: 120, x: -52, y: 13 },
    { width: 120, height: 120, x: -62, y: 13 },
    { width: 120, height: 120, x: -55, y: 3 },
    { width: 120, height: 120, x: -52, y: 14 },
    { width: 120, height: 120, x: -65, y: 14 },
    { width: 120, height: 120, x: -56, y: 4 },
    { width: 120, height: 120, x: -48, y: 13 }
  ]
};

let timeLeft = 60;
let score = 0;
let holeCooldowns = Array(12).fill(false);
let gameRunning = false;
let spawnInterval;
let timerInterval;
let spawnSpeed = 1000;
let moleHits = 0;
let chuckyHits = 0;
let eggHits = 0;
let goldenEggHits = 0;
let consecutiveMoleHits = 0;
let pendingTime = 0;
let activeTimePopups = [];
let timeQueue = [];
let pendingScore = 0;
let activeScorePopups = [];
let scoreQueue = [];
let isScorePopupHiding = false;
let popupCounter = 0;
let isGameRunning = false;
const MAX_SPAWN = 4;
const SOFT_SPAWN = 6;

for (let i = 0; i < 12; i++) {
  const hole = document.createElement("div");
  hole.classList.add("hole");
  hole.dataset.index = i;
  holesContainer.appendChild(hole);
}

holesContainer.draggable = false;
holesContainer.addEventListener("dragstart", (e) => e.preventDefault());

// Funzione per condividere su X
function shareOnX() {
  const score = finalScoreDisplay.textContent;
  const text = `Just played Quack-a-Mole and scored ${score} points! come to play and #QuackaMoleWithShaqy on https://shaqytheducky.lol`;
  const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank');
}

// Funzione per aggiornare i contatori nel DOM
function updateCounters() {
  if (moleCounter) moleCounter.textContent = moleHits;
  if (chuckyCounter) chuckyCounter.textContent = chuckyHits;
  if (eggCounter) eggCounter.textContent = eggHits;
  if (goldenEggCounter) goldenEggCounter.textContent = goldenEggHits;
}

function alignSecLabel() {
  if (!timerDisplay || !secLabel) return;
  const timerRect = timerDisplay.getBoundingClientRect();
  const scoreContainerRect = document.querySelector(".score-container")?.getBoundingClientRect();
  if (!scoreContainerRect) return;
  const secWidth = secLabel.getBoundingClientRect().width;
  const timerCenter = (timerRect.left + timerRect.right) / 2 - scoreContainerRect.left;
  secLabel.style.left = `${timerCenter - secWidth / 2}px`;
  secLabel.style.top = '28px';
}

function alignPtsLabel() {
  if (!scoreDisplay || !ptsLabel) return;
  const scoreRect = scoreDisplay.getBoundingClientRect();
  const scoreContainerRect = document.querySelector(".score-container")?.getBoundingClientRect();
  if (!scoreContainerRect) return;
  const ptsWidth = ptsLabel.getBoundingClientRect().width;
  const scoreCenter = (scoreRect.left + scoreRect.right) / 2 - scoreContainerRect.left;
  ptsLabel.style.left = `${scoreCenter - ptsWidth / 2}px`;
  ptsLabel.style.top = '28px';
}

function alignTimePopup(popup) {
  if (!popup || !timerDisplay) return;
  const timerRect = timerDisplay.getBoundingClientRect();
  const scoreContainerRect = document.querySelector(".score-container")?.getBoundingClientRect();
  if (!scoreContainerRect) return;
  const popupWidth = popup.getBoundingClientRect().width;
  const timerCenter = (timerRect.left + timerRect.right) / 2 - scoreContainerRect.left;
  popup.style.left = `${timerCenter - popupWidth / 2}px`;
}

function alignScorePopup(popup) {
  if (!popup || !scoreDisplay) return;
  const scoreRect = scoreDisplay.getBoundingClientRect();
  const scoreContainerRect = document.querySelector(".score-container")?.getBoundingClientRect();
  if (!scoreContainerRect) return;
  const popupWidth = popup.getBoundingClientRect().width;
  const scoreCenter = (scoreRect.left + scoreRect.right) / 2 - scoreContainerRect.left;
  popup.style.left = `${scoreCenter - popupWidth / 2}px`;
}

function pickCharacter() {
  const totalWeight = characters.reduce((sum, char) => sum + char.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const char of characters) {
    if (rand < char.weight) return char;
    rand -= char.weight;
  }
  return characters[characters.length - 1];
}

function updateTimer() {
  if (timerDisplay) timerDisplay.textContent = Math.max(0, Math.floor(timeLeft));
  alignSecLabel();
}

function updateScoreDisplay() {
  if (scoreDisplay) scoreDisplay.textContent = score;
  alignPtsLabel();
}

function createTimePopup(value) {
  const newPopup = document.createElement("div");
  newPopup.classList.add("time-popup");
  newPopup.style.zIndex = 20 + popupCounter++;
  const scoreContainer = document.querySelector(".score-container");
  if (scoreContainer) scoreContainer.appendChild(newPopup);

  const popupData = { element: newPopup, timeout: null };
  activeTimePopups.push(popupData);
  updateTimePopup(value);
}

function updateTimePopup(value) {
  timeQueue.push(value);
  const totalTime = timeQueue.reduce((sum, val) => sum + val, 0);
  const text = `${totalTime > 0 ? "+" : ""}${totalTime} sec`;
  const isNegative = totalTime < 0;

  const latestPopup = activeTimePopups[activeTimePopups.length - 1]?.element;
  if (!latestPopup) return;
  latestPopup.textContent = text;
  latestPopup.classList.remove("positive", "negative", "active", "hide");
  latestPopup.classList.add(isNegative ? "negative" : "positive");
  latestPopup.style.display = "block";

  requestAnimationFrame(() => {
    latestPopup.classList.add("active");
    alignTimePopup(latestPopup);
  });

  clearTimeout(activeTimePopups[activeTimePopups.length - 1].timeout);
  activeTimePopups[activeTimePopups.length - 1].timeout = setTimeout(() => {
    latestPopup.classList.remove("active");
    latestPopup.classList.add("hide");
    setTimeout(() => {
      if (latestPopup.parentNode) {
        latestPopup.parentNode.removeChild(latestPopup);
      }
      activeTimePopups = activeTimePopups.filter(p => p.element !== latestPopup);
      timeQueue = [];
      pendingTime = 0;
    }, 300);
  }, 1000);
}

function showTimePopup(value) {
  if (activeTimePopups.length === 0) {
    createTimePopup(value);
  } else {
    updateTimePopup(value);
  }
}

function createScorePopup(value) {
  const newPopup = document.createElement("div");
  newPopup.classList.add("score-popup");
  newPopup.style.zIndex = 20 + popupCounter++;
  const scoreContainer = document.querySelector(".score-container");
  if (scoreContainer) scoreContainer.appendChild(newPopup);

  const popupData = { element: newPopup, timeout: null };
  activeScorePopups.push(popupData);
  updateScorePopup(value);
}

function updateScorePopup(value) {
  scoreQueue.push(value);
  const totalScore = scoreQueue.reduce((sum, val) => sum + val, 0);
  const text = `${totalScore > 0 ? "+" : ""}${totalScore} pts`;
  const isNegative = totalScore < 0;

  const latestPopup = activeScorePopups[activeScorePopups.length - 1]?.element;
  if (!latestPopup) return;
  latestPopup.textContent = text;
  latestPopup.classList.remove("positive", "negative", "active", "hide");
  latestPopup.classList.add(isNegative ? "negative" : "positive");
  latestPopup.style.display = "block";

  requestAnimationFrame(() => {
    latestPopup.classList.add("active");
    alignScorePopup(latestPopup);
  });

  clearTimeout(activeScorePopups[activeScorePopups.length - 1].timeout);
  activeScorePopups[activeScorePopups.length - 1].timeout = setTimeout(() => {
    latestPopup.classList.remove("active");
    latestPopup.classList.add("hide");
    isScorePopupHiding = true;
    setTimeout(() => {
      if (latestPopup.parentNode) {
        latestPopup.parentNode.removeChild(latestPopup);
      }
      activeScorePopups = activeScorePopups.filter(p => p.element !== latestPopup);
      scoreQueue = [];
      pendingScore = 0;
      isScorePopupHiding = false;
    }, 300);
  }, 1000);
}

function showScorePopup(value) {
  if (activeScorePopups.length === 0) {
    createScorePopup(value);
  } else {
    updateScorePopup(value);
  }
}

function isHoleOccupied(hole) {
  return !!hole.querySelector(".character");
}

function spawnCharacter(holeIndex, isSoft = false) {
  if (holeCooldowns[holeIndex]) return;
  const currentCharacters = document.querySelectorAll(".character").length;
  if (!isSoft && currentCharacters >= MAX_SPAWN) return;
  if (currentCharacters >= SOFT_SPAWN) return;
  const hole = document.querySelectorAll(".hole")[holeIndex];
  if (isHoleOccupied(hole)) return;
  const character = pickCharacter();
  const offsets = hitboxOffsets[character.type];
  const img = document.createElement("img");
  img.src = character.type === "golden_egg" ? `images/egg/${character.type}.png` : `images/${character.type}/${character.type}.png`;
  img.classList.add("character");
  img.dataset.value = character.value;
  img.dataset.hit = "false";
  img.draggable = false;
  img.style.width = `${offsets[holeIndex].width}px`;
  img.style.height = `${offsets[holeIndex].height}px`;
  img.style.left = `calc(50% + ${offsets[holeIndex].x}px)`;
  img.style.bottom = `${offsets[holeIndex].y}px`;
  img.addEventListener("dragstart", (e) => e.preventDefault());
  img.addEventListener("click", () => {
    if (img.dataset.hit === "true" || img.classList.contains("unclickable")) return;
    img.dataset.hit = "true";
    img.src = character.type === "golden_egg" ? `images/egg/hitted_${character.type}.png` : `images/${character.type}/hitted_${character.type}.png`;
    img.classList.add("bonk");
    setTimeout(() => {
      img.classList.add("hide-hit");
      setTimeout(() => {
        if (img.parentNode) {
          hole.removeChild(img);
          holeCooldowns[holeIndex] = true;
          setTimeout(() => (holeCooldowns[holeIndex] = false), 1000);
        }
      }, 300);
    }, 300);
    if (gameRunning) {
      let timeChange = 0;
      let scoreChange = 0;
      if (character.type === "golden_egg") {
        goldenEggHits++;
        timeLeft += 60;
        timeChange = 60;
        consecutiveMoleHits = 0;
      } else if (character.type === "mole") {
        moleHits++;
        consecutiveMoleHits++;
        scoreChange = 1;
        if (consecutiveMoleHits >= 50) {
          timeLeft += 10;
          timeChange = 10;
          consecutiveMoleHits = 0;
        }
      } else if (character.type === "egg") {
        eggHits++;
        timeLeft -= 2;
        timeChange = -2;
        scoreChange = -1;
        consecutiveMoleHits = 0;
      } else if (character.type === "chucky") {
        chuckyHits++;
        timeLeft -= 1;
        timeChange = -1;
        scoreChange = -2;
        consecutiveMoleHits = 0;
      }
      updateCounters();
      if (timeChange !== 0) {
        showTimePopup(timeChange);
        updateTimer();
      }
      if (scoreChange !== 0) {
        showScorePopup(scoreChange);
      }
      let speed = Math.max(0.01, 1 + 0.05 * moleHits - 0.1 * eggHits);
      spawnSpeed = Math.min(2000, 1000 / speed);
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnCycle, spawnSpeed);
      if (character.type === "mole") {
        score += 1;
      } else if (character.type === "chucky") {
        score -= 2;
      } else if (character.type === "egg") {
        score -= 1;
      }
      updateScoreDisplay();
      setTimeout(() => spawnAfterHit(holeIndex), 200);
    }
  });
  hole.appendChild(img);
  const lifeDuration = 1200 + Math.random() * 400;
  setTimeout(() => {
    if (img.dataset.hit === "false" && img.parentNode) {
      img.classList.add("hide");
      setTimeout(() => {
        img.classList.add("unclickable");
      }, 100);
      setTimeout(() => {
        if (img.parentNode) {
          hole.removeChild(img);
          holeCooldowns[holeIndex] = true;
          setTimeout(() => (holeCooldowns[holeIndex] = false), 1000);
        }
      }, 300);
    }
  }, lifeDuration);
  holeCooldowns[holeIndex] = true;
  setTimeout(() => (holeCooldowns[holeIndex] = false), 1000);
}

function spawnAfterHit(holeIndex) {
  if (!gameRunning) return;
  const availableHoles = Array.from(document.querySelectorAll(".hole"))
    .map((_, idx) => idx)
    .filter(idx => !holeCooldowns[idx] && !isHoleOccupied(document.querySelectorAll(".hole")[idx]));
  if (availableHoles.length === 0) return;
  const numToSpawn = Math.floor(Math.random() * 2) + 1;
  const holesToSpawn = availableHoles.sort(() => Math.random() - 0.5).slice(0, Math.min(numToSpawn, availableHoles.length));
  holesToSpawn.forEach(idx => spawnCharacter(idx, true));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function spawnCycle() {
  if (!gameRunning) return;
  const availableHoles = Array.from(document.querySelectorAll(".hole"))
    .map((_, idx) => idx)
    .filter(idx => !holeCooldowns[idx] && !isHoleOccupied(document.querySelectorAll(".hole")[idx]));
  shuffleArray(availableHoles);
  for (const idx of availableHoles.slice(0, MAX_SPAWN - document.querySelectorAll(".character").length)) {
    spawnCharacter(idx);
  }
}

function resetGame() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  activeTimePopups.forEach(p => clearTimeout(p.timeout));
  activeScorePopups.forEach(p => clearTimeout(p.timeout));
  document.querySelectorAll(".character").forEach(char => char.parentNode?.removeChild(char));
  document.querySelectorAll(".time-popup, .score-popup").forEach(popup => popup.parentNode?.removeChild(popup));
  holeCooldowns.fill(false);
  timeLeft = 60;
  score = 0;
  spawnSpeed = 1000;
  moleHits = 0;
  chuckyHits = 0;
  eggHits = 0;
  goldenEggHits = 0;
  consecutiveMoleHits = 0;
  pendingTime = 0;
  activeTimePopups = [];
  timeQueue = [];
  pendingScore = 0;
  activeScorePopups = [];
  scoreQueue = [];
  isScorePopupHiding = false;
  popupCounter = 0;
  gameRunning = false;
  isGameRunning = false;
  if (gameOverMsg) gameOverMsg.style.display = "none";
  if (gameOverMsg) gameOverMsg.classList.remove("pop-in");
  if (darkOverlay) darkOverlay.style.display = "none";
  if (darkOverlay) darkOverlay.classList.remove("fade-in");
  if (startBtn) startBtn.classList.remove("highlighted");
  if (startBtnBg) startBtnBg.classList.remove("active");
  if (finalScoreDisplay) finalScoreDisplay.textContent = "0";
  if (startBtn) startBtn.disabled = false;
  if (restartBtn) restartBtn.disabled = false; // Abilita il pulsante all'inizio della partita
  updateTimer();
  updateScoreDisplay();
  updateCounters();
}

function backToGame() {
  if (gameOverMsg) gameOverMsg.style.display = "none";
  if (gameOverMsg) gameOverMsg.classList.remove("pop-in");
  if (darkOverlay) darkOverlay.style.display = "none";
  if (darkOverlay) darkOverlay.classList.remove("fade-in");
  if (startBtn) startBtn.classList.remove("highlighted");
  if (startBtnBg) startBtnBg.classList.add("active");
  if (startBtn) startBtn.disabled = false;
  if (restartBtn) restartBtn.disabled = true; // Disabilita il pulsante quando si torna alla schermata iniziale
}

function startGame() {
  if (isGameRunning) return;
  isGameRunning = true;
  setTimeout(() => {
    resetGame();
    gameRunning = true;
    updateTimer();
    updateScoreDisplay();
    alignSecLabel();
    alignPtsLabel();
    if (startBtn) startBtn.disabled = true;
    spawnCycle();
    spawnInterval = setInterval(spawnCycle, spawnSpeed);
    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        clearInterval(spawnInterval);
        document.querySelectorAll(".character").forEach(char => {
          if (!char.classList.contains("hide") && !char.classList.contains("hide-hit")) {
            char.classList.add(char.dataset.hit === "true" ? "hide-hit" : "hide");
            char.classList.add("unclickable");
            setTimeout(() => {
              if (char.parentNode) {
                char.parentNode.removeChild(char);
              }
            }, 300);
          }
        });
        activeTimePopups.forEach(p => {
          clearTimeout(p.timeout);
          const popup = p.element;
          if (popup.parentNode) {
            popup.classList.remove("active");
            popup.classList.add("hide");
            setTimeout(() => {
              if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
              }
            }, 300);
          }
        });
        activeScorePopups.forEach(p => {
          clearTimeout(p.timeout);
          const popup = p.element;
          if (popup.parentNode) {
            popup.classList.remove("active");
            popup.classList.add("hide");
            setTimeout(() => {
              if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
              }
            }, 300);
          }
        });
        activeTimePopups = [];
        activeScorePopups = [];
        isScorePopupHiding = false;
        gameRunning = false;
        isGameRunning = false;
        if (finalScoreDisplay) finalScoreDisplay.textContent = `${score}`;
        if (darkOverlay) darkOverlay.style.display = "block";
        if (darkOverlay) darkOverlay.classList.add("fade-in");
        if (restartBtn) restartBtn.disabled = true; // Disabilita il pulsante alla fine del gioco
        setTimeout(() => {
          if (gameOverMsg) gameOverMsg.style.display = "block";
          if (gameOverMsg) gameOverMsg.classList.add("pop-in");
          if (startBtn) startBtn.classList.add("highlighted");
          if (startBtnBg) startBtnBg.classList.add("active");
        }, 100);
        if (startBtn) startBtn.disabled = false;
        return;
      }
      timeLeft -= 1;
      updateTimer();
    }, 1000);
  }, 100); // Ritardo di 100ms
}

if (startBtn) startBtn.addEventListener("click", startGame);
if (backBtn) backBtn.addEventListener("click", backToGame);
if (shareBtn) shareBtn.addEventListener("click", shareOnX);
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    if (!isGameRunning) return; // Il pulsante funziona solo se la partita è in corso
    setTimeout(() => {
      startGame();
    }, 100); // Ritardo di 100ms
  });
}

window.addEventListener("load", () => {
  alignSecLabel();
  alignPtsLabel();
  updateCounters();
  if (restartBtn) restartBtn.disabled = true; // Disabilita il pulsante all'avvio della pagina
});