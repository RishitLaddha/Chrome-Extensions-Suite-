// background.js - TEMPLATE VERSION
// IMPORTANT: This is a template extension that requires user configuration
// Users must set up their own Gmail API OAuth credentials
// This file handles OAuth flow and Gmail API interactions

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

/**
 * Launch the OAuth flow to sign in a Gmail account.
 * @param {string} clientId - The client ID to use for this OAuth flow.
 */
async function authorizeGmailAccount(clientId) {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: getAuthUrl(clientId),
        interactive: true
      },
      function (redirectUrl) {
        if (chrome.runtime.lastError || (redirectUrl && redirectUrl.includes("error"))) {
          reject(chrome.runtime.lastError || "Error during authentication.");
          return;
        }
        // Extract the access token from the redirect URL.
        const urlParams = new URLSearchParams(redirectUrl.split("#")[1]);
        const accessToken = urlParams.get("access_token");
        if (accessToken) {
          resolve(accessToken);
        } else {
          reject("No access token found.");
        }
      }
    );
  });
}

/**
 * Construct the OAuth URL using the given client ID.
 * @param {string} clientId
 * @returns {string}
 */
function getAuthUrl(clientId) {
  const redirectUri = chrome.identity.getRedirectURL();
  const scopes = ["https://www.googleapis.com/auth/gmail.modify"];
  const responseType = "token";

  return "https://accounts.google.com/o/oauth2/v2/auth" +
    "?client_id=" + encodeURIComponent(clientId) +
    "&response_type=" + encodeURIComponent(responseType) +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&scope=" + encodeURIComponent(scopes.join(" ")) +
    "&prompt=select_account";
}

/**
 * Fetch unread messages (top 10 for display) using the Gmail API.
 */
async function getUnreadMessages(accessToken) {
  const response = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10",
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  const data = await response.json();
  return data.messages || [];
}

/**
 * Fetch details for a single message by its ID.
 */
async function getMessageDetails(accessToken, messageId) {
  const response = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch message details");
  }
  return response.json();
}

/**
 * Mark all unread messages as read for the given account.
 * Now fetches up to 100 unread messages.
 */
async function markAllAsRead(accessToken) {
  // Fetch all unread messages (up to 100).
  const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=100", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch unread messages");
  }
  const data = await response.json();
  const messages = data.messages || [];
  if (messages.length === 0) {
    console.log("No unread messages to mark as read.");
    return { success: true, modifiedCount: 0 };
  }
  const ids = messages.map(msg => msg.id);
  // Batch modify: remove the UNREAD label.
  const batchResponse = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/batchModify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ids: ids,
      removeLabelIds: ["UNREAD"]
    })
  });
  if (!batchResponse.ok) {
    throw new Error("Failed to mark messages as read");
  }
  console.log(`Marked ${ids.length} messages as read.`);
  return { success: true, modifiedCount: ids.length };
}

/**
 * Listen for messages from the popup.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "authorize") {
    // Expect request.clientId to be passed.
    authorizeGmailAccount(request.clientId)
      .then(token => sendResponse({ success: true, token }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  } else if (request.action === "getUnread") {
    getUnreadMessages(request.token)
      .then(messages => sendResponse({ success: true, messages }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  } else if (request.action === "getMessageDetail") {
    getMessageDetails(request.token, request.messageId)
      .then(detail => sendResponse({ success: true, detail }))
      .catch(err => sendResponse({ success: false, error: err }));
    return true;
  } else if (request.action === "markAllRead") {
    markAllAsRead(request.token)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message || err }));
    return true;
  }
});
