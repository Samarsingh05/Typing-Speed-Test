let testStarted = false;
const typingText = document.querySelector(".typing-text p"),
inpField = document.querySelector(".wrapper .input-field"),
tryAgainBtn = document.querySelector(".content button"),
timeTag = document.querySelector(".time span b"),
mistakeTag = document.querySelector(".mistake span"),
wpmTag = document.querySelector(".wpm span"),
cpmTag = document.querySelector(".cpm span"),
startTestBtn = document.getElementById("start-test"),
progressBar = document.querySelector(".progress"),
resultsModal = document.querySelector(".results-modal"),
resultWpm = document.getElementById("result-wpm"),
resultCpm = document.getElementById("result-cpm"),
resultMistakes = document.getElementById("result-mistakes"),
highScoreSpan = document.getElementById("high-score"),
tryAgainModalBtn = document.getElementById("try-again"),
darkModeToggle = document.getElementById("dark-mode-toggle"),
difficultyBtns = document.querySelectorAll(".difficulty-btn"),
restartTestBtn = document.getElementById("restart-test");

let timer,
maxTime = 60,
timeLeft = maxTime,
charIndex = mistakes = isTyping = 0,
countdownTimer,
currentDifficulty = "easy",
highScores = JSON.parse(localStorage.getItem("highScores")) || {easy: 0, medium: 0, hard: 0};

const difficulties = {
    easy: {time: 60, paragraphs: paragraphs.filter(p => p.split(' ').length > 50 && p.split(' ').length <= 100)},
    medium: {time: 45, paragraphs: paragraphs.filter(p => p.split(' ').length > 50 && p.split(' ').length <= 100)},
    hard: {time: 60, paragraphs: paragraphs.filter(p => p.split(' ').length > 100)}
};

function loadParagraph() {
    const paragraphList = difficulties[currentDifficulty].paragraphs;
    const ranIndex = Math.floor(Math.random() * paragraphList.length);
    typingText.innerHTML = "";
    paragraphList[ranIndex].split("").forEach(char => {
        let span = `<span>${char}</span>`
        typingText.innerHTML += span;
    });
    typingText.querySelectorAll("span")[0].classList.add("active");
    document.addEventListener("keydown", () => inpField.focus());
    typingText.addEventListener("click", () => inpField.focus());
    highlightCurrentWord();
}

function initTyping() {

    if (!testStarted) return;

    let characters = typingText.querySelectorAll("span");
    let typedChar = inpField.value.split("")[charIndex];
    if(charIndex < characters.length - 1 && timeLeft > 0) {
        if(!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }
        if(typedChar == null) {
            if(charIndex > 0) {
                charIndex--;
                if(characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                }
                characters[charIndex].classList.remove("correct", "incorrect");
            }
        } else {
            if(characters[charIndex].innerText == typedChar) {
                characters[charIndex].classList.add("correct");
            } else {
                mistakes++;
                characters[charIndex].classList.add("incorrect");
            }
            charIndex++;
        }
        characters.forEach(span => span.classList.remove("active"));
        characters[charIndex].classList.add("active");

        let wpm = Math.round(((charIndex - mistakes)  / 5) / (maxTime - timeLeft) * 60);
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        
        wpmTag.innerText = wpm;
        mistakeTag.innerText = mistakes;
        cpmTag.innerText = charIndex - mistakes;

        let progress = ((maxTime - timeLeft) / maxTime) * 100;
        progressBar.style.width = `${progress}%`;

        highlightCurrentWord();
    } else {
        clearInterval(timer);
        inpField.value = "";
        showResults();
    }   
}

function initTimer() {
    if(timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft;
        let wpm = Math.round(((charIndex - mistakes)  / 5) / (maxTime - timeLeft) * 60);
        wpmTag.innerText = wpm;
    } else {
        clearInterval(timer);
        showResults();
    }
}

function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = isTyping = 0;
    inpField.value = "";
    timeTag.innerText = timeLeft;
    wpmTag.innerText = 0;
    mistakeTag.innerText = 0;
    cpmTag.innerText = 0;
    progressBar.style.width = "0%";
    startTestBtn.style.display = "inline-block";
    restartTestBtn.style.display = "none";
    testStarted = false;
}

function startCountdown() {
    let countdown = 3;
    typingText.innerHTML = `<h2>Starting in ${countdown}</h2>`;
    countdownTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            typingText.innerHTML = `<h2>Starting in ${countdown}</h2>`;
        } else {
            clearInterval(countdownTimer);
            resetGame();
            inpField.focus();
            startTestBtn.style.display = "none";
            restartTestBtn.style.display = "inline-block";
            testStarted = true;  
        }
    }, 1000);
}

function showResults() {
    const wpm = parseInt(wpmTag.textContent);
    const cpm = parseInt(cpmTag.textContent);
    const accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);

    resultsModal.style.display = "block";
    resultsModal.innerHTML = `
        <div class="modal-content">
            <h2>Test Results</h2>
            <div class="result-stats">
                <div class="stat">
                    <h3>${wpm}</h3>
                    <p>WPM</p>
                </div>
                <div class="stat">
                    <h3>${cpm}</h3>
                    <p>CPM</p>
                </div>
                <div class="stat">
                    <h3>${accuracy}%</h3>
                    <p>Accuracy</p>
                </div>
                <div class="stat">
                    <h3>${mistakes}</h3>
                    <p>Mistakes</p>
                </div>
            </div>
            <div class="high-score">
                <h3>High Score: <span id="high-score">${highScores[currentDifficulty]}</span> WPM</h3>
                <p>(${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} difficulty)</p>
            </div>
            ${wpm > highScores[currentDifficulty] ? '<p class="new-record">New Record!</p>' : ''}
            <button id="try-again">Try Again</button>
        </div>
    `;

    if (wpm > highScores[currentDifficulty]) {
        highScores[currentDifficulty] = wpm;
        localStorage.setItem("highScores", JSON.stringify(highScores));
    }

    document.getElementById("try-again").addEventListener("click", () => {
        resultsModal.style.display = "none";
        resetGame();
    });
}

function highlightCurrentWord() {
    const words = typingText.querySelectorAll("span");
    let currentWordStart = 0;
    let currentWordEnd = 0;

    for (let i = 0; i < words.length; i++) {
        if (words[i].classList.contains("active")) {
            currentWordStart = i;
            while (i < words.length && words[i].innerText !== " ") {
                i++;
            }
            currentWordEnd = i;
            break;
        }
    }

    words.forEach(span => span.classList.remove("highlight"));
    for (let i = currentWordStart; i < currentWordEnd; i++) {
        words[i].classList.add("highlight");
    }
}
inpField.addEventListener("input", (e) => {
    if (!testStarted) {
        e.preventDefault();
        inpField.value = "";
        return;
    }
    initTyping();
});
document.addEventListener('DOMContentLoaded', function() {
    loadParagraph();
    
    startTestBtn.addEventListener("click", () => {
        startCountdown();
    });

    inpField.addEventListener("input", initTyping);
    tryAgainBtn.addEventListener("click", resetGame);
    
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            difficultyBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentDifficulty = btn.dataset.difficulty;
            maxTime = difficulties[currentDifficulty].time;
            resetGame();
        });
    });

    restartTestBtn.addEventListener("click", () => {
        clearInterval(timer);
        resetGame();
    });
});
loadParagraph();