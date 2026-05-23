import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { ChevronLeft } from "lucide-react-native";

interface BudgetHeaderProps {
  navigation?: any;
  userName: string;
  setIsEditNameModalVisible: (visible: boolean) => void;
  colors: any;
}

export const BudgetHeader = ({
  navigation,
  userName,
  setIsEditNameModalVisible,
  colors,
}: BudgetHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeftContainer}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft color={colors.textMain} size={28} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Budget Planning
        </Text>
      </View>

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
        <Text style={[styles.userName, { color: colors.textMain }]}>
          {userName}
        </Text>
      </TouchableOpacity>
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
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    marginLeft: -10,
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userAvatar: { width: 36, height: 36, borderRadius: 18 },
  userName: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
