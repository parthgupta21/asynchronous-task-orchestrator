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

// Helper to create a "fake" delay (simulating network or heavy work)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scheduler = new Scheduler(2); // Only 2 at a time!

// Create 5 tasks
for (let i = 1; i <= 3; i++) {
    const executor = async () => {
        console.log(`[Work] Task ${i} is starting heavy work...`);
        await delay(2000); // Wait 2 seconds
        console.log(`[Work] Task ${i} is done!`);
    };

    const task = new Task(i, `Task-${i}`, executor);
    scheduler.addTask(task);
}