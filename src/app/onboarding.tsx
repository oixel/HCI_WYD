import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

export default function Onboarding() {
  const { session, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;
  if (profile?.username) return <Redirect href="/" />;

  async function save() {
    const name = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(name)) {
      setError("3–20 characters: letters, numbers, or underscores.");
      return;
    }
    setSaving(true);
    setError("");

    const { error } = await supabase.from("profiles").upsert({
      id: session!.user.id,
      username: name,
      phone: session!.user.phone,
    });

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setError("That username is taken.");
      } else {
        console.warn(error.message);
        setError("Couldn't save your username. Try again.");
      }
      return;
    }
    await refreshProfile();
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Pick a username so friends can find you
          </Text>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. maya"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              value={username}
              onChangeText={setUsername}
              onSubmitEditing={save}
              returnKeyType="done"
              autoFocus
            />
          </View>
          <Text style={styles.hint}>
            3–20 characters: letters, numbers, underscores
          </Text>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, saving && { opacity: 0.5 }]}
            onPress={save}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => supabase.auth.signOut()}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Use a different number</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    gap: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666666",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 14,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "bold",
    marginTop: 6,
  },
  inputContainer: {
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
  hint: {
    color: "#666666",
    fontSize: 12,
    fontFamily: "monospace",
  },
  primaryButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#4ade80",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 14,
  },
  linkText: {
    color: "#888888",
    fontFamily: "monospace",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    color: "#f87171",
    fontFamily: "monospace",
    fontSize: 13,
  },
});
