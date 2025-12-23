"use strict";

import { TASK_STATUS } from './task.js';
export class Scheduler {
    constructor(maxConcurrency = 2) {
        this.maxConcurrency = maxConcurrency;
        this.queue = [];      // Tasks waiting to start
        this.running = [];    // Tasks currently executing
    }

    /**
     * Adds a task to the system and tries to run it.
     */
    addTask(task) {
        task.transition(TASK_STATUS.QUEUED);
        this.queue.push(task);
        console.log(`Scheduler: Task ${task.id} added to queue. Queue size: ${this.queue.length}`);

        // Every time a task is added, we check if we can run something
        this._runNext();
    }

    /**
     * Prefixed with _ to indicate it's a "private" method.
     */
    _runNext() {
        // Condition: Is there space available and tasks waiting?
        if (this.running.length < this.maxConcurrency && this.queue.length > 0) {

            // Take the first task out of the queue (FIFO)
            const task = this.queue.shift();

            this.running.push(task);
            this._executeTask(task);
        }
    }

    /**
     * Handles the actual async execution of the task.
     */
    async _executeTask(task) {
        task.transition(TASK_STATUS.RUNNING);
        task.startedAt = Date.now();
        console.log("aaaaaaaa", task.startedAt)

        try {
            await task.executor();

            task.transition(TASK_STATUS.COMPLETED);
        } catch (error) {
            task.error = error;
            task.transition(TASK_STATUS.FAILED);
        } finally {
            task.completedAt = Date.now();

            // Task is done (Finished or Failed). Remove from running list.
            this.running = this.running.filter(t => t.id !== task.id);

            console.log(`Scheduler: Task ${task.id} finished. Slots available: ${this.maxConcurrency - this.running.length}`);

            // Critical: Try to run the next task in the queue!
            this._runNext();
        }
    }
}