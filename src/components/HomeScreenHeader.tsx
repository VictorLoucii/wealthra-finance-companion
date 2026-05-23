import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Moon, Sun, Wallet } from "lucide-react-native";
import { formatCurrency } from "../utils/formatters";

interface HomeScreenHeaderProps {
  selectedDate: Date;
  userName: string;
  setIsEditNameModalVisible: (visible: boolean) => void;
  currency: "USD" | "INR";
  setCurrency: (currency: "USD" | "INR") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  setIsWalletModalVisible: (visible: boolean) => void;
  balance: number;
  colors: any;
}

export const HomeScreenHeader = ({
  selectedDate,
  userName,
  setIsEditNameModalVisible,
  currency,
  setCurrency,
  theme,
  toggleTheme,
  setIsWalletModalVisible,
  balance,
  colors,
}: HomeScreenHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeftGroup}>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          {selectedDate.toLocaleDateString("en-US", { month: "long" })}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsEditNameModalVisible(true)}
          style={styles.profileSection}
        >
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName
              )}&background=66C2A9&color=fff`,
            }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.headerRightControls}>
        {/* Currency Toggle */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrency(currency === "USD" ? "INR" : "USD")}
        >
          <View
            style={[
              styles.balanceChipInactive,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.currencyText, { color: colors.textMain }]}>
              {currency}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
          {theme === "dark" ? (
            <Moon size={22} color={colors.textMain} />
          ) : (
            <Sun size={22} color={colors.textMain} />
          )}
        </TouchableOpacity>

        {/* Wallet Balance */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsWalletModalVisible(true)}
          style={[styles.balanceChipActive, { backgroundColor: colors.primaryButton }]}
        >
          <Wallet size={14} color="#FFFFFF" style={styles.balanceIcon} />
          <Text style={styles.balanceText}>
            {formatCurrency(balance, currency)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerLeftGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerRightControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileSection: { flexDirection: "row", alignItems: "center" },
  userAvatar: { width: 32, height: 32, borderRadius: 16 },
  iconButton: { padding: 4 },
  balanceChipInactive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  balanceChipActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyText: { fontSize: 14, fontWeight: "700" },
  balanceIcon: { marginRight: 6 },
  balanceText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
