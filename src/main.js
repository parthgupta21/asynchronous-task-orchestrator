import { TASK_STATUS, Task } from "./core/task.js";
import { Scheduler } from './core/scheduler.js';
import { Renderer } from "./ui/Renderer.js";

const scheduler = new Scheduler(3);
const renderer = new Renderer("task-container");

let taskCounter = 0;

// --- STEP 1: Listen to the Brain, Update the Eyes ---

scheduler.on('task:queued', (task) => {
    renderer.createTaskCard(task);
});

scheduler.on('task:started', (data) => {
    renderer.updateTaskStatus(data.id, 'RUNNING');
});

scheduler.on('task:completed', (taskId) => {
    renderer.updateTaskStatus(taskId, 'COMPLETED');
});

scheduler.on('task:failed', (data) => {
    renderer.updateTaskStatus(data.id, 'FAILED');
});

scheduler.on('task:finished', (data) => {
    console.log(`%c [Capacity Update] Task ${data.id} is done. Free Slots: ${data.slotsAvailable}`, "color: #9b59b6");
});

// --- STEP 2: Event Delegation (One listener for all buttons) ---

document.getElementById('task-container').addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const id = parseInt(e.target.dataset.id);

    if (!action || !id) return;

    if (action === 'pause') scheduler.pauseTask(id);
    if (action === 'resume') scheduler.resumeTask(id);
    if (action === 'cancel') scheduler.cancelTask(id);
});

// --- STEP 3: Handle Adding New Tasks ---

document.getElementById('add-task-btn').addEventListener('click', () => {
    taskCounter++;
    const id = taskCounter;

    // A simple task that "counts" so we can see it working
    const taskLogic = async (taskInstance) => {
        for (let i = 0; i < 10; i++) {
            await taskInstance.checkSignal(); // Milestone 3 check!
            console.log(`Task ${id} doing step ${i}`);
            await new Promise(r => setTimeout(r, 1000)); // 1 sec delay
        }
    };

    const t = new Task(id, `Task #${id}`, null);
    t.executor = () => taskLogic(t);

    scheduler.addTask(t);
});
const savedData = scheduler.storage.loadHistory();
savedData.forEach(taskData => {
    // 1. Rehydrate: Plain object -> Task Class
    const task = Task.fromJSON(taskData);

    // 2. Add to scheduler's history so it keeps tracking
    scheduler.history.push(task);

    // 3. Tell the Renderer to draw it!
    renderer.createTaskCard(task);
    renderer.updateTaskStatus(task.id, task.status);
});

document.getElementById('clear-history-btn').addEventListener('click', () => {
    // 1. Tell the scheduler to wipe its history array
    scheduler.history.forEach(task => task.destroy());
    scheduler.history = [];

    // 2. Clear the storage
    scheduler.storage.clear();

    // 3. Wipe the UI
    document.getElementById('task-container').innerHTML = '';

    console.log("Cleanup complete. Memory should be reclaimed soon.");
});