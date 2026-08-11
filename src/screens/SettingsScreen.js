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
];

export function SettingsScreen({
  currentUser,
  preferences,
  onUpdate,
  onBack,
  onPickAvatar,
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
          accessibilityLabel="Choose a profile photo"
          onPress={onPickAvatar}
          style={styles.settingsProfile}
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
          <Icon name="camera-outline" color={colors.purple} size={21} />
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
        <Text style={styles.groupLabel}>SUPPORT</Text>
        <View style={styles.card}>
          <StaticSetting
            icon="mail-outline"
            title="Email notifications"
            detail="Available when an email service is connected"
            styles={styles}
            colors={colors}
          />
          <StaticSetting
            icon="help-circle-outline"
            title="Help center"
            detail="Get answers and contact support"
            styles={styles}
            colors={colors}
          />
          <StaticSetting
            icon="information-circle-outline"
            title="About Secret"
            detail="Learn about the community"
            styles={styles}
            colors={colors}
          />
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

function StaticSetting({ icon, title, detail, styles, colors }) {
  return (
    <View style={styles.setting}>
      <View style={styles.settingIcon}>
        <Icon name={icon} color={colors.purple} size={16} />
      </View>
      <View style={[styles.flex, styles.personCopy]}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.mutedSmall}>{detail}</Text>
      </View>
      <Icon name="chevron-forward" color={colors.muted} size={20} />
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
      style={[styles.settingToggle, value && styles.settingToggleOn]}
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
