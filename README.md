
---

# 📂 Project: wealthra Finance Companion

### 📝 Project Overview
[cite_start]Wealthra is a lightweight, mobile-first finance tracker designed to help users understand their daily money habits through simplicity and structured data[cite: 41, 43]. [cite_start]Unlike complex banking apps, wealthra focuses on personal engagement and ease of use for regular everyday tracking[cite: 42, 44].

---

### 🚀 Features
* [cite_start]**Smart Dashboard**: Real-time overview of balance, total income, and total expenses[cite: 54, 55, 56].
* [cite_start]**Advanced Transaction Tracking**: Full CRUD support (Create, Read, Update, Delete) for financial entries[cite: 73, 74, 75, 76].
* [cite_start]**Budget Engine**: A budget limit tracker that provides visual feedback on monthly spending progress[cite: 88].
* [cite_start]**UX Hardening**: Integrated validation logic to ensure data integrity (e.g., minimum transaction amounts and category-specific requirements)[cite: 111].

---

### 🛠️ Tech Stack
* [cite_start]**Framework**: React Native with Expo SDK[cite: 34, 36].
* [cite_start]**State Management**: Zustand with Persistence (AsyncStorage)[cite: 131, 167].
* [cite_start]**UI Components**: Lucide-react-native for iconography and FlashList for performant list rendering[cite: 132].
* [cite_start]**Architecture**: Component-driven architecture with a clear separation between business logic and UI[cite: 130, 133].

---

### 💡 Product Thinking & Assumptions
[cite_start]The assignment allows for "sensible decisions" and "reasonable assumptions"[cite: 28, 29]. Here are the key choices made for wealthra:

1.  **Mandatory Metadata for "General" Transactions**: To prevent a list of "empty" data, I made the "Notes" field mandatory when the "General" category is selected. This ensures every entry has a clear purpose.
2.  **Input Filtering**: I implemented regex-based filtering on the amount input to physically block non-numeric characters, reducing user error during rapid data entry.
3.  **Semantic Hierarchy**: In the transaction list, user notes are prioritized as the primary title, moving the category to subtext. This makes the app feel more "personal" to the user's specific life events.
4.  [cite_start]**Local-First Design**: The app uses persistent local storage to ensure users can track their finances offline, prioritizing availability over cloud synchronization[cite: 121, 145].

---

### ⚙️ Setup Instructions
*(Provide the commands needed to run your app, for example:)*
1.  Clone the repository.
2.  Run `npm install` to install dependencies.
3.  Run `npx expo start` to launch the development server.

---

### 🛠️ Future Improvements
* [cite_start]**Dark Mode**: For better accessibility and user preference[cite: 142].
* [cite_start]**Data Export**: Allowing users to export their financial history as CSV/PDF[cite: 146].
* [cite_start]**Biometric Lock**: Adding an extra layer of security for sensitive financial data[cite: 148].

---

