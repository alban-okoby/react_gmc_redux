import React from 'react';
import { useSelector } from 'react-redux';
import { selectSortedTasks, selectTaskStatus } from '../features/tasks/TasksSlice';
import TaskItem from './TaskItem';
import './TaskList.css';

function TaskList() {
  const tasks = useSelector(selectSortedTasks);
  const status = useSelector(selectTaskStatus);

  if (status === 'loading' && tasks.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="no-tasks-message">
        <p>No tasks found. Add your first task above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
        />
      ))}
    </div>
  );
}

export default TaskList;