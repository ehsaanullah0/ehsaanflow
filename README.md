<div align="center">
    
# 🌊 EHSAAN FLOW

# POWERFUL PRIJECT AND TASK MANAGER, COMPLETELY OFFLINE
# 🔗 [**ehsaanflow.ai.studio**](https://ehsaanflow.ai.studio/)

<p>
  <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/Android/android2.svg">&nbsp;
  <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/AndroidStudio/androidstudio2.svg">&nbsp;
  <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/Kotlin/kotlin2.svg">&nbsp;
  <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/LicenceGPLv3/licencegplv32.svg">
</p>


### A calm, powerful, local-first workspace for getting things done.

**Tasks. · Planning. · Habits of work. · Reflection. · Progress.**

EHSAAN Flow brings your everyday productivity into one focused workspace — combining **task management, Kanban, calendar planning, weekly views, productivity analytics, and journaling** without requiring an account or a cloud backend.

## **Your work stays in your browser.Your workflow stays yours.**

---

<p align="center">

[![Live App](https://img.shields.io/badge/🌐_Live_App-EHSAAN_Flow-E7AC08?style=for-the-badge)](https://ehsaanflow.ai.studio/)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge\&logo=github)](https://github.com/)
[![License](https://img.shields.io/badge/License-GPL--3.0-E7AC08?style=for-the-badge)](#-license)

</p>

</div>

---

# 🌐 Try EHSAAN Flow

### **Live application**

## 👉 https://ehsaanflow.ai.studio/

---

## ✨ Why EHSAAN Flow?

Most productivity apps make you choose between simplicity and power.

EHSAAN Flow tries to keep both.

Create a task in seconds.
Plan your week.
Move work through a Kanban board.
See your progress.
Write down what happened.
Then get back to doing the work.

No unnecessary account system.
No complicated setup.
No dependency on a cloud database.

Just **open → work → save → continue.**

---

# 📋 Task Management

Everything you need for serious task management without turning the interface into a cockpit.

### Create & organize

* ✅ Tasks and subtasks
* 📌 Pin important tasks
* 🚨 Priority levels
* 🏷️ Tags
* 🎨 Custom categories
* 📝 Notes
* 📅 Due dates
* ⏰ Due times
* 🔄 Rescheduling
* 🔎 Search
* 🧹 Filtering
* ↕️ Sorting

### Work with tasks in bulk

Select multiple tasks and perform actions together:

* Complete
* Delete
* Reschedule
* Change priority

Because sometimes productivity means dealing with **17 tasks at once**.

---

# 🧩 Threaded Subtasks

Break large work into smaller pieces without losing the relationship between them.

```text
Launch Website
│
├── Design
│   ├── Landing page
│   └── Mobile layout
│
├── Development
│   ├── Build components
│   └── Connect data
│
└── Launch
    ├── Final testing
    └── Deploy
```

Track progress at both the task and subtask level.

---

# 🗂️ Kanban

Turn your tasks into a visual workflow.

Move from:

**Ideas → Planned → In Progress → Completed**

or organize the board around other dimensions such as:

* Status
* Priority
* Category
* Date

Your tasks don't change.

**Only the way you see them does.**

---

# 📊 Productivity Intelligence

EHSAAN Flow doesn't stop at counting completed tasks.

The statistics system tracks patterns such as:

* Total tasks
* Completed tasks
* Open tasks
* Overdue tasks
* Completion rate
* On-time completion
* Subtask completion
* Priority distribution
* Category distribution
* Tag performance
* Daily activity
* Completion velocity
* Peak completion weekday
* Productivity trends

### Your data becomes feedback.

Not judgment.

The goal isn't to make you feel productive.

**It's to help you understand your productivity.**

---

# 📔 Journal

Productivity isn't only about what you finished.

Sometimes it's about understanding **how the work felt**.

EHSAAN Flow includes a built-in journal for capturing:

* ✍️ Daily entries
* 😊 Mood
* ⚡ Energy
* 🌟 Highlights
* 🙏 Gratitude
* 🏷️ Tags
* 🔎 Search
* 📅 Calendar history
* 📈 Mood & energy trends
* 🔥 Journal streaks
* 🕰️ Historical timelines

Look back at individual days or explore your history over time.

Because sometimes the most useful productivity data isn't a number.

It's a sentence you wrote six months ago.

---

# 💾 Local-First by Design

EHSAAN Flow is built around a simple principle:

> **Your productivity data belongs to you.**

The core application works with browser storage rather than requiring a cloud database.

```text
Your Browser
     │
     ├── Tasks
     ├── Subtasks
     ├── Categories
     ├── Journal
     ├── Settings
     └── Statistics
           │
           ↓
      Local Storage
```

### That means:

* 🚫 No mandatory account
* 🚫 No cloud database required
* 🚫 No server dependency for your core data
* ✅ Works locally
* ✅ Data survives page refreshes
* ✅ Fast access
* ✅ Your data stays in your browser

---

# 📦 Backup & Restore

Local-first shouldn't mean **easy to lose**.

EHSAAN Flow includes JSON data export and import.

### Export

Create a portable backup of your data.

### Import

Restore your data when needed.

Import supports:

**Merge** — combine imported data with existing data.

**Replace** — completely replace the current dataset.

Your productivity data shouldn't be trapped inside an app.

---

# 🧠 Built With

EHSAAN Flow is built using modern web technologies:

<p align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![LocalStorage](https://img.shields.io/badge/Local--First-LocalStorage-E7AC08?style=for-the-badge)

</p>

---

# 🏗️ Project Structure

```text
EHSAAN Flow
│
├── App.tsx
│
├── components/
│   ├── TodayDashboard
│   ├── TasksView
│   ├── KanbanBoardView
│   ├── CalendarView
│   ├── WeeklyView
│   ├── OverallStatsView
│   ├── JournalView
│   ├── SettingsView
│   ├── QuickAddModal
│   ├── TaskDetailDrawer
│   ├── DayDetailModal
│   ├── FirstLaunchModal
│   └── ThreadedSubtasks
│
├── utils/
│   ├── storage.ts
│   ├── dateUtils.ts
│   ├── nlpParser.ts
│   └── colorUtils.ts
│
└── types.ts
```

The project is intentionally component-driven so individual parts of the experience can evolve without rebuilding the entire application.

---

# 🔐 Privacy Philosophy

EHSAAN Flow follows a simple approach:

### Local first.

Your tasks and journal are personal data.

The application therefore avoids making a cloud account a prerequisite for using the core experience.

Your browser is the primary home for your data.

**You control your data.
You can export it.
You can restore it.**

---

# 📄 License

This project is released under the **GNU General Public License v3.0**.

See [`LICENSE`](LICENSE) for details.

---

<p align="center">

### 🌊 EHSAAN Flow

**Plan less. Flow more.**

Made with care by **EHSAAN**

</p>
