import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomHeader from "@/components/CustomHeader";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  username: string;
}

interface FriendRequest {
  id: number;
  sender: Profile;
}

interface Friendship {
  id: number;
  user_id: string;
  status: string;
}

export default function AddFriendScreen() {
  const [myId, setMyId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [foundUser, setFoundUser] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [message, setMessage] = useState("");
  const [friendship, setFriendship] = useState<Friendship | null>(null);

  // Get the logged in user and their friend requests when the screen opens
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setMyId(data.user.id);
        loadRequests(data.user.id);
      }
    })();
  }, []);

  const loadRequests = async (userId: string) => {
    const { data, error } = await supabase
      .from("friendships")
      .select("id, sender:profiles!user_id(id, username)")
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (error) {
      setMessage(error.message);
      return;
    }
    setRequests(data as any);
  };

  const handleSearchPress = async () => {
    setFoundUser(null);
    setFriendship(null); // Reset check of status with searched user
    setMessage("");

    // ilike ignores capitalization; escape % and _ so they match as normal characters
    const username = searchText.trim();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike(
        "username",
        username.replace(/[%_\\]/g, (ch) => `\\${ch}`),
      )
      .limit(2);

    if (error) {
      setMessage(error.message);
      return;
    }

    let match: Profile | undefined;
    if (data.length === 1) {
      match = data[0];
    } else if (data.length === 2) {
      match = data.find((profile) => profile.username === username);
      if (!match) {
        setMessage(
          "More than one user has that name. Type the exact capitalization.",
        );
        return;
      }
    }

    if (!match) {
      setMessage("No user with that username.");
    } else if (match.id === myId) {
      setMessage("That's you!");
    } else {
      setFoundUser(match);
      setFriendship(await findFriendship(match.id)); // Grab current friendship status with clicked user
    }
  };

  // Check if already friends with searched user
  const findFriendship = async (otherId: string) => {
    if (!myId) return null;
    const { data } = await supabase
      .from("friendships")
      .select("id, user_id, status")
      .or(
        `and(user_id.eq.${myId},friend_id.eq.${otherId}),` +
          `and(user_id.eq.${otherId},friend_id.eq.${myId})`,
      )
      .maybeSingle();
    return data as Friendship | null;
  };

  const handleAddPress = async () => {
    if (!foundUser || !myId) return;

    // look for a friendship in either direction
    const { data: existing, error: lookupError } = await supabase
      .from("friendships")
      .select("id, user_id, status")
      .or(
        `and(user_id.eq.${myId},friend_id.eq.${foundUser.id}),` +
          `and(user_id.eq.${foundUser.id},friend_id.eq.${myId})`,
      )
      .maybeSingle();

    if (lookupError) {
      setMessage(lookupError.message);
      return;
    }

    if (existing) {
      if (existing.status === "accepted") {
        setMessage(`You're already friends with @${foundUser.username}.`);
      } else if (existing.user_id === myId) {
        setMessage(`You already sent @${foundUser.username} a request.`);
      } else {
        // User already requested you, accept theirs instead of making a second row
        const { error: acceptError } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", existing.id);
        if (acceptError) {
          setMessage(acceptError.message);
          return;
        }
        setRequests((prev) => prev.filter((r) => r.id !== existing.id));
        setMessage(
          `@${foundUser.username} had already requested you, so you're now friends!`,
        );
      }
      setFoundUser(null);
      setSearchText("");
      return;
    }

    const { error } = await supabase
      .from("friendships")
      .insert({ user_id: myId, friend_id: foundUser.id, status: "pending" });

    if (error) {
      setMessage(
        error.code === "23505" ? "Request already exists." : error.message,
      );
      return;
    }
    setMessage(`Friend request sent to @${foundUser.username}!`);
    setFoundUser(null);
    setSearchText("");
  };

  const handleAcceptPress = async (requestId: number) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      setMessage(error.message);
      return;
    }
    setRequests(requests.filter((r) => r.id !== requestId));
  };

  const handleDeclinePress = async (requestId: number) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", requestId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleRemovePress = () => {
    if (!foundUser || !friendship) return;

    Alert.alert("Remove friend", `Remove @${foundUser.username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("friendships")
            .delete()
            .eq("id", friendship.id);

          if (error) {
            setMessage(error.message);
            return;
          }
          setMessage(`Removed @${foundUser.username}.`);
          setFoundUser(null);
          setFriendship(null);
          setSearchText("");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          stickyHeaderIndices={[0]}
        >
          <CustomHeader
            title="Add Friend"
            subtitle="Search by username"
            showAddButton={false}
          />

          {!myId ? (
            <ThemedText style={styles.messageText}>
              Log in to add friends.
            </ThemedText>
          ) : (
            <>
              {/* Search Bar Section */}
              <View style={styles.searchRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="e.g. maya"
                    placeholderTextColor="#666666"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSearchPress}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.buttonText}>Search</ThemedText>
                </TouchableOpacity>
              </View>

              {message !== "" && (
                <ThemedText style={styles.messageText}>{message}</ThemedText>
              )}

              {/* Search Result */}
              {foundUser && (
                <View style={styles.userRow}>
                  <View>
                    <ThemedText style={styles.userName}>
                      @{foundUser.username}
                    </ThemedText>
                  </View>
                  {friendship?.status === "accepted" ? (
                    <TouchableOpacity
                      style={[styles.button, { borderColor: "#f87171" }]}
                      onPress={handleRemovePress}
                      activeOpacity={0.7}
                    >
                      <ThemedText
                        style={[styles.buttonText, { color: "#f87171" }]}
                      >
                        Remove
                      </ThemedText>
                    </TouchableOpacity>
                  ) : friendship && friendship.user_id === myId ? (
                    <View style={[styles.button, { opacity: 0.5 }]}>
                      <ThemedText style={styles.buttonText}>
                        Requested
                      </ThemedText>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleAddPress}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.buttonText}>
                        {friendship ? "Accept" : "Add"}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Friend Requests Section Header */}
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>
                  Friend requests
                </ThemedText>
                <ThemedText style={styles.countText}>
                  {requests.length} pending
                </ThemedText>
              </View>

              {/* Friend Requests List */}
              {requests.length === 0 ? (
                <ThemedText style={styles.emptyText}>
                  No pending requests.
                </ThemedText>
              ) : (
                requests.map((request) => (
                  <View key={request.id} style={styles.userRow}>
                    <View>
                      <ThemedText style={styles.userName}>
                        @{request.sender.username}
                      </ThemedText>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        style={[styles.button, { borderColor: "#f87171" }]}
                        onPress={() => handleDeclinePress(request.id)}
                        activeOpacity={0.7}
                      >
                        <ThemedText
                          style={[styles.buttonText, { color: "#f87171" }]}
                        >
                          Decline
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptPress(request.id)}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={styles.buttonText}>
                          Accept
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
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

  // Search Bar Styles
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444444",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  acceptButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#4ade80",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageText: {
    color: "#aaaaaa",
    fontSize: 14,
    fontStyle: "italic",
    marginHorizontal: 10,
    marginTop: 12,
  },

  // Section Header Styles
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginTop: 30,
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  countText: {
    color: "#666666",
    fontSize: 12,
    fontFamily: "monospace",
  },
  emptyText: {
    color: "#666666",
    fontFamily: "monospace",
    marginLeft: 10,
    marginTop: 10,
  },

  // User Row Styles
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
