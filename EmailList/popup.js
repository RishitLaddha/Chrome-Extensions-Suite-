// popup.js - TEMPLATE VERSION
// IMPORTANT: This is a template extension that requires user configuration
// Users must:
// 1. Copy config.example.js to config.js
// 2. Add their own Gmail OAuth client IDs to config.js
// 3. Set up Gmail API in Google Cloud Console
// 4. Include config.js in popup.html

document.addEventListener("DOMContentLoaded", () => {
  const authorizeButton = document.getElementById("authorize-button");
  const unreadContainer = document.getElementById("unread-container");
  const loading = document.getElementById("loading");

  // IMPORTANT: You must create your own config.js file with your OAuth client IDs
  // Copy config.example.js to config.js and add your Gmail API credentials
  // This extension requires Gmail API setup in Google Cloud Console
  let clientMapping = {};
  
  // Try to load user configuration
  try {
    // Users must create config.js with their own OAuth client IDs
    // Example: { "your.email@gmail.com": "your-oauth-client-id" }
    if (typeof loadUserConfig === 'function') {
      clientMapping = loadUserConfig();
    }
  } catch (error) {
    console.warn('User configuration not loaded. Please create config.js with your OAuth credentials.');
  }

  // Handle account authorization.
  authorizeButton.addEventListener("click", () => {
    let email = prompt("Enter email for this account:\n Supported: " + Object.keys(clientMapping).join(", "));
    if (!email) return;
    email = email.trim();
    let clientId = clientMapping[email];
    if (!clientId) {
      alert("Email not recognized. Please enter one of the supported emails.");
      return;
    }
    let label = prompt("Enter a label for this account (e.g., collegeid, work, personal):");
    if (!label) label = email;
    // Start OAuth flow with the chosen client ID.
    chrome.runtime.sendMessage({ action: "authorize", clientId: clientId }, response => {
      if (response.success) {
        const token = response.token;
        chrome.storage.local.get(["accounts"], (data) => {
          let accounts = data.accounts || [];
          // Check if the account (by email) already exists.
          const existingIndex = accounts.findIndex(acc => acc.email === email);
          if (existingIndex !== -1) {
            // Update the existing account's token and label.
            accounts[existingIndex].token = token;
            accounts[existingIndex].label = label;
          } else {
            accounts.push({ token, label, email });
          }
          chrome.storage.local.set({ accounts }, () => {
            refreshAllAccounts();
          });
        });
      } else {
        console.error("Authorization failed:", response.error);
      }
    });
  });

  // Helper: Wrap chrome.runtime.sendMessage as a promise.
  function sendMessagePromise(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response && response.error ? response.error : "Unknown error");
        }
      });
    });
  }

  // Fetch and render an account’s unread messages.
  async function fetchAndRenderAccount(account, index) {
    try {
      let response = await sendMessagePromise({ action: "getUnread", token: account.token });
      let messages = response.messages;
      // For each message, fetch details.
      let messageDetailsPromises = messages.map(msg => sendMessagePromise({
        action: "getMessageDetail",
        token: account.token,
        messageId: msg.id
      }));
      let detailsArray = await Promise.all(messageDetailsPromises);
      // Build an array of message objects.
      let messageObjs = detailsArray.map(detailResp => {
        let details = detailResp.detail;
        let subjectHeader = details.payload.headers.find(header => header.name === "Subject");
        let fromHeader = details.payload.headers.find(header => header.name === "From");
        let subject = subjectHeader ? subjectHeader.value : "(No Subject)";
        let from = fromHeader ? fromHeader.value : "(Unknown Sender)";
        return { from, subject };
      });
      // For the "collegeid" account, prioritize messages from @classroom.google.com.
      if (account.label.toLowerCase() === "collegeid") {
        messageObjs.sort((a, b) => {
          const aPriority = a.from.includes("@classroom.google.com") ? 0 : 1;
          const bPriority = b.from.includes("@classroom.google.com") ? 0 : 1;
          return aPriority - bPriority;
        });
      }
      // Create the account container.
      const accountDiv = document.createElement("div");
      accountDiv.classList.add("account-container");
      accountDiv.innerHTML = `
        <div class="account-header">
          <div>
            <span class="account-label">${account.label}</span>
            <span class="unread-count">(${messageObjs.length} unread)</span>
          </div>
          <button class="mark-read-button" data-index="${index}">Mark All as Read</button>
        </div>
      `;
      // Render each message.
      messageObjs.forEach(msgObj => {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.innerHTML = `<span class="sender">${msgObj.from}</span><span class="subject"> - ${msgObj.subject}</span>`;
        accountDiv.appendChild(msgDiv);
      });
      // If no messages are found, display a friendly message.
      if (messageObjs.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.classList.add("empty-msg");
        emptyMsg.textContent = "No unread messages.";
        accountDiv.appendChild(emptyMsg);
      }
      unreadContainer.appendChild(accountDiv);
      // Set up the "Mark All as Read" button event.
      const markReadButton = accountDiv.querySelector(".mark-read-button");
      markReadButton.addEventListener("click", async () => {
        try {
          await sendMessagePromise({ action: "markAllRead", token: account.token });
          // Increase delay to 2000ms (2 seconds) to allow Gmail to update.
          setTimeout(() => refreshAllAccounts(), 2000);
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  }

  // Refresh all accounts by loading them from storage and rendering each.
  function refreshAllAccounts() {
    loading.style.display = "block";
    chrome.storage.local.get(["accounts"], (data) => {
      const accounts = data.accounts || [];
      unreadContainer.innerHTML = "";
      if (accounts.length === 0) {
        unreadContainer.innerHTML = "<p>No accounts authorized yet.</p>";
      } else {
        accounts.forEach((account, index) => {
          fetchAndRenderAccount(account, index);
        });
      }
      loading.style.display = "none";
    });
  }

  refreshAllAccounts();
});
