// Set the idle detection interval (in seconds).
// For example, 60 means if the user is idle for 60s, the state changes to "idle".
chrome.idle.setDetectionInterval(60);

// Listen for idle state changes.
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === "idle") {
    // Open the screensaver tab when the user becomes idle.
    chrome.tabs.create({ url: chrome.runtime.getURL("screensaver.html") });
  }
});
