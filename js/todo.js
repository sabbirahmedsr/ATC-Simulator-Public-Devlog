const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

const STORAGE_KEY = 'todo-items';

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Function to render all to-do items from the todos array
function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item.text;
        if (item.completed) {
            li.classList.add('completed');
        }
        li.dataset.index = index;

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.classList.add('delete-btn');
        li.appendChild(deleteButton);

        todoList.appendChild(li);
    });
}

// Function to save todos to localStorage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Function to add a new to-do item
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
        return; // Don't add empty items
    }

    todos.push({ text: text, completed: false });
    saveTodos();
    renderTodos();
    todoInput.value = '';
}

// Event listener for adding a new item via button click or Enter key
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Event delegation for marking as complete and deleting items
todoList.addEventListener('click', (e) => {
    const item = e.target.closest('li');
    if (!item) return;

    const index = item.dataset.index;

    // Check if the delete button was clicked
    if (e.target.closest('.delete-btn')) {
        todos.splice(index, 1);
    } else {
        // Toggle the completed status
        todos[index].completed = !todos[index].completed;
    }
    
    saveTodos();
    renderTodos();
});

// Render the initial list when the page loads
renderTodos();