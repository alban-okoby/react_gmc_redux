import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../features/tasks/TasksSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});