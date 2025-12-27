"use strict";

export class StorageManager {
    constructor(key = 'orchestrator_history') {
        this.key = key;
    }

    /**
     * Saves an array of tasks to localStorage
     */
    saveHistory(tasks) {
        // We only want to save the data properties, not the functions
        const data = JSON.stringify(tasks);
        localStorage.setItem(this.key, data);
    }

    /**
     * Loads tasks from localStorage
     */
    loadHistory() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}