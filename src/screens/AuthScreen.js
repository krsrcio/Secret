import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Brand } from "../components/Brand";
import { Icon, InlineError, Tag } from "../components/Ui";
import { validateCredentials } from "../utils/validation";

export function AuthScreen({ error, onLogin, onRegister, styles, colors }) {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const validationError = validateCredentials({
    username,
    email,
    password,
    confirmPassword: confirm,
    register,
  });
  const valid = !validationError;
  const submit = () =>
    register
      ? onRegister({ username: username.trim(), email: email.trim(), password })
      : onLogin({ username: username.trim(), password });
  return (
    <KeyboardAvoidingView
      style={styles.authWrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.authScroll}
        keyboardShouldPersistTaps="handled"
      >
        <Brand styles={styles} />
        <View style={styles.authCard}>
          <Tag styles={styles}>
            {register ? "CREATE YOUR SPACE" : "WELCOME TO SECRET"}
          </Tag>
          <Text style={styles.authTitle}>
            {register
              ? "Join the conversation."
              : "Speak freely.\nStay connected."}
          </Text>
          <Text style={styles.authSubtitle}>
            {register
              ? "Create an account to find people who share your world."
              : "Sign in to see conversations and updates from your community."}
          </Text>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
            maxLength={30}
            styles={styles}
            colors={colors}
          />
          {register && (
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              maxLength={254}
              styles={styles}
              colors={colors}
            />
          )}
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={
              register ? "At least 4 characters" : "Enter your password"
            }
            secureTextEntry={!showPassword}
            action={showPassword ? "Hide" : "Show"}
            onAction={() => setShowPassword((value) => !value)}
            styles={styles}
            colors={colors}
          />
          {register && (
            <Input
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Enter password again"
              secureTextEntry={!showPassword}
              styles={styles}
              colors={colors}
            />
          )}
          {!!error && (
            <InlineError text={error} styles={styles} colors={colors} />
          )}
          <Pressable
            disabled={!valid}
            style={[styles.primaryButton, !valid && styles.disabled]}
            onPress={submit}
          >
            <Text style={styles.primaryButtonText}>
              {register ? "Create account" : "Sign in"}
            </Text>
            <Icon
              name="arrow-forward"
              color={colors.white}
              size={19}
              style={styles.buttonEnd}
            />
          </Pressable>
        </View>
        <Text style={styles.authFooter}>
          {register ? "Already a member?" : "New to Secret?"}{" "}
          <Text
            style={styles.link}
            onPress={() => {
              setRegister((value) => !value);
              setPassword("");
              setConfirm("");
            }}
          >
            {register ? "Sign in" : "Create an account"}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, action, onAction, styles, colors, ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
        {action && (
          <Pressable onPress={onAction}>
            <Text style={styles.inputAction}>{action}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
