# 📂 Project: Wealthra Finance Companion
**Sub-title**: *A Lightweight Personal Finance Companion for Zorvyn FinTech*

### 📝 Project Overview
Wealthra is a mobile-first finance tracker designed to turn abstract spending into actionable daily habits. Moving away from the clutter of traditional banking apps, Wealthra focuses on a "high-frequency" user experience—making it effortless to log, track, and understand money in real-time.

---

### 🚀 Core Requirements & Features
* **Command Center Dashboard**: An informative overview featuring **Global Balance**, **Monthly Income**, and **Monthly Expenses**.
* **Dynamic Light/Dark Mode**: A system-wide, professional theme toggle built with centralized semantic color mapping, ensuring a premium and accessible experience in both high-light and low-light environments.
* **Localization & Multi-Currency**: Built-in support for **Indian Rupees (₹)** and **US Dollars ($)**. Uses `Intl.NumberFormat` with the `en-IN` locale to ensure correct comma placement (e.g., 1,00,000) for Indian users.
* **Dynamic "Time-Travel" Tracker**: A sophisticated month-to-month navigation system that updates all dashboard metrics, charts, and transaction lists based on the selected month.
* **Advanced Transaction Engine**: Full CRUD support (Create, Read, Update, Delete) with a unified modal-driven input flow.
* **Insights Screen (Expense Tracker)**: A dedicated section providing a **Category Breakdown** and identifying the **Highest Spending Category** via a dynamic doughnut chart.
* **Goal Feature: Smart Budgeting**: A budget limit tracker that provides immediate visual feedback through a "Traffic Light" progress system.
* **High-Performance Search**: Real-time, case-insensitive transaction filtering with dedicated **Empty States** for missing data.

---

### 🛠️ Tech Stack & Architecture
* **Framework**: React Native (Expo SDK 54) with **TypeScript** for type-safe financial logic.
* **State Management**: **Zustand** with **AsyncStorage** persistence middleware for a robust, offline-first experience.
* **Data Handling**: Utilizes a `monthKey` mapping strategy (`YYYY-MM`) to isolate budgets and transactions, preventing data leakage across months.
* **UI/UX Components**: `@shopify/flash-list` for buttery-smooth scrolling and **Lucide Icons** for a clean, professional aesthetic.

---

### 💡 Product Thinking & Design Assumptions
In alignment with the assignment’s focus on "Reasonable Assumptions" and "Polish over Complexity," Wealthra implements several specific design choices:

1. **The "Global Wallet" Logic**: While the budget and transactions "time-travel" per month, the top-right **Balance Chip** remains a global sum. This provides the user with an immutable "Ground Truth" of their actual cash-on-hand regardless of which historical month they are viewing.
2. **Traffic Light Budgeting**: To drive habit change, the budget progress bar shifts colors: **Green** (Healthy), **Orange** (Warning @ 70%), and **Red** (Critical @ 90%). This nudges users toward smarter spending *before* they exceed their goals.
3. **Validated Interaction**: To ensure data reliability, amount fields are numeric-restricted, and categories are pre-selected to maintain clean insights for the doughnut chart.
4. **Zero-Friction Navigation**: Tapping a dashboard metric (like "Transactions") automatically triggers the relevant action (opening the Add Modal), reducing the "taps-to-task" ratio.

---

### ⚙️ Setup Instructions
Follow these steps to evaluate the application on your local machine or physical device:

```bash
# 1. Clone the repository
git clone [https://github.com/VictorLoucii/wealthra-finance-companion](https://github.com/VictorLoucii/wealthra-finance-companion)
cd wealthra-finance-companion

# 2. Install dependencies
npm install

# 3. Start the project node
npx expo start


# 3. Start the project emulator/device
npx expo run:android or npx expo run:android