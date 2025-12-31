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

