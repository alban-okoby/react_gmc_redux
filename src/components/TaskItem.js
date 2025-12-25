import { useDispatch } from 'react-redux';
import {
  toggleTaskCompletionAsync,
  deleteTaskAsync,
  setEditingTask,
} from '../features/tasks/TasksSlice';
import './TaskItem.css';

function TaskItem({ task }) {
  const dispatch = useDispatch();

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const timeDiff = dueDate - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      let className = 'due-date';
      let displayText = formatDate(dateString);
      
      if (daysDiff < 0) {
        className += ' overdue';
        displayText += ' (Overdue)';
      } else if (daysDiff === 0) {
        className += ' due-today';
        displayText += ' (Today)';
      } else if (daysDiff <= 3) {
        className += ' due-soon';
        displayText += ` (in ${daysDiff} day${daysDiff > 1 ? 's' : ''})`;
      }
      
      return { text: displayText, className };
    } catch (error) {
      return null;
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { label: 'High', class: 'priority-high' };
      case 'medium':
        return { label: 'Medium', class: 'priority-medium' };
      case 'low':
        return { label: 'Low', class: 'priority-low' };
      default:
        return { label: 'Medium', class: 'priority-medium' };
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTaskAsync(task.id));
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);
  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        {/* Task Checkbox */}
        <div className="task-checkbox">
          <input
            type="checkbox"
            checked={task.completed || false}
            onChange={() => dispatch(toggleTaskCompletionAsync(task.id))}
            id={`task-${task.id}`}
            className="checkbox-input"
          />
          <label 
            htmlFor={`task-${task.id}`} 
            className="checkbox-label"
            title="Toggle completion"
          >
            <span className="checkmark"></span>
          </label>
        </div>
        
        {/* Task Details */}
        <div className="task-details" onDoubleClick={() => dispatch(setEditingTask(task))}>
          <div className="task-header">
            <h3 className={`task-name ${task.completed ? 'completed' : ''}`}>
              {task.name || 'Unnamed Task'}
            </h3>
            <div className="task-badges">
              <span className={`priority-badge ${priorityInfo.class}`}>
                {priorityInfo.label}
              </span>
              {dueDateInfo && (
                <span className={dueDateInfo.className}>
                  {dueDateInfo.text}
                </span>
              )}
            </div>
          </div>
          
          <p className="task-description">
            {task.description || 'No description'}
          </p>
          
          <div className="task-meta">
            <span className="task-date">
              Created: {formatDate(task.createdAt)}
            </span>
            {task.completed ? (
              <span className="status-badge completed-badge">
                Completed
              </span>
            ) : (
              <span className="status-badge active-badge">
                Active
              </span>
            )}
          </div>
        </div>
        
        {/* Task Actions */}
        <div className="task-actions">
          <button
            onClick={() => dispatch(setEditingTask(task))}
            className="action-btn edit-btn"
            title="Edit task"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          
          <button
            onClick={handleDelete}
            className="action-btn delete-btn"
            title="Delete task"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;