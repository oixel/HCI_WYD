import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function verify() {
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    if (error) setError(error.message);
    else router.replace("/"); // the guard now lets them through
  }

  return (
    <View
      style={{
        padding: 24,
        gap: 12,
        paddingTop: 80,
        backgroundColor: "#121212",
        flex: 1,
      }}
    >
      <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
        Sign in with Phone Number
      </Text>
      <TextInput
        placeholder="+15555550100"
        placeholderTextColor="#666666"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!sent}
        style={{ color: "white" }}
      />
      {sent && (
        <TextInput
          placeholder="6-digit code"
          placeholderTextColor="#666666"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          style={{ color: "white" }}
        />
      )}
      <Button
        title={sent ? "Verify" : "Send code"}
        onPress={sent ? verify : sendCode}
      />
      {!!error && (
        <Text style={{ color: "red" }}>
          Failed to verify phone number, please try a valid number!
        </Text>
      )}
    </View>
  );
}
