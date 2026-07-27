// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SYNC_AUTH_TOKEN') {
    // Store the token in Chrome extension storage
    chrome.storage.local.set({ supabaseAuth: request.token }, () => {
      console.log('Auth token synced from web app');
    });
  }
});
