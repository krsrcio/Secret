import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { BottomNav, Header } from '../components/Navigation';
import { PostCard } from '../components/PostCard';
import { PostComposer } from '../components/PostComposer';
import { Empty, TitleRow } from '../components/Ui';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { idOf } from '../utils/presentation';

export function HomeScreen({ data, onNavigate, onOpenPost, onOpenProfile, onCreatePost, onSaveDraft, onPickPostImage, onError, onFavorite, onEditPost, onDeletePost, onSettings, onRefresh, styles, colors }) {
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);

  return <View style={styles.screen}>
    <Header onSettings={onSettings} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
    <FlatList
      data={data.posts}
      keyExtractor={(post) => String(post.id)}
      renderItem={({ item: post }) => <PostCard post={post} canManage={String(idOf(post.author || post.user)) === String(idOf(data.currentUser))} onOpen={() => onOpenPost(post)} onFavorite={() => onFavorite(post.id)} onEdit={() => onEditPost(post)} onDelete={() => onDeletePost(post)} onOpenProfile={() => onOpenProfile(post.author || post.user)} styles={styles} colors={colors} />}
      ListHeaderComponent={<><PostComposer currentUser={data.currentUser} onOpenProfile={() => onOpenProfile(data.currentUser)} onCreatePost={onCreatePost} onSaveDraft={onSaveDraft} draft={data.draft} onPickPhoto={onPickPostImage} onError={onError} styles={styles} colors={colors} /><TitleRow title="Your feed" onRefresh={handleRefresh} styles={styles} colors={colors} /></>}
      ListEmptyComponent={<Empty icon="chatbubble-ellipses-outline" text="Start a conversation with text, a photo, or a voice note." styles={styles} />}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}
    />
    <BottomNav active="home" onNavigate={onNavigate} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
  </View>;
}
