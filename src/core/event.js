export class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event - The name of the event
     * @param {function} callback - The function to run when event occurs
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        // console.log(`11111111111: ${event}, 22222222222:`, callback, "33333333333:", this.listeners[event]);
    }
    /**
         * Broadcast an event to all subscribers
         * @param {string} event - The name of the event
         * @param {any} data - Data to pass to the subscribers
         */
    emit(event, data) {
        if (!this.listeners[event]) return;

        // console.log(`xxxxxxxxxxxxxxx: ${event} yyyyyyyyyyyyyyy:`, data, "zzzzzzzzzzz:", this.listeners[event]);

        // Loop through all functions registered for this event and run them
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
}