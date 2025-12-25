import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveTasksToStorage, loadTasksFromStorage } from './TasksAPI';

// Initial state
const initialState = {
  tasks: loadTasksFromStorage(),
  editingTask: null,
  filter: 'all',
  status: 'idle',
  error: null,
};

// Helper function to normalize task names
const normalizeTaskName = (name) => {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Async thunks
export const addTaskAsync = createAsyncThunk(
  'tasks/addTask',
  async (taskData, { getState, rejectWithValue }) => {
    const state = getState();
    const { tasks } = state.tasks;
    
    const normalizedInput = normalizeTaskName(taskData.name);
    const isDuplicate = tasks.some(task => 
      normalizeTaskName(task.name) === normalizedInput
    );
    
    if (isDuplicate) {
      return rejectWithValue('A task with this name already exists');
    }
    
    const newTask = {
      id: Date.now(),
      name: taskData.name,
      description: taskData.description,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
    };
    
    return newTask;
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async (updatedTask, { getState, rejectWithValue }) => {
    const state = getState();
    const { tasks } = state.tasks;
    
    const normalizedInput = normalizeTaskName(updatedTask.name);
    const isDuplicate = tasks.some(task => 
      task.id !== updatedTask.id && 
      normalizeTaskName(task.name) === normalizedInput
    );
    
    if (isDuplicate) {
      return rejectWithValue('A task with this name already exists');
    }
    
    return updatedTask;
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId) => {
    return taskId;
  }
);

export const toggleTaskCompletionAsync = createAsyncThunk(
  'tasks/toggleCompletion',
  async (taskId, { getState, rejectWithValue }) => {
    const state = getState();
    const task = state.tasks.tasks.find(t => t.id === taskId);
    if (!task) return rejectWithValue('Task not found');
    
    return {
      ...task,
      completed: !task.completed,
    };
  }
);

// Create slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setEditingTask: (state, action) => {
      state.editingTask = action.payload;
    },
    clearEditingTask: (state) => {
      state.editingTask = null;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearCompletedTasks: (state) => {
      state.tasks = state.tasks.filter(task => !task.completed);
      saveTasksToStorage(state.tasks);
    },
    sortTasksByPriority: (state) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      state.tasks.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      saveTasksToStorage(state.tasks);
    },
    sortTasksByDueDate: (state) => {
      state.tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      saveTasksToStorage(state.tasks);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTaskAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks.push(action.payload);
        saveTasksToStorage(state.tasks);
      })
      .addCase(addTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateTaskAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.editingTask = null;
        saveTasksToStorage(state.tasks);
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        saveTasksToStorage(state.tasks);
      })
      .addCase(toggleTaskCompletionAsync.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        saveTasksToStorage(state.tasks);
      })
      .addCase(toggleTaskCompletionAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setEditingTask,
  clearEditingTask,
  setFilter,
  clearCompletedTasks,
  sortTasksByPriority,
  sortTasksByDueDate,
} = tasksSlice.actions;

// Export reducer as default
export default tasksSlice.reducer;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectEditingTask = (state) => state.tasks.editingTask;
export const selectFilter = (state) => state.tasks.filter;
export const selectTaskStatus = (state) => state.tasks.status;
export const selectTaskError = (state) => state.tasks.error;

export const selectFilteredTasks = (state) => {
  const tasks = state.tasks.tasks;
  const filter = state.tasks.filter;
  
  switch (filter) {
    case 'active':
      return tasks.filter(task => !task.completed);
    case 'completed':
      return tasks.filter(task => task.completed);
    default:
      return tasks;
  }
};

export const selectTaskStats = (state) => {
  const tasks = state.tasks.tasks;
  const total = tasks.length;
  const active = tasks.filter(task => !task.completed).length;
  const completed = tasks.filter(task => task.completed).length;
  
  return { total, active, completed };
};

export const selectSortedTasks = (state) => {
  const tasks = selectFilteredTasks(state);
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};