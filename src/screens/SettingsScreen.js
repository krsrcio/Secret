import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { Header } from "../components/Navigation";
import { Icon } from "../components/Ui";
import { nameOf } from "../utils/presentation";

const preferenceRows = [
  [
    "privateProfile",
    "lock-closed-outline",
    "Private profile",
    "Only followers can see posts",
  ],
  ["darkMode", "moon-outline", "Dark mode", "Use your preferred appearance"],
  ["largeText", "text-outline", "Larger text", "Make reading more comfortable"],
];

export function SettingsScreen({
  currentUser,
  preferences,
  onUpdate,
  onBack,
  onEditProfile,
  onResetData,
  onSignOut,
  styles,
  colors,
}) {
  return (
    <View style={styles.screen}>
      <Header
        title="Settings"
        onBack={onBack}
        styles={styles}
        colors={colors}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Edit profile"
          onPress={onEditProfile}
          style={({ pressed }) => [styles.settingsProfile, pressed && styles.pressed]}
        >
          <Avatar person={currentUser} size={58} />
          <View style={[styles.flex, styles.personCopy]}>
            <Text style={styles.postName}>{nameOf(currentUser)}</Text>
            <Text style={styles.mutedSmall}>
              {currentUser?.username
                ? `@${currentUser.username}`
                : currentUser?.email || ""}
            </Text>
          </View>
          <View style={styles.settingsProfileAction}>
            <Text style={styles.settingsProfileActionText}>Edit</Text>
            <Icon name="create-outline" color={colors.purple} size={17} />
          </View>
        </Pressable>
        <Text style={styles.groupLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          {preferenceRows.map(([key, icon, title, detail], index) => (
            <View
              key={key}
              style={[
                styles.setting,
                index < preferenceRows.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.settingIcon}>
                <Icon name={icon} color={colors.purple} size={16} />
              </View>
              <View style={[styles.flex, styles.personCopy]}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.mutedSmall}>{detail}</Text>
              </View>
              <View style={styles.settingControl}>
                <SettingToggle
                  value={Boolean(preferences[key])}
                  onChange={(value) => onUpdate({ [key]: value })}
                  label={title}
                  styles={styles}
                />
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.groupLabel}>ON THIS DEVICE</Text>
        <View style={styles.settingsInfo}>
          <Icon name="phone-portrait-outline" color={colors.purple} size={20} />
          <Text style={styles.settingsInfoText}>
            Drafts, saved posts, and privacy controls are stored only on this device.
          </Text>
        </View>
        <Text style={styles.groupLabel}>LOCAL DATA</Text>
        <Pressable
          accessibilityLabel="Delete all local app data"
          style={styles.resetButton}
          onPress={onResetData}
        >
          <Icon name="trash-outline" color={colors.danger} size={19} />
          <View style={styles.flex}>
            <Text style={styles.resetTitle}>Delete local data</Text>
            <Text style={styles.mutedSmall}>
              Remove accounts, posts, and settings
            </Text>
          </View>
        </Pressable>
        <Pressable style={styles.logoutButton} onPress={onSignOut}>
          <Icon name="log-out-outline" color={colors.danger} size={19} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SettingToggle({ value, onChange, label, styles }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.settingToggle, value && styles.settingToggleOn, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.settingToggleThumb,
          value && styles.settingToggleThumbOn,
        ]}
      />
    </Pressable>
  );
}
