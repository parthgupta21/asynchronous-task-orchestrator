import { TASK_STATUS, Task } from "./core/task.js";

// // 1. Create a dummy executor (what the task will actually do later)
// const sampleExecutor = async () => {
//     console.log("Running logic...");
// };

// // 2. Instantiate a new Task
// const myTask = new Task(1, "Download Data", sampleExecutor);

// // 3. Test transitions
// console.log(myTask);
// myTask.transition(TASK_STATUS.QUEUED);
// myTask.transition(TASK_STATUS.RUNNING);

import { Scheduler } from './core/scheduler.js';
import { Renderer } from "./ui/Renderer.js";

// Helper to create a "fake" delay (simulating network or heavy work)
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const scheduler = new Scheduler(2); // Only 2 at a time!

// // Create 5 tasks
// for (let i = 1; i <= 3; i++) {
//     const executor = async () => {
//         console.log(`[Work] Task ${i} is starting heavy work...`);
//         await delay(2000); // Wait 2 seconds
//         console.log(`[Work] Task ${i} is done!`);
//     };

//     const task = new Task(i, `Task-${i}`, executor);
//     scheduler.addTask(task);
// }

const scheduler = new Scheduler(3);

// const work = async (task) => {
//     try {
//         for (let i = 0; i < 10; i++) {
//             // This is the "checkpoint"
//             await task.checkSignal();

//             console.log(`%c Task ${task.id} working step ${i}...`, "color: #3498db");
//             await new Promise(r => setTimeout(r, 1000));
//         }
//     } catch (err) {
//         if (err.message === "TASK_CANCELLED") {
//             console.log("Task was successfully cancelled.");
//         } else {
//             throw err; // Re-throw real errors
//         }
//     }
// };

// // Pass the function properly.
// // We want the scheduler to call work(myTask)
// const myTask = new Task(1, "Controllable-Task", () => work(myTask));
// scheduler.addTask(myTask);

// setTimeout(() => {
//     console.log("%c --- TRIGGERING PAUSE ---", "color: #f1c40f; font-weight: bold");
//     scheduler.pauseTask(1);
// }, 2500);

// setTimeout(() => {
//     console.log("%c --- TRIGGERING RESUME ---", "color: #2ecc71; font-weight: bold");
//     scheduler.resumeTask(1);
// }, 5000);


// --- THE SUBSCRIBERS ---
// We can have as many listeners as we want!

// scheduler.on('task:queued', (task) => {
//     console.log(`%c [Event] Waiting: ${task.name}`, "color: #7f8c8d");
// });

// scheduler.on('task:started', (data) => {
//     console.log(`%c [Event] Rocket Launch! Task ${data.id} is now RUNNING`, "color: #3498db; font-weight: bold");
// });

// scheduler.on('task:completed', (id) => {
//     console.log(`%c [Event] Success! Task ${id} reached the finish line.`, "color: #27ae60; font-weight: bold");
// });

// // Now add a task and watch the "Radio Station" work
// const work = async () => {
//     await new Promise(r => setTimeout(r, 1000));
// };

// const t1 = new Task(1, "Event-Driven-Task", work);
// scheduler.addTask(t1);


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