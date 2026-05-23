import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface MonthSelectorProps {
  currentMonthYear: string;
  prevMonth: string;
  nextMonth: string;
  handleTabChange: (offset: number) => void;
  colors: any;
}

export const MonthSelector = ({
  currentMonthYear,
  prevMonth,
  nextMonth,
  handleTabChange,
  colors,
}: MonthSelectorProps) => {
  return (
    <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => handleTabChange(-1)} activeOpacity={0.7}>
        <Text style={[styles.tabTextInactive, { color: colors.textSecondary }]}>
          {prevMonth}
        </Text>
      </TouchableOpacity>

      <View style={styles.activeTabContainer}>
        <Text style={[styles.tabTextActive, { color: colors.textMain }]}>
          {currentMonthYear}
        </Text>
        <View style={styles.activeTabIndicator} />
      </View>

      <TouchableOpacity onPress={() => handleTabChange(1)} activeOpacity={0.7}>
        <Text style={[styles.tabTextInactive, { color: colors.textSecondary }]}>
          {nextMonth}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  tabTextInactive: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 12,
  },
  activeTabContainer: {
    alignItems: "center",
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 12,
  },
  activeTabIndicator: {
    height: 3,
    width: "100%",
    backgroundColor: "#66C2A9",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    position: "absolute",
    bottom: -1,
  },
});
