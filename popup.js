let timeLeft = 25 * 60;
let isRunning = false;
let isWorkTime = true;
let sessionCount = 0;

const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const longBreakTimeInput = document.getElementById('longBreakTime');
const sessionsBeforeLongBreakInput = document.getElementById('sessionsBeforeLongBreak');
const snoozeButton = document.getElementById('snooze');
const snoozeTimeInput = document.getElementById('snoozeTime');

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        chrome.runtime.sendMessage({ action: "startTimer", timeLeft: timeLeft });
        startButton.textContent = "Pause";
    } else {
        isRunning = false;
        chrome.runtime.sendMessage({ action: "stopTimer" });
        startButton.textContent = "Resume";
    }
}

function stopTimer() {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    isRunning = false;
    startButton.textContent = "Start";
}

function resetTimer() {
    stopTimer();
    isWorkTime = true;
    sessionCount = 0;
    setTimeLeft(workTimeInput.value * 60);
    updateTimer();
}

function setTimeLeft(seconds) {
    timeLeft = seconds;
    chrome.runtime.sendMessage({ action: "updateTimeLeft", timeLeft: timeLeft });
}

startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);


[workTimeInput, breakTimeInput, longBreakTimeInput, sessionsBeforeLongBreakInput, snoozeTimeInput].forEach(input => {
    input.addEventListener('change', () => {
      chrome.storage.sync.set({
        workTime: workTimeInput.value,
        breakTime: breakTimeInput.value,
        longBreakTime: longBreakTimeInput.value,
        sessionsBeforeLongBreak: sessionsBeforeLongBreakInput.value,
        snoozeTime: snoozeTimeInput.value
      });
      if (!isRunning) {
        setTimeLeft(workTimeInput.value * 60);
        updateTimer();
      }
    });
  });
  
  function snooze() {
    const snoozeTime = parseInt(snoozeTimeInput.value) * 60;
    setTimeLeft(snoozeTime);
    updateTimer();
    startTimer();
  }
  
  snoozeButton.addEventListener('click', snooze);

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "tick") {
        timeLeft = message.timeLeft;
        updateTimer();
    } else if (message.action === "timerEnded") {
        isRunning = false;
        startButton.textContent = "Start";
        if (isWorkTime) {
            sessionCount++;
            isWorkTime = false;
            if (sessionCount % sessionsBeforeLongBreakInput.value === 0) {
                setTimeLeft(longBreakTimeInput.value * 60);
            } else {
                setTimeLeft(breakTimeInput.value * 60);
            }
        } else {
            isWorkTime = true;
            setTimeLeft(workTimeInput.value * 60);
        }
        updateTimer();
    }
});



chrome.storage.sync.get(['workTime', 'breakTime', 'longBreakTime', 'sessionsBeforeLongBreak', 'snoozeTime'], (result) => {
    workTimeInput.value = result.workTime || 25;
    breakTimeInput.value = result.breakTime || 5;
    longBreakTimeInput.value = result.longBreakTime || 15;
    sessionsBeforeLongBreakInput.value = result.sessionsBeforeLongBreak || 4;
    snoozeTimeInput.value = result.snoozeTime || 5;
    setTimeLeft(workTimeInput.value * 60);
    updateTimer();
  });