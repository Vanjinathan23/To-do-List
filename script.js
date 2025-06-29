/**
 * Modern To-Do List Application
 * A fully functional task management app with localStorage persistence
 */

class TodoApp {
    constructor() {
        // Application state
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.taskToDelete = null;
        
        // DOM elements
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            tasksList: document.getElementById('tasksList'),
            emptyState: document.getElementById('emptyState'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            clearCompletedBtn: document.getElementById('clearCompletedBtn'),
            
            // Counters
            totalCount: document.getElementById('totalCount'),
            completedCount: document.getElementById('completedCount'),
            allCount: document.getElementById('allCount'),
            pendingCount: document.getElementById('pendingCount'),
            completedBadgeCount: document.getElementById('completedBadgeCount'),
            
            // Modals
            editModal: document.getElementById('editModal'),
            editTaskInput: document.getElementById('editTaskInput'),
            saveEditBtn: document.getElementById('saveEditBtn'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            
            deleteModal: document.getElementById('deleteModal'),
            confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
            cancelDeleteBtn: document.getElementById('cancelDeleteBtn')
        };
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
        
        // Focus on input for better UX
        this.elements.taskInput.focus();
        
        console.log('Todo App initialized successfully!');
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Add task events
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Filter events
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed tasks
        this.elements.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompletedTasks();
        });
        
