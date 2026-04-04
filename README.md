
***

# 📂 Project: Wealthra Finance Companion

### 📝 Project Overview
[cite_start]Wealthra is a lightweight, mobile-first finance tracker designed to help users understand their daily money habits through simplicity and structured data[cite: 41, 43]. [cite_start]Unlike complex banking apps, Wealthra focuses on personal engagement, snappy interactions, and ease of use for regular everyday tracking[cite: 42, 44].

---

### 🚀 Features
* [cite_start]**Command Center Dashboard**: A real-time overview of balance, total income, and monthly expenses, structured in a clean, touch-friendly grid[cite: 53, 54, 55, 56].
* [cite_start]**Advanced Transaction Engine**: Full CRUD support (Create, Read, Update, Delete) with dedicated validation to ensure data integrity[cite: 72, 73, 74, 75, 76, 111].
* [cite_start]**Smart Budget Alerts**: A dynamic budget limit tracker that provides immediate visual feedback, shifting colors when spending crosses a critical threshold[cite: 88, 90].
* [cite_start]**High-Performance History**: Real-time, case-insensitive search and category filtering, optimized for handling large datasets[cite: 80, 82].
* [cite_start]**Visual Insights**: Category-wise breakdowns and visualizations to help users understand spending patterns on a small screen[cite: 58, 61, 93, 99].

---

### 🛠️ Tech Stack
* [cite_start]**Framework**: React Native with Expo SDK 54 (TypeScript)[cite: 34, 36].
* [cite_start]**State Management**: Zustand with `AsyncStorage` persistence for a reliable, offline-first experience[cite: 131, 135, 145, 167].
* [cite_start]**List Optimization**: `@shopify/flash-list` for high-performance scrolling in the History screen[cite: 132].
* [cite_start]**Architecture**: Component-driven architecture with a clear separation between business logic and UI components[cite: 130, 133].

---

### 💡 Product Thinking & Assumptions
[cite_start]The assignment allows for "sensible decisions" and prioritizes a "well-finished app" over unnecessary complexity[cite: 28, 29, 30]. Key choices for Wealthra include:

1.  [cite_start]**Functional Integrity First**: I deliberately chose to omit "placeholder" features to ensure a 100% functional navigation flow[cite: 30]. [cite_start]Every interactive element on the dashboard drives a complete, working feature[cite: 110, 153].
2.  [cite_start]**Proactive Spending Alerts**: For the Budget Goal feature, the progress bar triggers a visual color shift at 90% capacity[cite: 90, 92]. [cite_start]This allows users to adjust their habits *before* they exceed their limit[cite: 153].
3.  [cite_start]**Data Integrity via UX**: To prevent ambiguous entries, the "Notes" field is mandatory when the "General" category is selected[cite: 111]. [cite_start]Additionally, regex-based filtering blocks non-numeric characters in the amount field to reduce user error[cite: 111].
4.  [cite_start]**Local-First Design**: The app utilizes persistent local storage to ensure financial data is always available, even without an active internet connection[cite: 121, 145].

---

### ⚙️ Setup Instructions
[cite_start]To run this project locally, ensure you have Node.js and the Expo CLI installed[cite: 171].

```bash
# 1. Clone the repository
git clone https://github.com/VictorLoucii/wealthra-finance-companion
cd wealthra-finance-companion

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```
*Press `i` for the iOS Simulator, `a` for Android, or scan the QR code with the Expo Go app on a physical device.*

---

### 🛠️ Future Enhancements
[cite_start]Given more time, I would expand the product with the following improvements[cite: 139, 141]:
* [cite_start]**Dark Mode**: For improved accessibility and user preference[cite: 142].
* [cite_start]**Data Export**: Allowing users to export their financial history as a CSV or PDF file[cite: 146].
* [cite_start]**Biometric Lock**: Adding an extra layer of security for sensitive financial data[cite: 148].
* [cite_start]**Investment Overview**: Expanding the dashboard to include long-term investment tracking[cite: 150].

---