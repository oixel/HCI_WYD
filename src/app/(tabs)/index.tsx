import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomHeader from "@/components/CustomHeader";
import { ThemedText } from "@/components/themed-text";
import { useFriends } from "@/lib/useFriends";
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

  const handleFriendListPress = () => {
    router.push("/add-friend");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
          <View style={styles.gridContainer}>
            {sortedFriends.map((user, index) => {
              const isLeftColumn = index % 2 === 0;
              const isLastRow =
                index >= friends.length - (friends.length % 2 === 0 ? 2 : 1);
              const color = statusColor(user.availability);
              const name = user.username ?? "?";

              return (
                <View
                  key={user.id}
                  style={[
                    styles.userCard,
                    isLeftColumn && styles.cardLeftBorder,
                    !isLastRow && styles.cardBottomBorder,
                  ]}
                >
                  <View style={[styles.avatarCircle, { borderColor: color }]}>
                    <ThemedText style={styles.avatarText}>
                      {name.substring(0, 2).toUpperCase()}
                    </ThemedText>
                  </View>

                  <ThemedText style={styles.userName}>{name}</ThemedText>
                  <ThemedText style={[styles.userStatus, { color }]}>
                    {user.availability}
                  </ThemedText>
                  {!!user.status_message && (
                    <ThemedText style={styles.userMessage}>
                      "{user.status_message}"
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </View>
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
    paddingHorizontal: 10,
  },
  userCard: {
    width: "50%",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardLeftBorder: {
    borderRightWidth: 1,
    borderRightColor: "#333333",
    borderStyle: "solid",
  },
  cardBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    borderStyle: "solid",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 2,
  },
  userStatus: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 1,
    letterSpacing: 1,
  },
  userMessage: {
    color: "#aaaaaa",
    fontSize: 14,
    fontStyle: "italic",
  },
  emptyText: {
    color: "#666666",
    fontFamily: "monospace",
    marginHorizontal: 10,
    marginTop: 20,
  },
});
