let timer;
let timeLeft = 25 * 60;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTimer") {
        startTimer(message.timeLeft);
    } else if (message.action === "stopTimer") {
        stopTimer();
    } else if (message.action === "updateTimeLeft") {
        timeLeft = message.timeLeft;
    }
});

function startTimer(initialTime) {
    timeLeft = initialTime || timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        chrome.runtime.sendMessage({ action: "tick", timeLeft: timeLeft });
        if (timeLeft === 0) {
            clearInterval(timer);
            showNotification();
            chrome.runtime.sendMessage({ action: "timerEnded" });
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function showNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Pomodoro Timer',
        message: 'Time is up! Take a break or start a new session.'
    });
}