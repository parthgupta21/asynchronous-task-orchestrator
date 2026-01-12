"use strict";

export class Toast { 
    static show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast toast-${type}';
        toast.textContent = message;

        let container = document.getElementById('toast-container');
        if (!container) { 
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500); 
        }, 3000);
    }
}
