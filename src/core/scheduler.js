"use strict";

import { TASK_STATUS } from './task.js';
import { EventEmitter } from './event.js'
import { StorageManager } from '../utils/storage.js';
export class Scheduler extends EventEmitter {
    constructor(maxConcurrency = 3) {
        super();
        this.maxConcurrency = maxConcurrency;
        this.queue = [];      
        this.running = [];    
        this.storage = new StorageManager();
        this.history = [];
    }

    addTask(task) {
        task.transition(TASK_STATUS.QUEUED);
        this.queue.push(task);

        this.emit('task:queued', { id: task.id, name: task.name });

        this.runNext();
    }
    runNext() {
        if (this.running.length < this.maxConcurrency && this.queue.length > 0) {
            const task = this.queue.shift();

            this.running.push(task);
            this.executeTask(task);
        }
    }

    async executeTask(task) {
        task.transition(TASK_STATUS.RUNNING);
        task.startedAt = Date.now();
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
            this.running = this.running.filter(t => t.id !== task.id);
            this.emit('task:finished', {
                id: task.id,
                slotsAvailable: this.maxConcurrency - this.running.length,
                status: task.status
            });
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
            this.emit('task:paused', taskId);
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
            this.emit('task:resumed', taskId);
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
        this.emit('task:canceled', taskId);
    }
}