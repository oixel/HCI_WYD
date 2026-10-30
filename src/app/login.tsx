import { router } from "expo-router";
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

import { supabase } from "../lib/supabase";

function cleanDigits(input: string) {
  let d = input.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
}

function formatUS(digits: string) {
  const d = digits.slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function Login() {
  const [digits, setDigits] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    if (digits.length !== 10) {
      setError("Enter a 10-digit US phone number.");
      return;
    }

    setError("");
    setLoading(true);
    const phone = `+1${digits}`;

    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      console.warn(error.message);
      setError("Couldn't send a code. Check the number and try again.");
    } else {
      setSent(true);
    }
  }

  async function verify() {
    setError("");
    setLoading(true);
    const phone = `+1${digits}`;

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      console.warn(error.message);
      setError("That code didn't work. Try again.");
    } else {
      router.replace("/"); // the guard now lets them through
    }
  }

  function changeNumber() {
    setSent(false);
    setCode("");
    setError("");
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            {sent ? "Enter the code we texted you" : "Use your phone number"}
          </Text>

          <Text style={styles.label}>Phone number</Text>
          <View style={[styles.inputContainer, sent && styles.inputDisabled]}>
            <TextInput
              style={styles.textInput}
              placeholder="(000) 000-0000"
              placeholderTextColor="#666666"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              value={formatUS(digits)}
              onChangeText={(t) => setDigits(cleanDigits(t))}
              editable={!sent}
            />
          </View>

          {sent && (
            <>
              <Text style={styles.label}>Code</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="6-digit code"
                  placeholderTextColor="#666666"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                  autoFocus
                />
              </View>
            </>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.5 }]}
            onPress={sent ? verify : sendCode}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {sent ? "Verify" : "Send code"}
            </Text>
          </TouchableOpacity>

          {sent && (
            <TouchableOpacity onPress={changeNumber} activeOpacity={0.7}>
              <Text style={styles.linkText}>Use a different number</Text>
            </TouchableOpacity>
          )}
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
  inputDisabled: {
    opacity: 0.5,
  },
  textInput: {
    color: "#FFFFFF",
    fontSize: 16,
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
