import React from 'react';
import { useSelector } from 'react-redux';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TodoStats from './components/TodoStats';
import { exportTasks, importTasks } from './features/tasks/TasksAPI';

function App() {
  const tasks = useSelector(state => state.tasks.tasks);
  const editingTask = useSelector(state => state.tasks.editingTask);

  // Handle import tasks
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await importTasks(file);
        alert('Tasks imported successfully!');
        window.location.reload(); // Refresh to load new tasks
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Redux To-Do List</h1>
        <p className="subtitle">Manage your tasks with Redux state management</p>
      </header>

      <main className="app-main">
        <div className="app-container">
          {/* Import/Export Controls */}
          <div className="data-controls">
            <button 
              className="import-export-btn export-btn"
              onClick={exportTasks}
              disabled={tasks.length === 0}
            >
              Export Tasks
            </button>
            <label className="import-export-btn import-btn">
              Import Tasks
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Task Form Section */}
          <section className="form-section">
            <TaskForm />
          </section>

          {/* Stats Section */}
          <section className="stats-section">
            <TodoStats />
          </section>

          {/* Task List Section */}
          <section className="list-section">
            {editingTask ? (
              <div className="editing-notice">
                <p>You are editing: <strong>{editingTask.name}</strong></p>
              </div>
            ) : null}
            
            <TaskList />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Redux State Management Features:</strong>
          </p>
          <ul className="features-list">
            <li>Centralized state management with Redux Toolkit</li>
            <li>Async actions with createAsyncThunk</li>
            <li>Automatic localStorage persistence</li>
            <li>Computed selectors for derived state</li>
            <li>Normalized state updates</li>
            <li>Predictable state mutations</li>
          </ul>
          <p className="hint">Double-click a task to edit it | Tasks are auto-saved</p>
        </div>
      </footer>
    </div>
  );
}

export default App;