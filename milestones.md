

# Asynchronous Task Orchestrator

### **Engineering Progress & Design Document**

## 1. Project Concept

The **Asynchronous Task Orchestrator** is a framework-less JavaScript system designed to manage complex, concurrent asynchronous operations. While a typical "To-Do" app merely tracks strings, this system manages **live execution contexts**, allowing for precise control over the JavaScript Event Loop.

### **Core Objectives**

* **Concurrency Control:** Limiting how many tasks run simultaneously.
* **Cooperative Async:** Implementing Pause/Resume/Cancel on traditionally "unstoppable" Promises.
* **Decoupled Architecture:** Using a Pub/Sub model to separate the Engine (Logic) from the Renderer (UI).
* **Memory Discipline:** Ensuring zero memory leaks through explicit lifecycle management.

---

## 2. System Architecture

The project is built using a layered approach to ensure **Separation of Concerns**:

1. **Task Model (Core):** The individual unit of work.
2. **Scheduler (Engine):** The brain that manages the queue and concurrency.
3. **Event System (Emitter):** The communication bridge.
4. **Persistence (Storage):** The data survival layer.
5. **Renderer (UI):** The visual representation (DOM).

---

## 3. Milestone Execution & Solutions

### **Milestone 1: The Task Core**

* **Goal:** Create a robust state machine for tasks.
* **Solution:** Built a `Task` class with a `transition()` method. This prevents illegal states (e.g., a "Completed" task cannot suddenly become "Paused").
* **Learning:** Mastered **Prototype-based methods** to ensure that 1,000 tasks share the same logic without consuming 1,000x the memory.

### **Milestone 2: The Scheduler (Concurrency)**

* **Goal:** Handle a "Waitlist" for tasks.
* **Solution:** Implemented a **FIFO (First-In-First-Out) Queue**. The Scheduler uses a `maxConcurrency` guard. When a task finishes, a `_runNext()` trigger automatically pulls the next task from the queue.
* **Learning:** Understood the **Event Loop**. We learned how to "wait" without "blocking"—allowing the browser to stay responsive while tasks process in the background.

### **Milestone 3: Pause, Resume, & Cancel**

* **Goal:** Stop and start an `async` function mid-execution.
* **Solution:** Developed a **Cooperative Checkpoint** system. Tasks periodically `await task.checkSignals()`. If the scheduler sets a `pausePromise`, the task "freezes" on that line of code until the promise is resolved.
* **Learning:** Used **Promises as Locks**. This is a high-level concept where a promise's `resolve` function is stored and triggered externally to control flow.

### **Milestone 4: The Event System (Pub/Sub)**

* **Goal:** Remove `console.log` from the core engine.
* **Solution:** Created a custom `EventEmitter` class. The Scheduler now "emits" events (`task:started`, `task:completed`), and any other part of the app can "subscribe" to them.
* **Learning:** Practiced the **Open-Closed Principle**. We can now add new features (like sound effects or logs) without changing the Scheduler's code.

### **Milestone 5: The Presentation Layer (DOM)**

* **Goal:** Create a visual dashboard without React/Vue.
* **Solution:** Built a `Renderer` class that uses `document.createElement`. Implemented **Event Delegation** by putting one listener on the parent container to handle clicks for all task buttons using `e.target.dataset`.
* **Learning:** Mastered **DOM Manipulation** and **Attribute Selectors**. We linked CSS colors directly to JavaScript data attributes (`data-status`).

### **Milestone 6: Persistence & Rehydration**

* **Goal:** Save data so it survives a page refresh.
* **Solution:** Used `localStorage` for storage. Since JSON destroys class methods, we implemented a `static fromJSON()` method to **Rehydrate** objects—manually re-linking plain data to the `Task` prototype.
* **Learning:** Deep dive into **Serialization**. Learned that "Data" can be saved, but "Behavior" (functions) must be reconstructed.

### **Milestone 7: Memory Audit**

* **Goal:** Ensure the app doesn't slow down over time.
* **Solution:** Added a `destroy()` sequence that nulls out references and event listeners. Used **Chrome DevTools Heap Snapshots** to verify that deleted tasks are actually removed from RAM.
* **Learning:** Learned how the **Garbage Collector** works and how "stale references" cause memory leaks.

---

## 4. Final Technical Summary

| Feature | Engineering Solution |
| --- | --- |
| **Concurrency** | FIFO Queue + Running Counter |
| **Task Control** | Promise-based Checkpoints |
| **Communication** | Custom EventEmitter (Observer Pattern) |
| **UI Updates** | State-driven DOM Manipulation |
| **Storage** | JSON Serialization + Object Rehydration |
| **Stability** | Manual Reference Clearing (Teardown) |

