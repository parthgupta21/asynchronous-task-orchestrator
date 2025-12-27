"use strict";

import { TASK_STATUS } from './task.js';
import { EventEmitter } from './event.js'
import { StorageManager } from '../utils/storage.js';
export class Scheduler extends EventEmitter {
    constructor(maxConcurrency = 3) {
        super();
        this.maxConcurrency = maxConcurrency;
        this.queue = [];      // Tasks waiting to start
        this.running = [];    // Tasks currently executing
        this.storage = new StorageManager();
        this.history = [];
    }

    /**
     * Adds a task to the system and tries to run it.
     */
    addTask(task) {
        task.transition(TASK_STATUS.QUEUED);
        this.queue.push(task);

        this.emit('task:queued', { id: task.id, name: task.name });

        // Every time a task is added, we check if we can run something
        this.runNext();
    }
    runNext() {
        // Condition: Is there space available and tasks waiting?
        if (this.running.length < this.maxConcurrency && this.queue.length > 0) {

            // Take the first task out of the queue (FIFO)
            const task = this.queue.shift();

            this.running.push(task);
            this.executeTask(task);
        }
    }

    /**
     * Handles the actual async execution of the task.
     */
    async executeTask(task) {
        task.transition(TASK_STATUS.RUNNING);
        task.startedAt = Date.now();
        // console.log("aaaaaaaa", task.startedAt)
        this.emit('task:started', { id: task.id, status: task.status });

        try {
            await task.executor();
            task.transition(TASK_STATUS.COMPLETED);
            this.emit('task:completed', task.id);
        } catch (error) {
            task.error = error;
            task.transition(TASK_STATUS.FAILED);
            this.emit('task:failed', { id: task.id, error: error.message });
        } finally {
            task.completedAt = Date.now();

            // Task is done (Finished or Failed). Remove from running list.
            this.running = this.running.filter(t => t.id !== task.id);

            console.log(`Scheduler: Task ${task.id} finished. Slots available: ${this.maxConcurrency - this.running.length}`);

            if (task.status === 'COMPLETED' || task.status === 'FAILED') {
                this.history.push(task);
                this.storage.saveHistory(this.history);
            }
            // Critical: Try to run the next task in the queue!
            this.runNext();
        }
    }

    pauseTask(taskId) { 
        const task = this.running.find(t => t.id === taskId);
        if (task) {
            task.control.isPaused = true;
            task.transition(TASK_STATUS.PAUSED);
        }
    }
    resumeTask(taskId) {
        const task = this.running.find(t => t.id === taskId);
        if (task && task.control.isPaused) {
            task.control.isPaused = false;
            task.transition(TASK_STATUS.RUNNING);
            if (task.control.resolvePause) {
                task.control.resolvePause();
            }
        }
    }

    cancelTask(taskId) {
        let task = this.running.find(t => t.id === taskId);
        if (!task) {
            task = this.queue.find(t => t.id === taskId);
            this.queue = this.queue.filter(t => t.id !== taskId);
        }
        task.control.isCancelled = true;
        task.transition(TASK_STATUS.CANCELED);
        if (task.control.resolvePause) {
            task.control.resolvePause();
        }
    }
}