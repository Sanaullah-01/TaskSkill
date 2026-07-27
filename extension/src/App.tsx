import { useState, useEffect } from 'react'
import './App.css'
import { createClient } from '@supabase/supabase-js'

// We need to use the actual URL and Anon Key of the Supabase project
// In a real scenario, this would be env variables injected by Vite
const SUPABASE_URL = 'https://ntzjkrbfcwqorfbionyu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9MeV_ttHau9dEA77gcLa2A_miJwQCyM';

function App() {
  const [token, setToken] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    // 1. Get the Auth Token from the Chrome Extension local storage
    chrome.storage.local.get(['supabaseAuth'], (result: any) => {
      if (result.supabaseAuth) {
        setToken(result.supabaseAuth);
        fetchTasks(result.supabaseAuth);
      } else {
        // If not in storage, try asking the current active tab (if it's the web app)
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_AUTH_TOKEN' }, (response) => {
              if (chrome.runtime.lastError) {
                // Ignore error, likely not on the web app page
                setLoading(false);
                return;
              }
              if (response && response.token) {
                setToken(response.token);
                fetchTasks(response.token);
                // Save it for later
                chrome.storage.local.set({ supabaseAuth: response.token });
              } else {
                setLoading(false);
              }
            });
          } else {
            setLoading(false);
          }
        });
      }
    });

    // 2. Also listen for real-time updates from content script
    chrome.runtime.onMessage.addListener((request: any) => {
      if (request.type === 'SYNC_AUTH_TOKEN') {
        setToken(request.token);
        fetchTasks(request.token);
      }
    });
  }, []);

  const fetchTasks = async (authToken: any) => {
    if (!authToken || !authToken.access_token) return;
    
    setLoading(true);
    // Initialize Supabase with the specific auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken.access_token}`
        }
      }
    });

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', authToken.user.id)
      .order('created_at', { ascending: false })
      .limit(5); // Only show top 5 in extension
      
    if (data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token) return;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      }
    });

    const { data } = await supabase
      .from('tasks')
      .insert({
        title: newTaskTitle,
        status: 'todo',
        priority: 'medium',
        user_id: token.user.id
      })
      .select()
      .single();

    if (data) {
      setTasks([data, ...tasks]);
      setNewTaskTitle('');
    }
  };

  if (loading) {
    return (
      <div className="w-[320px] h-[400px] flex items-center justify-center bg-gray-50 text-gray-800 font-sans">
        <div className="animate-pulse">Loading TaskSkill...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-[320px] h-[400px] flex flex-col items-center justify-center p-6 text-center bg-gray-50 text-gray-800 font-sans">
        <h1 className="text-xl font-bold mb-2">TaskSkill</h1>
        <p className="text-sm text-gray-500 mb-6">Please log in to the TaskSkill Web App to sync your account.</p>
        <button 
          onClick={() => chrome.tabs.create({ url: 'http://localhost:3000' })}
          className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          Open Web App
        </button>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[400px] flex flex-col bg-white text-gray-800 font-sans border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h1 className="font-semibold">TaskSkill</h1>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Synced</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-colors">
            <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-black border-black text-white' : 'border-gray-300'}`}>
              {task.status === 'completed' && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </div>
            <div className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {task.title}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8">No tasks found.</div>
        )}
      </div>

      <form onSubmit={handleCreateTask} className="p-4 border-t border-gray-100 bg-gray-50">
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..." 
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
      </form>
    </div>
  )
}

export default App
