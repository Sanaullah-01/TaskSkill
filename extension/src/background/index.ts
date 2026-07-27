import { supabase } from '../lib/supabase';

// Initialize Context Menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'taskskill-save-highlight',
    title: 'Save to TaskSkill: "%s"',
    contexts: ['selection'],
  });

  // Setup alarm to check for upcoming due tasks every 60 minutes
  chrome.alarms.create('check-due-tasks', { periodInMinutes: 60 });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'taskskill-save-highlight' && info.selectionText) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // User is not logged in to the extension
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png', // Fallback if no icon
        title: 'TaskSkill: Auth Required',
        message: 'Please click the extension icon and log in to save tasks.',
      });
      return;
    }

    const title = info.selectionText.substring(0, 100) + (info.selectionText.length > 100 ? '...' : '');
    const description = `Saved from: ${tab?.url || 'Unknown page'}\n\n"${info.selectionText}"`;

    const { error } = await supabase.from('tasks').insert({
      title,
      description,
      status: 'todo',
      priority: 'medium',
      user_id: session.user.id,
    });

    if (error) {
      console.error('Failed to create task from context menu:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'TaskSkill: Error',
        message: 'Failed to save the highlighted text.',
      });
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'TaskSkill',
        message: 'Highlight saved as a new task!',
      });
    }
  }
});

// Handle Alarms (Due Date Reminders)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'check-due-tasks') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Check tasks due in the next 24 hours that are NOT completed
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, due_date')
      .eq('user_id', session.user.id)
      .neq('status', 'completed')
      .neq('status', 'archived')
      .gte('due_date', now.toISOString())
      .lte('due_date', tomorrow.toISOString());

    if (tasks && tasks.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'TaskSkill Reminder',
        message: `You have ${tasks.length} task(s) due within the next 24 hours.`,
      });
    }
  }
});
