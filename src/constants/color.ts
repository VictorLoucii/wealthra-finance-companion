export const COLORS = {
  light: {
    background: "#F8FAFC",
    cardBackground: "#FFFFFF",
    textMain: "#303960",
    textSecondary: "#94A3B8",
    border: "#E2E8F0",
    divider: "#F1F5F9",
    accent: "#66C2A9", // Brand Green
    primaryButton: "#303960",
    modalOverlay: "rgba(0,0,0,0.4)",
    inputBackground: "#F8FAFC",
  },
  dark: {
    background: "#0F172A",     // Deep Navy
    cardBackground: "#1E293B", // Lighter Navy
    textMain: "#F1F5F9",       // Off-white
    textSecondary: "#94A3B8",  // Slate Gray (good contrast)
    border: "#334155",
    divider: "#1E293B",
    accent: "#66C2A9",         // Kept consistent
    primaryButton: "#66C2A9",  // Shift primary action to brand color in dark mode
    modalOverlay: "rgba(0,0,0,0.7)",
    inputBackground: "#0F172A",
  }
};

export type ThemeType = 'light' | 'dark';