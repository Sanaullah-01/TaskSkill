import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createClient } from '@/lib/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface TasksState {
  items: Task[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  searchQuery: '',
  isLoading: false,
  error: null,
};

const supabase = createClient();

// --- Async Thunks ---

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data as Task[];
  }
);

export const createTaskDb = createAsyncThunk(
  'tasks/createTaskDb',
  async (
    taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    { rejectWithValue }
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: user.id })
      .select()
      .single();

    if (error) return rejectWithValue(error.message);
    return data as Task;
  }
);

export const updateTaskDb = createAsyncThunk(
  'tasks/updateTaskDb',
  async (
    { id, updates }: { id: string; updates: Partial<Task> },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return rejectWithValue(error.message);
    return data as Task;
  }
);

export const deleteTaskDb = createAsyncThunk(
  'tasks/deleteTaskDb',
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) return rejectWithValue(error.message);
    return id; // return the deleted ID
  }
);

// --- Slice ---

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    // Optimistic UI updates
    optimisticUpdateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload.updates);
      }
    }
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // createTaskDb
    builder.addCase(createTaskDb.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    // updateTaskDb
    builder.addCase(updateTaskDb.fulfilled, (state, action) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });

    // deleteTaskDb
    builder.addCase(deleteTaskDb.fulfilled, (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    });
  },
});

export const { setSearchQuery, optimisticUpdateTask } = tasksSlice.actions;
export default tasksSlice.reducer;
