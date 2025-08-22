// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTimer") {
      const seconds = message.seconds;
      const delayInMinutes = seconds / 60;
  
      // Calculate finish time
      const finishTime = Date.now() + seconds * 1000;
  
      // Store finishTime so popup can display countdown
      chrome.storage.local.set({ finishTime }, () => {
        // Create an alarm that fires in 'delayInMinutes'
        chrome.alarms.create("countdownAlarm", { delayInMinutes });
        sendResponse({ status: "timer started", finishTime });
      });
  
      // Return true indicates we'll send a response asynchronously
      return true;
    }
    else if (message.action === "stopTimer") {
      // Clear alarm
      chrome.alarms.clear("countdownAlarm", () => {
        // Remove the saved finishTime
        chrome.storage.local.remove("finishTime", () => {
          sendResponse({ status: "timer stopped" });
        });
      });
  
      return true; // asynchronous response
    }
  });
  
  // Listen for the alarm to trigger (runs in background even if popup is closed)
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "countdownAlarm") {
      // Show a notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/i1.png", // Your icon path
        title: "Countdown Timer",
        message: "Time's up Rishit!",
        priority: 2
      });
  
      // Once the timer completes, remove finishTime
      chrome.storage.local.remove("finishTime");
    }
  });
  