---

## 5. Conclusion

This project demonstrates that complex application logic can be handled elegantly with **Vanilla JavaScript**. By avoiding frameworks, we gained a deep understanding of how the browser manages memory, execution, and the user interface.



# AtlasJS Task Orchestrator

A simple way to say it:

This project is a **system that runs many tasks in the browser at the same time**, controls them, and shows exactly what is happening as they run. You can **start, pause, resume, cancel, queue, and observe tasks** while the application makes sure everything stays consistent and does not leak memory.

It is like a **mini task manager or mini operating system inside your browser**.

---

## What this application does

This application:

* runs multiple asynchronous tasks
* limits how many tasks can run at the same time
* automatically queues extra tasks
* allows you to pause, resume, and cancel tasks
* shows each task’s live status on the screen
* remembers tasks even after you refresh the page
* cleans up memory properly so the browser does not slowly slow down

Everything happens in **plain JavaScript**, directly in the browser, without frameworks.

---

## What a “task” means here

A **task** is simply a job the browser needs to do.
Examples:

* wait for a few seconds
* process some data
* simulate downloading something
* simulate long-running async work

Every task in this system has:

* an ID
* a name
* a current state
* timestamps
* controls to pause, resume, or cancel
* logic that determines how it runs

---

## Task lifecycle (simple explanation)

Each task moves through clear stages:

1. Created
2. Queued
3. Running
4. Paused
5. Completed
6. Failed
7. Canceled

The program does **not** allow illegal movement like:

* jumping from Completed back to Running
* canceling something already Finished
* resuming something that never started

This is enforced by a **state machine** inside the Task object.

---

## Concurrency control (what runs at once)

The system includes a **scheduler**.

You tell it:

> “Only run N tasks at the same time”

Example:

* concurrency = 3
* you start 10 tasks
* 3 tasks run immediately
* 7 tasks wait in queue
* when 1 finishes, the next one automatically starts

The queue is **FIFO**
First task added → first task executed.

---

## Pause, resume, and cancel explained simply

There is no “magic stop button” in JavaScript.
So instead, this application uses **cooperative control**.

Inside each task there are **checkpoints** that say:

> “Stop here if user has paused”

So when you hit pause:

* the task reaches the next checkpoint
* it stops and waits
* when you resume, it continues from the same place

Cancel works by signaling:

> “Do not continue running, shut yourself down”

This way tasks **behave safely** instead of being force-stopped.

---

## Event system (how parts talk to each other)

The program contains its own **EventEmitter**.

The system emits events such as:

* task created
* task queued
* task started
* task paused
* task resumed
* task completed
* task failed
* task canceled

Other components listen to these events.

This means:

* the scheduler does scheduling
* the UI only listens and updates
* no part is tightly glued together

---

## User interface (what the user sees)

The UI is built using **plain DOM methods** like:

* document.createElement
* dataset attributes
* event delegation

You can:

* see all tasks on screen
* see exactly which state each task is in
* click buttons to control tasks

There is no React, no Vue, no frameworks.

---

## Persistence (what happens on page refresh)

If you refresh the page:

* task history is still there
* tasks are restored from JSON
* the app rebuilds task objects with proper prototypes

Storage used:

* localStorage

Because JSON cannot store class methods, the project includes:

* custom `fromJSON()` function
* rehydration logic to restore behavior

---

## Memory safety and cleanup

Long-running applications can leak memory.

This project includes:

* `destroy()` method for tasks
* removal of event listeners
* clearing references
* releasing DOM nodes

Memory was actually verified using:

* Chrome DevTools Heap Snapshots

So when tasks are deleted, the browser really frees them.

---

## What you can do with the app in practice

With this application you can:

* start many tasks at once
* watch them move between states
* pause one or many
* resume them later
* cancel tasks completely
* observe queued tasks waiting their turn
* refresh the page and see saved tasks
* delete tasks and verify they do not stick in memory

---

## Internal components summary

The application is made of several main parts:

* Task class
* Scheduler
* EventEmitter
* Renderer (UI handler)
* Persistence module (localStorage + JSON)
* Memory cleanup utilities

They work together but stay separated.

---

## What this project actually is in one sentence

A browser-based system that **runs, schedules, controls, visualizes, and safely cleans up asynchronous tasks**, with real pause or resume or cancel support and persistent state.

