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
import { Empty, Icon, TitleRow } from "../components/Ui";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { idOf, nameOf } from "../utils/presentation";

export function DiscoverScreen({
  data,
  onNavigate,
  onOpenProfile,
  onSettings,
  onRefresh,
  styles,
  colors,
}) {
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  return (
    <View style={styles.screen}>
      <Header
        title="Discover"
        onSettings={onSettings}
        unread={data.unreadNotificationCount}
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
        <View style={styles.hero}>
          <Text style={styles.kicker}>EXPLORE</Text>
          <Text style={styles.heroTitle}>Find your next conversation.</Text>
          <Text style={styles.heroSub}>
            See what the Secret community is thinking about today.
          </Text>
        </View>
        <TitleRow
          title="Trending now"
          onRefresh={handleRefresh}
          styles={styles}
          colors={colors}
        />
        {data.trends.length ? (
          <View style={styles.card}>
            {data.trends.map((trend, index) => (
              <View
                key={String(trend.id || trend.tag || index)}
                style={styles.trend}
              >
                <Text style={styles.trendNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <View style={styles.flex}>
                  <Text style={styles.trendTag}>
                    {trend.tag || trend.name || trend.title || ""}
                  </Text>
                  <Text style={styles.mutedSmall}>
                    {typeof (trend.postCount ?? trend.count) === "number"
                      ? `${trend.postCount ?? trend.count} posts`
                      : trend.subtitle || ""}
                  </Text>
                </View>
                <Icon name="chevron-forward" color={colors.purple} size={19} />
              </View>
            ))}
          </View>
        ) : (
          <Empty
            icon="trending-up-outline"
            text="No trends are available right now."
            styles={styles}
          />
        )}
        <Text style={styles.sectionTitle}>People you may like</Text>
        {data.suggestions.length ? (
          <View style={styles.card}>
            {data.suggestions.map((person, index) => (
              <Pressable
                key={String(idOf(person) || index)}
                onPress={() => onOpenProfile(person)}
                style={[
                  styles.personRow,
                  index < data.suggestions.length - 1 && styles.divider,
                ]}
              >
                <Avatar person={person} size={47} />
                <View style={[styles.flex, styles.personCopy]}>
                  <Text style={styles.postName}>{nameOf(person)}</Text>
                  <Text style={styles.mutedSmall}>
                    {person.postCount ?? person.subtitle ?? ""}
                  </Text>
                </View>
                <View style={styles.viewPill}>
                  <Text style={styles.viewText}>
                    {(person.isFollowing ?? person.viewerIsFollowing)
                      ? "Following"
                      : "View"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <Empty
            icon="people-outline"
            text="No suggestions are available right now."
            styles={styles}
          />
        )}
      </ScrollView>
      <BottomNav
        active="discover"
        onNavigate={onNavigate}
        unread={data.unreadNotificationCount}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}
