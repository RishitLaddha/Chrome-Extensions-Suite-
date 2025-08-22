// When the popup loads, check the current state of dark mode on the active tab.
document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if dark mode is already applied on the page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: checkDarkModeState
    }).then((results) => {
      const isDark = results[0].result;
      document.getElementById('toggleBtn').textContent = isDark ? "Un-Dark" : "Dark";
    });
    
    // Add click event for toggling dark mode
    document.getElementById('toggleBtn').addEventListener('click', async () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleDarkMode
      }).then((results) => {
        const isDark = results[0].result;
        // Update button label based on the new state
        document.getElementById('toggleBtn').textContent = isDark ? "Un-Dark" : "Dark";
      });
    });
  });
  
  // This function runs in the context of the active page and checks if dark mode is applied.
  function checkDarkModeState() {
    return document.getElementById('myDarkModeStyle') !== null;
  }
  
  // This function toggles dark mode and returns the new state (true if dark mode is now applied).
  function toggleDarkMode() {
    const styleId = 'myDarkModeStyle';
    const existingStyle = document.getElementById(styleId);
    let isDark;
    if (existingStyle) {
      // Remove dark mode
      existingStyle.remove();
      isDark = false;
    } else {
      // Inject dark mode styles
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        html, body, * {
          background-color: #121212 !important;
          color: #e0e0e0 !important;
          border-color: #444 !important;
        }
        a, a * {
          color: #bb86fc !important;
        }
      `;
      document.head.appendChild(style);
      isDark = true;
    }
    return isDark;
  }
  