        // Edit modal events
        this.elements.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.elements.cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        this.elements.editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit();
            } else if (e.key === 'Escape') {
                this.cancelEdit();
            }
        });
        
        // Delete modal events
        this.elements.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.elements.cancelDeleteBtn.addEventListener('click', () => this.cancelDelete());
        
        // Close modals when clicking overlay
        this.elements.editModal.addEventListener('click', (e) => {
            if (e.target === this.elements.editModal) {
                this.cancelEdit();
            }
        });
        
        this.elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteModal) {
                this.cancelDelete();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.cancelEdit();
                this.cancelDelete();
            }
            
            // Ctrl/Cmd + / to focus on input
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.elements.taskInput.focus();
            }
        });
    }
    
    /**
     * Generate unique ID for tasks
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Get current timestamp in user-friendly format
     */
    getCurrentTimestamp() {
        return new Date().toLocaleString();
    }
    
    /**
     * Add a new task
     */
    addTask() {
        const text = this.elements.taskInput.value.trim();
        
        // Validation
        if (!text) {
            this.showInputError('Please enter a task');
            return;
        }
        
        if (text.length > 200) {
            this.showInputError('Task is too long (max 200 characters)');
            return;
        }
        
        // Create new task
        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: this.getCurrentTimestamp(),
            completedAt: null
        };
        
        // Add to tasks array
        this.tasks.unshift(task); // Add to beginning for better UX
        
        // Clear input
        this.elements.taskInput.value = '';
        
        // Save and render
        this.saveTasks();
        this.render();
        
        // Show success feedback
        this.showSuccessFeedback();
        
        console.log('Task added:', task);
    }
    
    /**
     * Toggle task completion status
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? this.getCurrentTimestamp() : null;
        
        this.saveTasks();
        this.render();
        
        console.log('Task toggled:', task);
    }
    
    /**
     * Start editing a task
     */
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.editingTaskId = taskId;
        this.elements.editTaskInput.value = task.text;
        this.elements.editModal.style.display = 'flex';
        
        // Focus and select text
        setTimeout(() => {
            this.elements.editTaskInput.focus();
            this.elements.editTaskInput.select();
        }, 100);
        
        console.log('Editing task:', task);
    }
    
    /**
     * Save task edit
     */
    saveEdit() {
        const newText = this.elements.editTaskInput.value.trim();
        
        if (!newText) {
            this.showEditError('Please enter a task');
            return;
        }
        
        if (newText.length > 200) {
            this.showEditError('Task is too long (max 200 characters)');
            return;
        }
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            this.saveTasks();
            this.render();
        }
        
        this.cancelEdit();
        console.log('Task edited:', task);
    }
    
    /**
     * Cancel task edit
     */
    cancelEdit() {
        this.editingTaskId = null;
        this.elements.editModal.style.display = 'none';
        this.elements.editTaskInput.value = '';
    }
    
    /**
     * Show delete confirmation
     */
    deleteTask(taskId) {
        this.taskToDelete = taskId;
        this.elements.deleteModal.style.display = 'flex';
    }
    
    /**
     * Confirm task deletion
     */
    confirmDelete() {
        if (!this.taskToDelete) return;
        
        this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);
        this.saveTasks();
        this.render();
        
        console.log('Task deleted:', this.taskToDelete);
        this.cancelDelete();
    }
    
    /**
     * Cancel task deletion
     */
    cancelDelete() {
        this.taskToDelete = null;
        this.elements.deleteModal.style.display = 'none';
    }
    
    /**
     * Set active filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
        console.log('Filter set to:', filter);
    }
    
    /**
     * Get filtered tasks based on current filter
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }
    
    /**
     * Clear all completed tasks
     */
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) return;
        
        if (confirm(`Are you sure you want to delete all ${completedCount} completed tasks?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
            console.log('Cleared completed tasks');
        }
    }
    
    /**
     * Update task counters
     */
    updateCounters() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        // Update counter displays
        this.elements.totalCount.textContent = total;
        this.elements.completedCount.textContent = completed;
        this.elements.allCount.textContent = total;
        this.elements.pendingCount.textContent = pending;
        this.elements.completedBadgeCount.textContent = completed;
        
        // Show/hide clear completed button
        this.elements.clearCompletedBtn.style.display = completed > 0 ? 'inline-flex' : 'none';
    }
    
    /**
     * Create task HTML element
     */
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.setAttribute('role', 'listitem');
        
        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="todoApp.toggleTask('${task.id}')"
                 role="checkbox" 
                 aria-checked="${task.completed}"
                 tabindex="0"
                 onkeypress="if(event.key==='Enter'||event.key===' ') todoApp.toggleTask('${task.id}')">
                ${task.completed ? '<i data-feather="check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-meta">
                    Created: ${task.createdAt}
                    ${task.completedAt ? ` • Completed: ${task.completedAt}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit" 
                        onclick="todoApp.editTask('${task.id}')"
                        aria-label="Edit task"
                        title="Edit task">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="task-action-btn delete" 
                        onclick="todoApp.deleteTask('${task.id}')"
                        aria-label="Delete task"
                        title="Delete task">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        `;
        
        return taskDiv;
    }
    
    /**
     * Render the tasks list
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Clear current tasks
        this.elements.tasksList.innerHTML = '';
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.elements.emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyMessages = {
                all: {
                    title: 'No tasks yet',
                    message: 'Add your first task above to get started!'
                },
                pending: {
                    title: 'No pending tasks',
                    message: 'Great job! All your tasks are completed.'
                },
                completed: {
                    title: 'No completed tasks',
                    message: 'Complete some tasks to see them here.'
                }
            };
            
            const message = emptyMessages[this.currentFilter];
            this.elements.emptyState.querySelector('h3').textContent = message.title;
            this.elements.emptyState.querySelector('p').textContent = message.message;
        } else {
            this.elements.emptyState.style.display = 'none';
            
            // Render tasks
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.elements.tasksList.appendChild(taskElement);
            });
        }
        
        // Update counters
        this.updateCounters();
        
        // Re-initialize Feather icons for new elements
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
            console.log('Tasks saved to localStorage');
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showError('Failed to save tasks. Your browser storage might be full.');
        }
    }
    
    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            if (saved) {
                this.tasks = JSON.parse(saved);
                console.log('Tasks loaded from localStorage:', this.tasks.length);
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.showError('Failed to load saved tasks.');
            this.tasks = [];
        }
    }
    
    /**
     * Utility function to escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Show input validation error
     */
    showInputError(message) {
        const inputContainer = this.elements.taskInput.parentElement;
        inputContainer.style.borderColor = 'var(--danger-color)';
        
        // Remove error style after 3 seconds
        setTimeout(() => {
            inputContainer.style.borderColor = 'transparent';
        }, 3000);
        
        // Could be enhanced with a proper notification system
        console.warn('Input error:', message);
    }
    
    /**
     * Show edit validation error
     */
    showEditError(message) {
        const editInput = this.elements.editTaskInput;
        editInput.style.borderColor = 'var(--danger-color)';
        
        setTimeout(() => {
            editInput.style.borderColor = 'var(--gray-200)';
        }, 3000);
        
        console.warn('Edit error:', message);
    }
    
    /**
     * Show success feedback
     */
    showSuccessFeedback() {
        const addBtn = this.elements.addTaskBtn;
        const originalBg = addBtn.style.backgroundColor;
        
        addBtn.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
            addBtn.style.backgroundColor = originalBg;
        }, 500);
    }
    
    /**
     * Show general error message
     */
    showError(message) {
        // In a real app, this would show a proper notification
        alert(message);
    }
    
    /**
     * Export tasks as JSON (bonus feature)
     */
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('Tasks exported');
    }
    
    /**
     * Import tasks from JSON file (bonus feature)
     */
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks;
                    this.saveTasks();
                    this.render();
                    console.log('Tasks imported successfully');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Import failed:', error);
                this.showError('Failed to import tasks. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Get app statistics
     */
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
            total,
            completed,
            pending,
            completionRate,
            tasksCreatedToday: this.tasks.filter(t => 
                new Date(t.createdAt).toDateString() === new Date().toDateString()
            ).length
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.todoApp = new TodoApp();
    
    // Expose some methods for console access (debugging)
    window.todoApp.exportTasks = window.todoApp.exportTasks.bind(window.todoApp);
    window.todoApp.getStats = window.todoApp.getStats.bind(window.todoApp);
    
    // Add some helpful console messages
    console.log('%c🚀 Todo App Loaded!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('💡 Tip: Use Ctrl+/ (or Cmd+/) to focus on the input field');
    console.log('📊 Type todoApp.getStats() to see your task statistics');
    console.log('💾 Type todoApp.exportTasks() to backup your tasks');
});

// Service Worker registration for future PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be implemented here for offline functionality
        console.log('Service Worker support detected');
    });
}

// Handle app visibility changes to save data
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.todoApp) {
        window.todoApp.saveTasks();
        console.log('App hidden - tasks saved');
    }
});

// Auto-save every 30 seconds as a backup
setInterval(() => {
    if (window.todoApp && window.todoApp.tasks.length > 0) {
        window.todoApp.saveTasks();
    }
}, 30000);
