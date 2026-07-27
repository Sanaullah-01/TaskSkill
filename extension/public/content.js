// content.js
// This script runs in the context of the TaskSkill Web App (e.g. localhost:3000 or vercel.app)

function getSupabaseAuthToken() {
  const value = localStorage.getItem('taskskill-ext-auth');
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return null;
}

// Listen for messages from the extension popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_AUTH_TOKEN') {
    const token = getSupabaseAuthToken();
    sendResponse({ token });
  }
  return true; // Indicates we want to send a response asynchronously
});

// Optionally, proactively send it to background on load
const token = getSupabaseAuthToken();
if (token) {
  chrome.runtime.sendMessage({ type: 'SYNC_AUTH_TOKEN', token });
}
