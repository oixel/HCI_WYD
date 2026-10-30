import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomHeader from "@/components/CustomHeader";
import { ThemedText } from "@/components/themed-text";
import { useFriends } from "@/lib/useFriends";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";

export const STATUS_COLORS: Record<string, string> = {
  Free: "#4ade80",
  Busy: "#f87171",
  Away: "#facc15",
  Offline: "#9ca3af",
};

const ORDER = ["Free", "Busy", "Away", "Offline"];

const order = (availability?: string | null) => {
  const i = ORDER.indexOf(availability ?? "Offline");
  return i === -1 ? ORDER.length : i;
};

export const statusColor = (availability?: string | null) =>
  STATUS_COLORS[availability ?? "Offline"] ?? STATUS_COLORS.Offline;

export default function HomeScreen() {
  const { friends, reload } = useFriends();
  const [refreshing, setRefreshing] = useState(false);

  const sortedFriends = useMemo(
    () =>
      [...friends].sort(
        (a, b) =>
          order(a.availability) - order(b.availability) ||
          (a.username ?? "").localeCompare(b.username ?? ""),
      ),
    [friends],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleFriendListPress = () => {
    router.push("/add-friend");
  };

  const handleMessagePress = async (phone: string | null) => {
    if (!phone) return;
    const number = phone.startsWith("+") ? phone : `+${phone}`; // Prepend + symbol before opening messenger app

    try {
      await Linking.openURL(`sms:${number}`);
    } catch {
      console.warn("Failed to open up the messages app.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            sortedFriends.length === 0 && { flexGrow: 1 },
          ]}
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={["#ffffff"]}
              progressBackgroundColor="#1a1a1a"
            />
          }
        >
          <CustomHeader
            title="Status"
            subtitle={`${friends.length} ${friends.length === 1 ? "person" : "people"}`}
            onAddPress={handleFriendListPress}
          />

          {/* 2-Column User Grid */}
          {sortedFriends.length ? (
            <View style={styles.gridContainer}>
              {sortedFriends.map((user) => {
                const color = statusColor(user.availability);
                const name = user.username ?? "?";
                const canMessage = user.availability === "Free" && !!user.phone;

                return (
                  <View key={user.id} style={styles.cell}>
                    <Pressable
                      disabled={!canMessage}
                      onPress={() => handleMessagePress(user.phone)}
                      style={({ pressed }) => [
                        styles.userCard,
                        pressed && styles.userCardPressed,
                        { borderColor: color },
                      ]}
                      accessibilityRole={canMessage ? "button" : undefined}
                      accessibilityLabel={
                        canMessage ? `Message ${name}` : undefined
                      }
                    >
                      <View style={styles.cardTop}>
                        <View
                          style={[styles.avatarCircle, { borderColor: color }]}
                        >
                          <ThemedText style={styles.avatarText}>
                            {name.substring(0, 2).toUpperCase()}
                          </ThemedText>
                        </View>
                        <View style={styles.cardTitle}>
                          <ThemedText style={styles.userName} numberOfLines={1}>
                            {name}
                          </ThemedText>
                          <ThemedText style={[styles.userStatus, { color }]}>
                            {user.availability}
                          </ThemedText>
                        </View>
                      </View>

                      <ThemedText style={styles.userMessage} numberOfLines={3}>
                        {user.status_message
                          ? `"${user.status_message}"`
                          : "No message"}
                      </ThemedText>

                      {canMessage && (
                        <Ionicons
                          name="chatbubble"
                          size={18}
                          color="#4ade80"
                          style={styles.messageHint}
                        />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Add some friends first!</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  // Grid and User Card Styles
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 0,
  },
  cell: {
    width: "50%",
    padding: 6,
  },
  userCard: {
    aspectRatio: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  userCardPressed: {
    backgroundColor: "#1a1a1a",
    transform: [{ scale: 0.92 }],
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 16,
  },
  userName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userStatus: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "medium",
    letterSpacing: 1,
    marginTop: 2,
  },
  userMessage: {
    color: "#cccccc",
    fontSize: 14,
    lineHeight: 19,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666666",
    fontFamily: "monospace",
    textAlign: "center",
  },
  messageHint: {
    position: "absolute",
    top: 20,
    right: 14,
  },
});
