import React from "react";
import { Pressable, Text, View } from "react-native";
import { Brand } from "./Brand";
import { Icon } from "./Ui";

export function Header({
  title,
  onSettings,
  unread = 0,
  onBack,
  styles,
  colors,
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.headerIcon}>
          <Icon name="chevron-back" color={colors.ink} size={23} />
        </Pressable>
      ) : (
        <Brand compact styles={styles} />
      )}
      {title && <Text style={styles.headerTitle}>{title}</Text>}
      {onSettings ? (
        <Pressable onPress={onSettings} style={styles.headerIcon}>
          <Icon name="settings-outline" color={colors.ink} size={19} />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unread > 99 ? "99+" : unread}
              </Text>
            </View>
          )}
        </Pressable>
      ) : (
        <View style={styles.headerIcon} />
      )}
    </View>
  );
}

export function BottomNav({ active, onNavigate, unread = 0, styles, colors }) {
  const items = [
    ["home", "home-outline", "home", "Home"],
    ["discover", "compass-outline", "compass", "Discover"],
    ["notifications", "notifications-outline", "notifications", "Updates"],
  ];
  return (
    <View style={styles.nav}>
      {items.map(([key, outline, solid, label]) => (
        <Pressable
          key={key}
          onPress={() => onNavigate(key)}
          style={styles.navItem}
        >
          <View>
            <Icon
              name={active === key ? solid : outline}
              color={active === key ? colors.purple : "#AAA4B7"}
              size={22}
            />
            {key === "notifications" && unread > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.badgeText}>
                  {unread > 99 ? "99+" : unread}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.navText, active === key && styles.activeNavText]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
