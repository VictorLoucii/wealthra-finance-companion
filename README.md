

---

# 📂 Project: Wealthra Finance Companion
[cite_start]**Sub-title**: *A Lightweight Personal Finance Companion for Zorvyn FinTech* [cite: 41]

### 📝 Project Overview
[cite_start]Wealthra is a mobile-first finance tracker designed to turn abstract spending into actionable daily habits[cite: 41, 43]. [cite_start]Moving away from the clutter of traditional banking apps, Wealthra focuses on a "high-frequency" user experience—making it effortless to log, track, and understand money in real-time[cite: 42, 44].

---

### 🚀 Core Requirements & Features
* [cite_start]**Command Center Dashboard**: An informative, non-crowded overview featuring **Global Balance**, **Monthly Income**, and **Monthly Expenses**[cite: 50, 53, 54, 55, 56, 63].
* [cite_start]**Dynamic "Time-Travel" Tracker**: A sophisticated month-to-month navigation system that updates all dashboard metrics, charts, and transaction lists based on the selected month[cite: 98, 110, 153].
* [cite_start]**Advanced Transaction Engine**: Full CRUD support (Create, Read, Update, Delete) with a unified modal-driven input flow[cite: 65, 73, 74, 75, 76].
* [cite_start]**Insights Screen (Expense Tracker)**: A dedicated section providing a **Category Breakdown** and identifying the **Highest Spending Category** via a dynamic doughnut chart[cite: 93, 94, 96, 99].
* [cite_start]**Goal Feature: Smart Budgeting**: A budget limit tracker that provides immediate visual feedback through a "Traffic Light" progress system[cite: 83, 88, 90, 92].
* [cite_start]**High-Performance Search**: Real-time, case-insensitive transaction filtering with dedicated **Empty States** for missing data[cite: 80, 113].

---

### 🛠️ Tech Stack & Architecture
* [cite_start]**Framework**: React Native (Expo SDK 54) with **TypeScript** for type-safe financial logic[cite: 34, 35, 36].
* [cite_start]**State Management**: **Zustand** with persistent middleware for a robust, offline-first experience[cite: 131, 135, 145, 167].
* [cite_start]**Data Handling**: Utilizes a `monthKey` mapping strategy (`YYYY-MM`) to isolate budgets and transactions, preventing data leakage across months[cite: 119, 126, 162].
* [cite_start]**UI/UX Components**: `@shopify/flash-list` for buttery-smooth scrolling and **Lucide Icons** for a clean, professional aesthetic[cite: 130, 132, 155].

---

### 💡 Product Thinking & Design Assumptions
[cite_start]In alignment with the assignment’s focus on "Reasonable Assumptions" and "Polish over Complexity," Wealthra implements several specific design choices[cite: 28, 29, 30]:

1.  [cite_start]**The "Global Wallet" Logic**: While the budget and transactions "time-travel" per month, the top-right **Balance Chip** remains a global sum[cite: 54, 153]. This provides the user with an immutable "Ground Truth" of their actual cash-on-hand regardless of which historical month they are viewing.
2.  [cite_start]**Traffic Light Budgeting**: To drive habit change, the budget progress bar shifts colors: **Green** (Healthy), **Orange** (Warning @ 70%), and **Red** (Critical @ 90%)[cite: 90, 92]. [cite_start]This nudges users toward smarter spending *before* they exceed their goals[cite: 153].
3.  [cite_start]**Validated Interaction**: To ensure data reliability, amount fields are numeric-restricted, and categories are pre-selected to maintain clean insights for the doughnut chart[cite: 111, 116].
4.  [cite_start]**Zero-Friction Navigation**: Tapping a dashboard metric (like "Transactions") automatically triggers the relevant action (opening the Add Modal), reducing the "taps-to-task" ratio[cite: 110, 155].

---

### ⚙️ Setup Instructions
[cite_start]Follow these steps to evaluate the application on your local machine or physical device[cite: 171, 188]:

```bash
# 1. Clone the repository
git clone https://github.com/VictorLoucii/wealthra-finance-companion
cd wealthra-finance-companion

# 2. Install dependencies
npm install

# 3. Start the project
npx expo start
```
[cite_start]*Note: Using the **Expo Go** app on a physical device is recommended to experience the touch-friendly interactions and responsiveness firsthand[cite: 116, 168, 169].*

---

### 🛠️ Future Roadmap
[cite_start]Meaningful enhancements planned for future iterations[cite: 139, 141, 150]:
* [cite_start]**Biometric Lock**: Securing financial data via FaceID/TouchID[cite: 148].
* [cite_start]**Dark Mode Support**: Implementing a system-wide theme toggle[cite: 142].
* [cite_start]**Data Export**: CSV/PDF generation for tax and personal records[cite: 146].

---
