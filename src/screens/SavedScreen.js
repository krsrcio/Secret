import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { BottomNav, Header } from "../components/Navigation";
import { PostCard } from "../components/PostCard";
import { Empty } from "../components/Ui";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { favoriteOf, idOf } from "../utils/presentation";

export function SavedScreen({
  data,
  onNavigate,
  onOpenPost,
  onOpenProfile,
  onFavorite,
  onEditPost,
  onDeletePost,
  onSettings,
  onRefresh,
  styles,
  colors,
}) {
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  const posts = data.posts.filter(favoriteOf);

  return (
    <View style={styles.screen}>
      <Header title="Saved" onSettings={onSettings} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
      <FlatList
        data={posts}
        keyExtractor={(post) => String(post.id)}
        renderItem={({ item: post }) => (
          <PostCard
            post={post}
            canManage={String(idOf(post.author || post.user)) === String(idOf(data.currentUser))}
            onOpen={() => onOpenPost(post)}
            onFavorite={() => onFavorite(post.id)}
            onEdit={() => onEditPost(post)}
            onDelete={() => onDeletePost(post)}
            onOpenProfile={() => onOpenProfile(post.author || post.user)}
            styles={styles}
            colors={colors}
          />
        )}
        ListEmptyComponent={<Empty icon="bookmark-outline" text="Save posts you want to revisit here." styles={styles} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}
      />
      <BottomNav active="saved" onNavigate={onNavigate} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
    </View>
  );
}
