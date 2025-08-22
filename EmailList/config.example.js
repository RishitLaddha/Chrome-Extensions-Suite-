// config.example.js
// Copy this file to config.js and add your own Gmail OAuth client IDs

// Mapping of email addresses to their OAuth client IDs
// You need to create these in Google Cloud Console for Gmail API access
const clientMapping = {
  // Example format:
  // "your.email@gmail.com": "your-oauth-client-id-here",
  // "work.email@company.com": "your-work-oauth-client-id-here",
  
  // Add your supported email-clientID pairs here:
  // "example@gmail.com": "123456789-abcdef.apps.googleusercontent.com"
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clientMapping };
}
