"use strict"

export const TASK_STATUS = {
    CREATED: 'CREATED',
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELED: 'CANCELED'
};

export class Task {
    constructor(id, name, executor) {
        this.id = id;
        this.name = name;

        // The executor is the actual async function this task will run
        this.executor = executor;

        this.status = TASK_STATUS.CREATED;
        this.createdAt = Date.now();
        this.startedAt = null;
        this.completedAt = null;
        this.error = null;
        this.control = {
            isPaused: false,
            isCancelled: false,
            pausePromise: null,
            resolvePause: null
        };

    }

    /**
     * Static method to turn a plain JSON object back into a Task instance
     */
    static fromJSON(json) {
        const task = new Task(json.id, json.name, null);

        // Copy all stored properties back onto the new object
        Object.assign(task, json);

        // Ensure the control flags are reset/re-initialized
        task.control = {
            isPaused: false,
            isCancelled: false,
            pausePromise: null,
            resolvePause: null
        };

        return task;
    }

    async checkSignal() {
        if (this.control.isCancelled) {
            throw new Error(`Task ${this.id} has been cancelled.`);
        }

        if (this.control.isPaused) { 
            console.log(`Task ${this.id} is pausing ...`);
            this.control.pausePromise = new Promise((resolve) => { 
                this.control.resolvePause = resolve;
            })
        }
        return this.control.pausePromise;
    }

    transition(newStatus) {
        const validStatuses = Object.values(TASK_STATUS);
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status transition: ${newStatus}`);
        }
        if (this.status === TASK_STATUS.COMPLETED || this.status === TASK_STATUS.FAILED) {
            console.warn(`Task ${this.id} is already finished. Cannot transition to ${newStatus}.`);
            return;
        }

        console.log(`Task ${this.id}: ${this.status} -> ${newStatus}`);
        this.status = newStatus;

    }

    destroy() {
        // Release references to help the Garbage Collector
        this.executor = null;
        this.control.pausePromise = null;
        this.control.resolvePause = null;
        console.log(`Memory: Task ${this.id} references cleared.`);
    }
}