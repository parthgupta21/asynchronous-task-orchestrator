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
}