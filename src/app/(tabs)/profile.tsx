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
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { profile, session, refreshProfile } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("FREE");

  useEffect(() => {
    if (profile) {
      setSelectedStatus(profile.availability);
      setStatusMessage(profile.status_message);
    }
  }, [profile]);

  async function saveProfile(fields: {
    availability?: string;
    status_message?: string;
  }) {
    const { error } = await supabase
      .from("profiles")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", session!.user.id);

    if (error) console.warn(error.message);
    else refreshProfile();
  }

  const handleChangePhotoPress = () => {
    console.log("Change photo pressed!");
  };

  const statuses = [
    { id: "Free", label: "Free", color: "#4ade80" },
    { id: "Busy", label: "Busy", color: "#f87171" },
    { id: "Away", label: "Away", color: "#facc15" },
    { id: "Offline", label: "Offline", color: "#9ca3af" },
  ];

  const current =
    statuses.find((status) => status.id === selectedStatus) ?? statuses[3];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          stickyHeaderIndices={[0]}
        >
          <CustomHeader
            title="Profile"
            subtitle="Your Public Status"
            showAddButton={false}
          />

          {/* User Profile Info Section */}
          <View style={styles.profileSection}>
            {/* Circle Avatar with Initials */}
            <View style={[styles.avatarCircle, { borderColor: current.color }]}>
              <ThemedText style={styles.avatarText}>
                {profile?.username?.substring(0, 2).toUpperCase()}
              </ThemedText>
            </View>

            {/* User Name & Change Photo Link */}
            <View style={styles.profileDetails}>
              <ThemedText style={styles.userName}>
                {profile?.username}
              </ThemedText>
              <TouchableOpacity
                onPress={handleChangePhotoPress}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.changePhotoText}>
                  Change photo
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dotted Line Separator Below Profile Section */}
          <View style={styles.dottedLineContainer}>
            {Array.from({ length: 60 }).map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>

          {/* My Status Section Header */}
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>My status</ThemedText>
            <ThemedText style={styles.visibilityText}>
              Visible to friends
            </ThemedText>
          </View>

          {/* Status Selector Buttons Grid */}
          <View style={styles.statusGrid}>
            {statuses.map((item) => {
              const isSelected = selectedStatus === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.statusButton,
                    isSelected && styles.statusButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedStatus(item.id);
                    saveProfile({ availability: item.id });
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: item.color }]}
                  />
                  <ThemedText
                    style={[
                      styles.statusButtonText,
                      isSelected && styles.statusTextSelected,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <ThemedText style={styles.messageTitle}>
            Your Message To Friends
          </ThemedText>
          {/* Custom Message Input Section */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.textInput}
              value={statusMessage}
              onChangeText={setStatusMessage}
              placeholder="What's on your mind?"
              placeholderTextColor="#666666"
              onEndEditing={() =>
                saveProfile({ status_message: statusMessage })
              }
              returnKeyType="done"
            />
          </View>

          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() =>
                Alert.alert("Sign out", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign out",
                    style: "destructive",
                    onPress: () => supabase.auth.signOut(),
                  },
                ])
              }
              activeOpacity={0.7}
            >
              <ThemedText style={styles.signOutText}>Sign out</ThemedText>
            </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  // Profile Section Layout
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  avatarText: {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 24,
  },
  profileDetails: {
    justifyContent: "center",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
    lineHeight: 38,
    includeFontPadding: false,
  },
  changePhotoText: {
    fontFamily: "monospace",
    color: "#888888",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  // Dotted line below profile section
  dottedLineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
    overflow: "hidden",
    height: 2,
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: "#aaaaaa",
    marginHorizontal: 1,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  visibilityText: {
    color: "#666666",
    fontSize: 12,
    fontFamily: "monospace",
  },

  // Status Selector Buttons
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statusButtonSelected: {
    borderColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusButtonText: {
    color: "#888888",
    fontSize: 12,
    fontFamily: "monospace",
  },
  statusTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Custom Message Box Styles
  messageTitle: {
    marginLeft: 10,
    fontSize: 20,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  messageInputContainer: {
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 20,
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

  // Sign out button
  signOutContainer: {
    marginTop: "auto", // pushes the button to the bottom when there's spare space
    paddingTop: 24, // keeps a gap when the content is already tall
    paddingHorizontal: 10,
  },
  signOutButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#f87171",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    color: "#f87171",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 14,
  },
});
