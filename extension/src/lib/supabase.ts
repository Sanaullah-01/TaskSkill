import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Custom storage adapter for Chrome Extension using chrome.storage.local
const chromeStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null);
        });
      } else {
        resolve(localStorage.getItem(key));
      }
    });
  },
  setItem: (key: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      } else {
        localStorage.setItem(key, value);
        resolve();
      }
    });
  },
  removeItem: (key: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove([key], () => {
          resolve();
        });
      } else {
        localStorage.removeItem(key);
        resolve();
      }
    });
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
