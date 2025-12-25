import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addTaskAsync,
  updateTaskAsync,
  selectEditingTask,
  clearEditingTask,
  selectAllTasks,
  selectTaskError,
  selectTaskStatus,
} from '../features/tasks/TasksSlice';
import './TaskForm.css';

function TaskForm() {
  const dispatch = useDispatch();
  const editingTask = useSelector(selectEditingTask);
  const allTasks = useSelector(selectAllTasks);
  const error = useSelector(selectTaskError);
  const status = useSelector(selectTaskStatus);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);

  // Initialize form
  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        dueDate: '',
      });
    }
    setErrors({});
  }, [editingTask]);

  // Check for duplicate task name
  const checkDuplicateName = (name) => {
    if (!name.trim()) return false;
    
    const normalizedInput = name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    if (editingTask) {
      return allTasks.some(task => 
        task.id !== editingTask.id && 
        task.name.toLowerCase().trim().replace(/\s+/g, ' ') === normalizedInput
      );
    }
    
    return allTasks.some(task => 
      task.name.toLowerCase().trim().replace(/\s+/g, ' ') === normalizedInput
    );
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (name === 'name') {
      setIsChecking(true);
      setTimeout(() => {
        const isDuplicate = checkDuplicateName(value);
        if (isDuplicate && value.trim()) {
          setErrors(prev => ({
            ...prev,
            name: 'A task with this name already exists'
          }));
        }
        setIsChecking(false);
      }, 500);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    } else if (checkDuplicateName(formData.name)) {
      newErrors.name = 'A task with this name already exists';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }
    
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    
    const taskData = {
      ...formData,
      dueDate: formData.dueDate || null,
    };
    
    try {
      if (editingTask) {
        await dispatch(updateTaskAsync({
          ...editingTask,
          ...taskData,
        })).unwrap();
      } else {
        await dispatch(addTaskAsync(taskData)).unwrap();
        // Reset form on successful add
        setFormData({
          name: '',
          description: '',
          priority: 'medium',
          dueDate: '',
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        name: error || 'An error occurred'
      }));
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
    setErrors({});
    
    if (editingTask) {
      dispatch(clearEditingTask());
    }
  };

  const isFormDisabled = status === 'loading' || 
    isChecking || 
    checkDuplicateName(formData.name) || 
    !formData.name.trim() || 
    !formData.description.trim();

  return (
    <div className="task-form-container">
      <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
      
      {error && !errors.name && (
        <div className="redux-error">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="task-form">
        {/* Task Name Input */}
        <div className="form-group">
          <label htmlFor="name">
            Task Name *
            {errors.name && <span className="error-message"> - {errors.name}</span>}
            {isChecking && formData.name.trim() && !errors.name && (
              <span className="checking-message"> (checking...)</span>
            )}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter unique task name"
            className={`form-input ${errors.name ? 'error' : ''} ${checkDuplicateName(formData.name) ? 'duplicate' : ''}`}
            maxLength="100"
            disabled={status === 'loading'}
          />
          {checkDuplicateName(formData.name) && formData.name.trim() && (
            <p className="duplicate-warning">
              ⚠️ This task name already exists. Please choose a different name.
            </p>
          )}
        </div>
        
        {/* Task Description Input */}
        <div className="form-group">
          <label htmlFor="description">
            Description *
            {errors.description && <span className="error-message"> - {errors.description}</span>}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            rows="3"
            maxLength="500"
            disabled={status === 'loading'}
          />
        </div>
        
        {/* Priority Selection */}
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <div className="priority-options">
            <label className={`priority-option ${formData.priority === 'low' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="priority"
                value="low"
                checked={formData.priority === 'low'}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
              <span className="priority-dot low"></span>
              Low
            </label>
            
            <label className={`priority-option ${formData.priority === 'medium' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="priority"
                value="medium"
                checked={formData.priority === 'medium'}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
              <span className="priority-dot medium"></span>
              Medium
            </label>
            
            <label className={`priority-option ${formData.priority === 'high' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="priority"
                value="high"
                checked={formData.priority === 'high'}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
              <span className="priority-dot high"></span>
              High
            </label>
          </div>
        </div>
        
        {/* Due Date Input */}
        <div className="form-group">
          <label htmlFor="dueDate">
            Due Date (Optional)
            {errors.dueDate && <span className="error-message"> - {errors.dueDate}</span>}
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`form-input ${errors.dueDate ? 'error' : ''}`}
            min={new Date().toISOString().split('T')[0]}
            disabled={status === 'loading'}
          />
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isFormDisabled || status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <span className="spinner"></span>
                {editingTask ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              editingTask ? 'Update Task' : 'Add Task'
            )}
          </button>
          <button 
            type="button" 
            onClick={handleReset} 
            className="reset-btn"
            disabled={status === 'loading'}
          >
            {editingTask ? 'Cancel' : 'Reset'}
          </button>
        </div>
        
        {/* Form Help Text */}
        <p className="form-help">
          * Required fields. Task names must be unique.
          {isFormDisabled && <span className="disabled-hint"> Form disabled due to validation errors</span>}
        </p>
      </form>
    </div>
  );
}

export default TaskForm;