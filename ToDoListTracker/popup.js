// Global tasks array
let tasks = [];

// Load tasks from localStorage (if any)
function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    tasks = tasks.filter(task => !task.completed);
    // Update localStorage with the cleaned tasks
    saveTasks();
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render the tasks list in the popup
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = ""; // Clear existing list

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";

    // Create the checkbox for completion
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    // Create the span for the task text
    const taskSpan = document.createElement("span");
    taskSpan.className = "task-text " + (task.completed ? "completed" : "incomplete");
    taskSpan.textContent = task.text;

    // Create the span for the deadline
    const deadlineSpan = document.createElement("span");
    deadlineSpan.className = "deadline";
    deadlineSpan.textContent = task.deadline;

    // Append elements
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(taskSpan);
    taskDiv.appendChild(deadlineSpan);
    taskList.appendChild(taskDiv);
  });
}

// Handle new task form submission
document.getElementById("newTaskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const taskTextInput = document.getElementById("taskText");
  const deadlineInput = document.getElementById("deadline");

  const taskText = taskTextInput.value.trim();
  const deadline = deadlineInput.value.trim();

  if (!taskText || !deadline) {
    return;
  }

  // Add new task to the list (default not completed)
  tasks.push({
    text: taskText,
    deadline: deadline,
    completed: false
  });
  saveTasks();
  renderTasks();

  // Clear input fields
  taskTextInput.value = "";
  deadlineInput.value = "";
});

// Initialize the tasks list on load
loadTasks();
renderTasks();
