import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setFilter,
  clearCompletedTasks,
  selectTaskStats,
  selectFilter,
  sortTasksByPriority,
  sortTasksByDueDate,
} from '../features/tasks/TasksSlice';
import './TodoStats.css';

function TodoStats() {
  const dispatch = useDispatch();
  const { total, active, completed } = useSelector(selectTaskStats);
  const currentFilter = useSelector(selectFilter);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  const handleFilterChange = (filter) => {
    dispatch(setFilter(filter));
  };

  const handleClearCompleted = () => {
    if (completed > 0 && window.confirm('Clear all completed tasks?')) {
      dispatch(clearCompletedTasks());
    }
  };

  const handleSortByPriority = () => {
    dispatch(sortTasksByPriority());
  };

  const handleSortByDueDate = () => {
    dispatch(sortTasksByDueDate());
  };

  return (
    <div className="todo-stats">
      <div className="stats-overview">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value total">{total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active:</span>
          <span className="stat-value active">{active}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed:</span>
          <span className="stat-value completed">{completed}</span>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-buttons">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-btn ${currentFilter === filter.id ? 'active' : ''}`}
              onClick={() => handleFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {completed > 0 && (
          <button
            className="clear-btn"
            onClick={handleClearCompleted}
          >
            Clear Completed ({completed})
          </button>
        )}
      </div>

      <div className="stats-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
        <span className="progress-text">
          {total > 0 ? Math.round((completed / total) * 100) : 0}% Complete
        </span>
      </div>
    </div>
  );
}

export default TodoStats;