// Local storage key
const STORAGE_KEY = 'redux_todo_tasks';

// Save tasks to localStorage
export const saveTasksToStorage = (tasks) => {
  try {
    const serializedTasks = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, serializedTasks);
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

// Load tasks from localStorage
export const loadTasksFromStorage = () => {
  try {
    const serializedTasks = localStorage.getItem(STORAGE_KEY);
    if (serializedTasks === null) {
      return [];
    }
    return JSON.parse(serializedTasks);
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

// Export tasks data for backup
export const exportTasks = () => {
  try {
    const tasks = loadTasksFromStorage();
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'todo-tasks-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting tasks:', error);
    alert('Error exporting tasks: ' + error.message);
  }
};

// Import tasks from file
export const importTasks = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const tasks = JSON.parse(event.target.result);
        if (Array.isArray(tasks)) {
          saveTasksToStorage(tasks);
          resolve(tasks);
        } else {
          reject(new Error('Invalid file format. Expected an array of tasks.'));
        }
      } catch (error) {
        reject(new Error('Invalid JSON file: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};