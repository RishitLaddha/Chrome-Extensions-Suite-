document.addEventListener("DOMContentLoaded", () => {
    const timeInput = document.getElementById("timeInput");
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const timeDisplay = document.getElementById("timeDisplay");
  
    let timerInterval = null;
  
    // Update the countdown display (mm:ss format)
    function updateDisplay(remainingSeconds) {
      let minutes = Math.floor(remainingSeconds / 60);
      let seconds = remainingSeconds % 60;
      timeDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`;
    }
  
    // Pad a number with leading zeros to 2 digits
    function pad(num) {
      return num.toString().padStart(2, '0');
    }
  
    // Check if there is an active timer by reading finishTime from storage
    function checkActiveTimer() {
      chrome.storage.local.get("finishTime", (result) => {
        if (result.finishTime) {
          let finishTime = result.finishTime;
          let currentTime = Date.now();
          let remainingTime = Math.round((finishTime - currentTime) / 1000);
  
          if (remainingTime > 0) {
            updateDisplay(remainingTime);
            // Start an interval to update the display every second
            if (!timerInterval) {
              timerInterval = setInterval(() => {
                chrome.storage.local.get("finishTime", (res) => {
                  if (res.finishTime) {
                    let remain = Math.round((res.finishTime - Date.now()) / 1000);
                    if (remain <= 0) {
                      clearInterval(timerInterval);
                      timerInterval = null;
                      updateDisplay(0);
                    } else {
                      updateDisplay(remain);
                    }
                  }
                });
              }, 1000);
            }
  
            startButton.style.display = "none";
            stopButton.style.display = "block";
            timeInput.disabled = true;
  
          } else {
            // Timer must have expired
            chrome.storage.local.remove("finishTime");
            updateDisplay(0);
            startButton.style.display = "block";
            stopButton.style.display = "none";
            timeInput.disabled = false;
            if (timerInterval) {
              clearInterval(timerInterval);
              timerInterval = null;
            }
          }
        } else {
          // No timer running
          updateDisplay(0);
          startButton.style.display = "block";
          stopButton.style.display = "none";
          timeInput.disabled = false;
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
        }
      });
    }
  
    // On popup load, check if a timer is active
    checkActiveTimer();
  
    // Start Timer -> send message to background
    startButton.addEventListener("click", () => {
      const inputSeconds = parseInt(timeInput.value, 10);
      if (isNaN(inputSeconds) || inputSeconds <= 0) {
        alert("Please enter a valid positive number of seconds.");
        return;
      }
  
      chrome.runtime.sendMessage({ action: "startTimer", seconds: inputSeconds }, (response) => {
        console.log(response.status);
        checkActiveTimer();
      });
    });
  
    // Stop Timer -> send message to background
    stopButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "stopTimer" }, (response) => {
        console.log(response.status);
        checkActiveTimer();
      });
    });
  });
  