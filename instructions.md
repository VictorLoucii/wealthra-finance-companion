

---

# **Project Context: Zorwyn Personal Finance Companion**

## **1. Project Goal**
Build a lightweight, high-fidelity personal finance app focused on **Product Thinking**, **UI/UX Quality**, and **Predictable State Management**. The goal is to create a "Command Center" for daily money habits that feels premium and snappy.

## **2. Current Status (April 4, 2026)**
* **Dashboard:** High-fidelity "Finance Era" UI complete with responsive header and 4-card navigation grid.
* **Store:** Zustand integrated with persistence.
* **CRUD:** Transaction creation (Income/Expense) and deletion (Long-press) are fully functional.
* **Performance:** FlashList implemented for 60FPS transaction scrolling.

## **3. Updated Tech Stack**
* **Framework**: React Native (Expo SDK 54) - TypeScript.
* **Navigation**: Expo Router (File-based).
* **State Management**: **Zustand** (with `persist` middleware for data longevity).
* **Persistence**: `@react-native-async-storage/async-storage` (Selected for 100% compatibility with the Expo Go environment).
* **Lists**: `@shopify/flash-list` (Optimized for performance).
* **Icons**: `lucide-react-native`.
* **UI/Styling**: Standard **StyleSheet API**. 

## **4. Data Schema (Transaction)**
Each transaction strictly follows this interface:
* `id`: string (Timestamp-based or UUID).
* `amount`: number (Stored as a positive float).
* `type`: `'income'` | `'expense'`.
* `category`: string (Standardized: Food, Rent, Salary, Leisure, etc.).
* `date`: string (**ISO 8601 format** for reliable sorting and filtering).

## **5. Code Architecture**
* **Logic Placement**: Business logic and calculations (like `getBalance`) are centralized in the **Zustand Store** (`/src/store`) to keep UI components lean.
* **Styling Pattern**: Styles are kept at the bottom of the component file using `StyleSheet.create`.
* **Folder Structure**:
    * `/src/components`: Reusable UI elements (Modals, Chips, List Items).
    * `/src/screens`: Main feature screens (currently `HomeScreen.tsx`).
    * `/src/store`: Central state (`useFinanceStore.ts`).
    * `/src/constants`: Fixed data like category lists and color palettes.

## **6. UI/UX & Design Principles**
* **The "Finance Era" Aesthetic**: Deep navy (`#303960`), clean emerald (`#66C2A9`), and generous whitespace.
* **Polish over Complexity**: Better to have a perfect "Add" flow than five broken "Insights" screens.
* **Touch Feedback**: Every interactive element must provide visual feedback (Opacity changes, active states).
* **Empty States**: Screens with no data must guide the user (e.g., "No transactions yet. Add one to get started!").

---

### **Immediate Roadmap**
1. **The Identity Phase**: Implement a horizontal **Category Selector** in the Add Transaction Modal.
2. **Refined Sorting**: Ensure the Transaction List is always sorted by the ISO date string (Newest first).
3. **The "See All" View**: Create a dedicated screen for the full transaction history.

---

### Why this is better:
* **Honesty:** It admits we’re using `AsyncStorage` so you don't get confused later.
* **Standardization:** It enforces **ISO 8601** dates, which will save you a massive headache when we eventually build the "Insights" charts.
* **Clarity:** It clearly defines the "Finance Era" color palette you've been building.

