# AtlasJS Task Orchestrator

## 1. Introduction

AtlasJS Task Orchestrator is a browser application written in plain JavaScript. It runs many asynchronous tasks, controls how they execute, and shows their progress in a live interface. The system can start tasks, limit how many run at one time, pause and resume running tasks, cancel tasks, and store task history across page reloads. It includes explicit memory cleanup to prevent leaks during long use.

The project runs inside the browser. It does not rely on external frameworks.

The goal of the system is clear control over asynchronous task execution.

---

## 2. System Overview

AtlasJS consists of several cooperating parts. Each part has a single main responsibility.

* Task Model handles one unit of work
* Scheduler controls execution order and concurrency
* Event System sends messages between parts
* Renderer updates the user interface
* Persistence layer stores task data in localStorage
* Memory management layer removes unused objects

These parts work together but remain separate. The logic does not mix with the UI, and storage does not control scheduling. This keeps the system predictable and easy to reason about.

---

## 3. System Architecture

<p align="center">
  <img src="./docs/architecture and control flow.svg" alt="AtlasJS Task Orchestrator Architecture Diagram" width="100%">
</p>

---

## 4. Core Concepts

### 4.1 Tasks

A task represents an asynchronous job. A job can be anything that takes time, such as simulated downloads or timers. Each task has identity, state, timestamps, and control actions.

### 4.2 Lifecycle States

Each task moves through a fixed lifecycle:

1. Created
2. Queued
3. Running
4. Paused
5. Completed
6. Failed
7. Canceled


The system prevents illegal transitions. A task that has completed cannot return to running. A task that was never started cannot resume. A state machine object enforces these rules inside the Task model.

### 4.3 Scheduler

The scheduler controls how many tasks run at a time. If more tasks exist than the allowed limit, extra tasks enter a queue. When a running task finishes, the next task in the queue starts. The queue uses First In First Out behavior. This produces deterministic results.

### 4.4 Cooperative Control

JavaScript cannot forcefully pause a running async function. AtlasJS uses cooperative checkpoints. A task reaches checkpoints where it checks signals from the system. At these points it can pause, continue, or stop. This keeps control safe and predictable.

---

## 5. Architecture

The system follows a layered architecture.

* Presentation Layer
* Application Logic Layer
* Persistence Layer

### 5.1 High Level Flow

User interacts with UI
UI triggers task creation or control actions
Scheduler manages execution
Event system reports state changes
Renderer updates UI
Storage saves task data

---

## 6. Component Design

### 6.1 Task Model

The Task class represents a single unit of work. It encapsulates:

* unique ID
* name or description
* current state
* timestamps for start and completion
* control signals such as pause or cancel flags

State transition rules exist in a single transition method. This method checks allowed state changes and rejects invalid moves. This avoids mixed or impossible states.

### 6.2 Scheduler

The scheduler maintains:

* active tasks
* waiting queue
* maximum concurrency setting

It exposes functions to add tasks, start execution, and handle completion. When a running task ends, the scheduler promotes the next queued task into execution. It tracks counts rather than threads, since all code runs in a single JavaScript event loop.

### 6.3 Cooperative Pause and Resume

Each task checks a control method during execution. This method returns when the task may proceed. When the system sets a pause signal, these checks block progress. When resume occurs, the signal clears, and execution continues. Cancel signals end the task early in a controlled way.

This avoids unsafe forced interruption.

### 6.4 Event System

The event emitter broadcasts task lifecycle changes. Examples include:

* task created
* task queued
* task started
* task paused
* task resumed
* task completed
* task failed
* task canceled

The user interface subscribes to these events. Core logic does not need to know about visual layout. This produces loose coupling between components.

### 6.5 Renderer

The Renderer updates the Document Object Model using:

* document.createElement
* dataset attributes
* event delegation

Each task appears as a UI entry showing state and controls. Because event delegation is used, the application attaches a small number of event listeners. This reduces risk of leaks and improves clarity.

### 6.6 Persistence Layer

The persistence layer uses localStorage. Tasks serialize to JSON before storage. JSON does not preserve methods or prototypes, so a rehydration process restores Task instances using a static fromJSON method.

After page reload, the application:

* reads stored JSON
* reconstructs Task objects
* restores state and identity
* binds methods again

This gives consistent behavior after reloads.

### 6.7 Memory Management

The system includes explicit cleanup routines:

* destroy methods on tasks
* removal of event listeners
* clearing of references
* release of DOM nodes

Chrome DevTools heap snapshots verify that objects become unreachable after cleanup. This shows that tasks do not accumulate in memory over time.

---

## 7. Execution Model

The browser runs JavaScript using a single event loop. Tasks execute asynchronously using promises and timers. AtlasJS does not create threads. Instead it coordinates asynchronous operations and ensures consistent lifecycle control.

The scheduler interacts with asynchronous functions through:

* promise resolution
* queue promotion
* cooperative checkpoints

This keeps UI responsive while tasks run.

---

## 8. Error Handling

The system treats each failure as part of normal lifecycle. Failed tasks move into Failed state. Failure does not crash the scheduler. Errors propagate through the event system so UI and logs can react.

---

## 9. User Interface Behavior

The interface displays:

* lists of tasks by state
* action buttons for control
* live status updates

Users can:

* create tasks
* pause active tasks
* resume paused tasks
* cancel running or queued tasks
* clear completed tasks

All elements update in real time as events occur.

---

## 10. Data Storage Format

Stored values include:

* task ID
* name
* state
* timestamps
* metadata required to restore execution model

No function bodies or closures are serialized. Rehydration reconstructs behavior safely on reload.

---

## 11. System Limits and Scope

The application runs inside a single browser tab. It controls asynchronous logic but does not provide real multithreading. It assumes cooperative tasks that check for signals. It persists simple task data but not ongoing execution state mid-await beyond checkpoint integrity.

---

## 12. Technical Summary

AtlasJS Task Orchestrator provides:

* task lifecycle state control
* deterministic FIFO scheduling with concurrency cap
* cooperative pause, resume, and cancel
* event based coordination
* simple UI driven by state
* persistence with rehydration
* explicit memory cleanup verified by tooling

It acts as a contained execution environment for browser tasks.