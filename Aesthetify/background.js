// An object to keep track of which tabs need the transformation.
const tabsToInject = {};

// Listen for messages from popup.js.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "flagTab") {
    tabsToInject[message.tabId] = true;
  }
});

// Listen for tab updates. When a tab flagged for injection finishes loading,
// inject the content script.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabsToInject[tabId] && changeInfo.status === "complete") {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    }, () => {
      // Clear the flag after injection.
      delete tabsToInject[tabId];
    });
  }
});
