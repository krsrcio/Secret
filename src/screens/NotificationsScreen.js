import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Avatar } from "../components/Avatar";
import { BottomNav, Header } from "../components/Navigation";
import { Empty, Icon } from "../components/Ui";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { formatRelativeTime } from "../utils/formatDate";
import { nameOf } from "../utils/presentation";

export function NotificationsScreen({
  data,
  onNavigate,
  onOpenProfile,
  onSettings,
  onReadAll,
  onRefresh,
  styles,
  colors,
}) {
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  return (
    <View style={styles.screen}>
      <Header
        title="Updates"
        onSettings={onSettings}
        styles={styles}
        colors={colors}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.purple}
          />
        }
      >
        <View style={styles.notificationHeading}>
          <View>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Text style={styles.mutedSmall}>
              {data.unreadNotificationCount
                ? `${data.unreadNotificationCount} unread updates`
                : "You’re all caught up"}
            </Text>
          </View>
          <Pressable onPress={onReadAll} style={styles.readPill}>
            <Text style={styles.readText}>Mark all read</Text>
          </Pressable>
        </View>
        {data.notifications.length ? (
          <View style={styles.card}>
            {data.notifications.map((item, index) => {
              const actor = item.actor || item.user || item.author || {};
              return (
                <Pressable
                  key={String(item.id || index)}
                  onPress={() => onOpenProfile(actor)}
                  style={[
                    styles.notification,
                    index < data.notifications.length - 1 && styles.divider,
                  ]}
                >
                  <View>
                    <Avatar person={actor} size={49} />
                    {!item.read && <View style={styles.dot} />}
                  </View>
                  <View style={[styles.flex, styles.notificationCopy]}>
                    <Text style={styles.notificationText}>
                      <Text style={styles.postName}>{nameOf(actor)}</Text>
                      {item.message || item.text || item.content
                        ? ` ${item.message || item.text || item.content}`
                        : ""}
                    </Text>
                    <Text style={styles.mutedSmall}>
                      {formatRelativeTime(item.createdAt || item.time)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Empty
            icon="notifications-outline"
            text="You have no notifications yet."
            styles={styles}
          />
        )}
        <Pressable onPress={handleRefresh} style={styles.refreshButton}>
          <Icon name="refresh-outline" color={colors.purple} size={17} />
          <Text style={styles.refreshText}>Refresh updates</Text>
        </Pressable>
      </ScrollView>
      <BottomNav
        active="notifications"
        onNavigate={onNavigate}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}
