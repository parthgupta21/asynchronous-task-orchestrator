"use strict";

export class Renderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-${task.id}`;
        card.setAttribute('data-status', task.status);

        card.innerHTML = `
            <div class="task-header">
                <span class="task-name">${task.name}</span>
                <span class="status-badge">${task.status}</span>
            </div>
            <div class="task-body">
                <div class="progress-bar"><div class="progress-fill" id="progress-${task.id}"></div></div>
            </div>
            <div class="task-actions">
                <button data-action="pause" data-id="${task.id}">Pause</button>
                <button data-action="resume" data-id="${task.id}">Resume</button>
                <button data-action="cancel" data-id="${task.id}">Cancel</button>
            </div>
        `;

        this.container.appendChild(card);
    }
    updateTaskStatus(taskId, status) {
        const card = document.getElementById(`task-${taskId}`);
        if (!card) return;

        card.setAttribute('data-status', status);
        const badge = card.querySelector('.status-badge');
        if (badge) badge.textContent = status;

        // Update progress bar color/width if finished
        const fill = document.getElementById(`progress-${taskId}`);
        if (status === 'COMPLETED') fill.style.width = '100%';
    }
}