import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "./Brand";

export function Icon({ name, color, size, style }) {
  return <Ionicons name={name} color={color} size={size} style={style} />;
}

export function Tag({ children, styles }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{children}</Text>
    </View>
  );
}

export function TitleRow({ title, onRefresh, styles, colors }) {
  return (
    <View style={styles.titleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onRefresh}>
        <Icon name="refresh-outline" color={colors.purple} size={20} />
      </Pressable>
    </View>
  );
}

export function Empty({ icon, text, styles }) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} color="#C8C1D8" size={29} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function Stat({ value, label, styles }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value === undefined || value === null ? "—" : String(value)}
      </Text>
      <Text style={styles.mutedSmall}>{label}</Text>
    </View>
  );
}

export function InlineError({ text, styles, colors }) {
  return (
    <View style={styles.inlineError}>
      <Icon name="alert-circle-outline" color={colors.danger} size={16} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

export function ErrorBar({ message, onClose, styles, colors }) {
  return (
    <Pressable onPress={onClose} style={styles.errorBar}>
      <Icon name="alert-circle-outline" color={colors.white} size={18} />
      <Text numberOfLines={2} style={styles.errorBarText}>
        {message}
      </Text>
      <Icon name="close" color={colors.white} size={18} />
    </Pressable>
  );
}

export function SystemScreen({
  icon,
  title,
  text,
  onPrimary,
  primaryLabel,
  styles,
  colors,
}) {
  return (
    <SafeAreaView style={styles.system}>
      <Brand styles={styles} />
      <View style={styles.systemCard}>
        <Icon name={icon} color={colors.purple} size={31} />
        <Text style={styles.systemTitle}>{title}</Text>
        <Text style={styles.systemText}>{text}</Text>
        {onPrimary && (
          <Pressable style={styles.primaryButton} onPress={onPrimary}>
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
