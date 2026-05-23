import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { FileText } from "lucide-react-native";

interface QuickNotesCardProps {
  note: string;
  setIsNoteModalVisible: (visible: boolean) => void;
  colors: any;
}

export const QuickNotesCard = ({
  note,
  setIsNoteModalVisible,
  colors,
}: QuickNotesCardProps) => {
  return (
    <View style={styles.noteSectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>
        Quick Notes
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsNoteModalVisible(true)}
        style={[
          styles.noteCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.noteHeader}>
          <FileText size={18} color={colors.accent} style={{ marginTop: 1 }} />
          <Text
            style={[
              styles.noteContentText,
              note ? { color: colors.textMain } : { color: colors.textSecondary, fontStyle: "italic" },
            ]}
            numberOfLines={3}
          >
            {note || "Write down something you need to buy or remember..."}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  noteSectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  noteContentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
