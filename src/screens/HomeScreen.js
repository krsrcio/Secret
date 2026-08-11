import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, TextInput, View } from 'react-native';
import { BottomNav, Header } from '../components/Navigation';
import { PostCard } from '../components/PostCard';
import { PostComposer } from '../components/PostComposer';
import { FeedFilters } from '../components/FeedFilters';
import { Empty, Icon, TitleRow } from '../components/Ui';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { idOf, nameOf, postText } from '../utils/presentation';
import { matchesFeedFilter } from '../utils/feedFilters';

export function HomeScreen({ data, onNavigate, onOpenPost, onOpenProfile, onCreatePost, onSaveDraft, onPickPostImage, onError, onFavorite, onEditPost, onDeletePost, onSettings, onRefresh, styles, colors }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  const query = search.trim().toLowerCase();
  const posts = useMemo(() => data.posts.filter((post) => matchesFeedFilter(post, filter) && (!query || postText(post).toLowerCase().includes(query) || nameOf(post.author || post.user).toLowerCase().includes(query))), [data.posts, filter, query]);

  return <View style={styles.screen}>
    <Header onSettings={onSettings} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
    <FlatList
      data={posts}
      keyExtractor={(post) => String(post.id)}
      renderItem={({ item: post }) => <PostCard post={post} canManage={String(idOf(post.author || post.user)) === String(idOf(data.currentUser))} onOpen={() => onOpenPost(post)} onFavorite={() => onFavorite(post.id)} onEdit={() => onEditPost(post)} onDelete={() => onDeletePost(post)} onOpenProfile={() => onOpenProfile(post.author || post.user)} styles={styles} colors={colors} />}
      ListHeaderComponent={<><View style={styles.search}><Icon name="search-outline" color={colors.muted} size={19} /><TextInput value={search} onChangeText={setSearch} style={styles.searchInput} placeholder="Search people or questions" placeholderTextColor={colors.muted} /></View><FeedFilters value={filter} onChange={setFilter} styles={styles} /><PostComposer currentUser={data.currentUser} onOpenProfile={() => onOpenProfile(data.currentUser)} onCreatePost={onCreatePost} onSaveDraft={onSaveDraft} draft={data.draft} onPickPhoto={onPickPostImage} onError={onError} styles={styles} colors={colors} /><TitleRow title="Your feed" onRefresh={handleRefresh} styles={styles} colors={colors} /></>}
      ListEmptyComponent={<Empty icon="chatbubble-ellipses-outline" text={query || filter !== 'all' ? 'No conversations match these filters.' : 'Start a conversation with text, a photo, or a voice note.'} styles={styles} />}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}
    />
    <BottomNav active="home" onNavigate={onNavigate} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
  </View>;
}
