import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CustomHeaderProps {
  title: string; // e.g., "Status", "Map", "Profile"
  subtitle?: string; // e.g., "6 people" or location info
  onAddPress?: () => void; // Optional button handler
  showAddButton?: boolean; // Whether to show the "+" button
}

export default function CustomHeader({
  title,
  subtitle,
  onAddPress,
  showAddButton = true,
}: CustomHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        {/* Left Side: Constant "WYD?" + Dynamic Title + Subtitle */}
        <View style={styles.headerTextBlock}>
          <ThemedText style={styles.wydLabel}>WYD?</ThemedText>
          <ThemedText type="title" style={styles.mainTitle}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>

        {/* Right Side Button (Optional per page) */}
        {showAddButton && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Generalized Dotted Line Separator */}
      <View style={styles.dottedLineContainer}>
        {Array.from({ length: 60 }).map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#121212",
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 0,
  },
  headerTextBlock: {
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 20,
  },
  wydLabel: {
    fontSize: 24,
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: "monospace",
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    color: "#888888",
    fontFamily: "monospace",
    marginTop: 2,
  },
  addButton: {
    marginTop: 30,
    marginRight: 25,
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333333",
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "300",
  },
  dottedLineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    height: 2,
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: "#aaaaaa",
    marginHorizontal: 1,
  },
});
