import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Plus, LogOut, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function PopupApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quick_add' | 'today' | 'recent'>('quick_add');

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Quick Add State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskUrl, setTaskUrl] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Data State
  const [tasks, setTasks] = useState<any[]>([]);
  const [fetchingTasks, setFetchingTasks] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session && activeTab === 'quick_add') {
      // Get current tab info
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            setTaskTitle(tabs[0].title || '');
            setTaskUrl(tabs[0].url || '');
            setTaskDesc(tabs[0].url ? `Source: ${tabs[0].url}` : '');
          }
        });
      }
    } else if (session) {
      fetchTasks();
    }
  }, [session, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !taskTitle) return;
    setAddingTask(true);
    
    const { error } = await supabase.from('tasks').insert({
      title: taskTitle,
      description: taskDesc,
      status: 'todo',
      priority: 'medium',
      user_id: session.user.id,
    });

    setAddingTask(false);
    if (!error) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
      setTaskTitle('');
      setTaskDesc('');
    }
  };

  const fetchTasks = async () => {
    if (!session) return;
    setFetchingTasks(true);
    
    let query = supabase.from('tasks').select('id, title, status, due_date').eq('user_id', session.user.id);
    
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('due_date', `${today}T00:00:00Z`).lte('due_date', `${today}T23:59:59Z`);
    } else {
      query = query.order('created_at', { ascending: false }).limit(10);
    }
    
    const { data } = await query;
    setTasks(data || []);
    setFetchingTasks(false);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col h-full bg-background p-4 justify-center">
        <Card>
          <CardHeader>
            <CardTitle>TaskSkill Extension</CardTitle>
            <CardDescription>Login to sync tasks with your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {authError && <p className="text-sm text-red-500">{authError}</p>}
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Log In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="font-bold text-lg">TaskSkill</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log Out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'quick_add' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('quick_add')}
        >
          Quick Add
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'today' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'recent' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'quick_add' && (
          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="What needs to be done?" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Optional details or URL..." className="h-24 resize-none" />
            </div>
            <Button type="submit" className="w-full" disabled={addingTask || addSuccess}>
              {addingTask ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 
               addSuccess ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <Plus className="w-4 h-4 mr-2" />}
              {addSuccess ? 'Added!' : 'Save Task'}
            </Button>
          </form>
        )}

        {(activeTab === 'today' || activeTab === 'recent') && (
          <div className="space-y-2">
            {fetchingTasks ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">No tasks found.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="p-3 border rounded-md flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${task.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className={`text-sm truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
