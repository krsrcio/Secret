import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "../components/Avatar";
import { BottomNav, Header } from "../components/Navigation";
import { PostCard } from "../components/PostCard";
import { Empty, Icon, TitleRow } from "../components/Ui";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { idOf, nameOf, postText } from "../utils/presentation";

export function HomeScreen({
  data,
  onNavigate,
  onOpenPost,
  onOpenProfile,
  onCreatePost,
  onFavorite,
  onEditPost,
  onDeletePost,
  onSettings,
  onRefresh,
  styles,
  colors,
}) {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  const query = search.trim().toLowerCase();
  const posts = useMemo(
    () =>
      data.posts.filter(
        (post) =>
          !query ||
          postText(post).toLowerCase().includes(query) ||
          nameOf(post.author || post.user)
            .toLowerCase()
            .includes(query),
      ),
    [data.posts, query],
  );
  const publish = async () => {
    if (await onCreatePost(draft)) setDraft("");
  };
  return (
    <View style={styles.screen}>
      <Header
        onSettings={onSettings}
        unread={data.unreadNotificationCount}
        styles={styles}
        colors={colors}
      />
      <FlatList
        data={posts}
        keyExtractor={(post) => String(post.id)}
        renderItem={({ item: post }) => (
          <PostCard
            post={post}
            canManage={
              String(idOf(post.author || post.user)) ===
              String(idOf(data.currentUser))
            }
            onOpen={() => onOpenPost(post)}
            onFavorite={() => onFavorite(post.id)}
            onEdit={() => onEditPost(post)}
            onDelete={() => onDeletePost(post)}
            onOpenProfile={() => onOpenProfile(post.author || post.user)}
            styles={styles}
            colors={colors}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.search}>
              <Icon name="search-outline" color={colors.muted} size={19} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholder="Search people or questions"
                placeholderTextColor={colors.muted}
              />
            </View>
            <View style={styles.composer}>
              <Pressable onPress={() => onOpenProfile(data.currentUser)}>
                <Avatar person={data.currentUser} size={45} />
              </Pressable>
              <View style={styles.composerBody}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  style={styles.composerInput}
                  multiline
                  maxLength={220}
                  placeholder="Ask what’s on your mind…"
                  placeholderTextColor={colors.muted}
                />
                <View style={styles.composerFooter}>
                  <Text style={styles.mutedSmall}>{draft.length}/220</Text>
                  <Pressable
                    disabled={!draft.trim()}
                    onPress={publish}
                    style={[
                      styles.smallButton,
                      !draft.trim() && styles.disabled,
                    ]}
                  >
                    <Text style={styles.smallButtonText}>Post</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <TitleRow
              title="Your feed"
              onRefresh={handleRefresh}
              styles={styles}
              colors={colors}
            />
          </>
        }
        ListEmptyComponent={
          <Empty
            icon="chatbubble-ellipses-outline"
            text={
              query
                ? "No conversations match your search."
                : "Your feed is waiting for its first conversation."
            }
            styles={styles}
          />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.purple}
          />
        }
      />
      <BottomNav
        active="home"
        onNavigate={onNavigate}
        unread={data.unreadNotificationCount}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}
