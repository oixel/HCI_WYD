import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
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
    const name = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
      setError("3–20 characters: letters, numbers, or underscores");
      return;
    }
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session!.user.id,
        username: name,
        phone: session!.user.phone,
      })
      .eq("id", session!.user.id);

    setSaving(false);

    if (error) {
      setError(
        error.code === "23505" ? "That username is taken" : error.message,
      );
      return;
    }
    await refreshProfile();
    router.replace("/");
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#121212",
        padding: 24,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 22 }}>Choose a username</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#666666"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        style={{ color: "white" }}
      />
      {!!error && <Text style={{ color: "#ff6b6b" }}>{error}</Text>}
      <Button title="Continue" onPress={save} disabled={saving} />
    </View>
  );
}
