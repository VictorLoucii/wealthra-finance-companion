

-----

# 📂 Project: Wealthra Finance Companion

A lightweight personal finance app to help users track expenses, manage budgets, and stay in control of their money.

---

## 🎬 Demo

![App Demo](./screenshots/AppDemo.gif)

---

### 📱 App Preview (Light vs. Dark Mode)

| Feature | Light Mode | Dark Mode |
| :--- | :---: | :---: |
| **Dashboard** | ![Home](./screenshots/HomeScreen_Light.jpeg) | ![Home Dark](./screenshots/HomeScreen_Dark.jpeg) |
| **Budgeting** | ![Budget](./screenshots/BudgetScreen_Light.jpeg) | ![Budget Dark](./screenshots/BudgetScreen_Dark.jpeg) |
| **Analytics** | ![Expense](./screenshots/ExpenseScreen_Light.jpeg) | ![Expense Dark](./screenshots/ExpenseScreen_Dark.jpeg) |
| **History** | ![History](./screenshots/History_Light.jpeg) | ![History Dark](./screenshots/HistoryScreen_Dark.jpeg) |

### 💸 Transaction Flow

| Expense Entry | Income Entry |
| :---: | :---: |
| ![Expense](./screenshots/Transaction_Expense.jpeg) | ![Income](./screenshots/Transaction_Income.jpeg) |

-----

### 📝 Project Overview

Wealthra is a mobile-first finance tracker designed to turn abstract spending into actionable daily habits. Moving away from the clutter of traditional banking apps, Wealthra focuses on a "high-frequency" user experience—making it effortless to log, track, and understand money in real-time.

-----

### 🚀 Core Requirements & Features

  * **Command Center Dashboard**: An informative overview featuring **Global Balance** (editable cash-on-hand), **Monthly Income**, and **Monthly Expenses**.
  * **Editable Profile Customization**: Users can edit their username directly from the Home Screen, which automatically updates initials dynamically on the avatar badge across the application.
  * **Pre-filtered History Views & Slice Limits**: Slices Daily Spending to a maximum of 3 items, with a "View All" link redirecting to the History screen pre-filtered for expenses.
  * **Relative Date Headers**: Bold, lowercase relative dates (e.g. `today`, `1 day ago`, `2 days ago` ... `1 week ago`, etc.) displayed on the History Screen.
  * **Dynamic Light/Dark Mode**: A system-wide, professional theme toggle built with centralized semantic color mapping.
  * **Currency Value Engine**: Full support for **Indian Rupees (₹)** and **US Dollars ($)**. Unlike basic trackers, Wealthra performs real-time mathematical conversion of all historical transactions, budget limits, and initial balances when toggling currencies.
  * **Localization Polish**: Uses `Intl.NumberFormat` with the `en-IN` locale to ensure correct Indian numbering system comma placement (e.g., 1,00,000) for INR users.
  * **Dynamic "Time-Travel" Tracker**: A sophisticated month-to-month navigation system that updates all dashboard metrics based on the selected month.
  * **Insights Screen**: A dedicated section providing a **Category Breakdown** via a dynamic doughnut chart.
  * **Goal Feature: Custom Duration Budgeting**: Supports setting budgets either for a **Full Month** or a **Custom Duration (e.g., 7 Days, 14 Days, etc.)** with a "Traffic Light" progress system (**Green** $\to$ **Orange** $\to$ **Red**).
  * **Daily Target Budget & Spent Progress**: Displays the daily target budget allowance (`limit / durationDays`) and tracks today's spent progress/percentage in the Daily Spending section.
  * **Quick Notes Section**: A premium, interactive dashboard memo card for jotting down reminders, shopping list items, or general thoughts. Supports easy updates and a dedicated "Clear Note" feature via a custom multiline modal.

-----

### 🛠️ Tech Stack & Architecture

  * **Framework**: React Native (Expo SDK 54) + **TypeScript**.
  * **State Management**: **Zustand** with **AsyncStorage** persistence.
  * **Architecture Layout (Modularity & Hooks)**: Extracted all screen files to keep them under 150 lines. Business logic and state calculations are delegated to custom hooks (`useHomeScreen`, `useBudgetPlanning`), and UI rendering is divided into presentational sub-components.
  * **Rolling Budget Window Engine**: Tracks transaction dates against custom duration active windows (`[startDate, startDate + customDays]`) to compute spent progress on custom-days budgets.
  * **State Mapping**: Implemented a custom `setCurrency` action in the store that maps through the `transactions` array and `monthlyBudgets` record to maintain data integrity during currency shifts (supporting structured budget goals).
  * **Data Handling**: Utilizes a `monthKey` mapping strategy (`YYYY-MM`) to isolate budgets and transactions.
  * **Offline Note Engine**: Integrated the note state into the persistent Zustand/AsyncStorage pipeline to ensure user memos are safely saved offline.

-----

### 💡 Product Thinking & Design Assumptions

In alignment with the assignment’s focus on "Reasonable Assumptions" and "Polish over Complexity," Wealthra implements:

1.  **Offline-First Currency Conversion**:
    To ensure the app remains functional in zero-connectivity environments (subways, travel), I implemented a fixed-rate conversion engine:
    $$1 \text{ USD} \approx 92.74 \text{ INR}$$
    **Trade-off**: While live APIs offer precision, a fixed rate ensures **instant UI feedback** and prevents "data flickering" caused by fluctuating rates, providing a more stable user experience.

2.  **The "Global Wallet" Logic**:
    While budgets "time-travel" per month, the **Balance Chip** remains a global sum, providing a "Ground Truth" of actual cash-on-hand. Users can now edit this wallet balance directly from the Home Screen, which dynamically updates cash-on-hand by calculating:
    $$\text{Wallet Balance} = \text{initialBalance} + \text{Transactions (Income - Expenses)}$$

3.  **Active Rolling Window for Custom Budgets**:
    When a budget is set to a custom duration (e.g., 7 days or 14 days), expenses are tracked strictly within the active date window starting from the budget's creation date. This prevents historical or future monthly expenses from polluting short-term budgeting progress.

4.  **Traffic Light Budgeting**:
    To drive habit change, the progress bar shifts colors at specific thresholds: **Orange** at 70% and **Red** at 90% of the limit.

5.  **Zero-Friction Interaction**:
    Numeric-restricted fields and pre-selected categories reduce the "taps-to-task" ratio, encouraging high-frequency logging.

-----

### ⚙️ Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/VictorLoucii/wealthra-finance-companion
cd wealthra-finance-companion

# 2. Install dependencies
npm install

# 3. Start the Expo server
npx expo start

# 4. Run on device/emulator
# Press 'a' for Android or 'i' for iOS in the terminal
```

-----

