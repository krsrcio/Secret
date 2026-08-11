import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from './src/components/Avatar';
import { applyTheme, colors } from './src/constants/theme';
import { usePullToRefresh } from './src/hooks/usePullToRefresh';
import { session, store } from './src/storage/secretStore';
import { formatRelativeTime } from './src/utils/formatDate';
import { validateCredentials } from './src/utils/validation';

const logo = require('./img/final logo.png');
const initialData = { currentUser: null, posts: [], trends: [], suggestions: [], notifications: [], preferences: {}, unreadNotificationCount: 0 };

const list = (value) => Array.isArray(value) ? value : [];
const body = (value) => value?.data || value || {};
const idOf = (person) => person?.id || person?.userId || person?._id;
const nameOf = (person) => person?.name || person?.displayName || person?.username || 'Unknown user';
const postText = (post) => post?.question || post?.content || post?.text || '';
const responsesOf = (post) => list(post?.responses || post?.answers);
const countOf = (post) => post?.responseCount ?? post?.answerCount ?? responsesOf(post).length;
const favoriteOf = (post) => Boolean(post?.viewerHasFavorited ?? post?.isFavorited ?? post?.favorited);

function normalizeAppData(result) {
  const value = body(result);
  const notifications = list(value.notifications);
  return {
    ...initialData,
    ...value,
    currentUser: value.currentUser || value.user || null,
    posts: list(value.posts || value.feed),
    trends: list(value.trends),
    suggestions: list(value.suggestions || value.peopleToFollow),
    notifications,
    preferences: value.preferences || value.settings || {},
    unreadNotificationCount: value.unreadNotificationCount ?? notifications.filter((item) => !item.read).length,
  };
}

function normalizeProfile(result, fallback) {
  const value = body(result);
  return {
    user: value.user || value.profile || fallback || null,
    posts: list(value.posts),
    answers: list(value.answers),
    favorites: list(value.favorites),
  };
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [token, setToken] = useState(null);
  const [screen, setScreen] = useState('home');
  const [data, setData] = useState(initialData);
  const [profile, setProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState('');
  const darkMode = Boolean(data.preferences?.darkMode);

  applyTheme(darkMode);
  styles = createStyles();

  const refresh = useCallback(async (activeToken) => {
    const next = normalizeAppData(await store.getBootstrap(activeToken));
    setData(next);
    return next;
  }, []);

  const restore = useCallback(async () => {
    setPhase('loading');
    try {
      const savedToken = await session.getToken();
      if (!savedToken) { setPhase('signedOut'); return; }
      await refresh(savedToken);
      setToken(savedToken);
      setPhase('authenticated');
    } catch (cause) {
      setError(cause.message);
      setPhase('offline');
    }
  }, [refresh]);

  useEffect(() => { restore(); }, [restore]);

  const execute = async (operation) => {
    try {
      return await operation();
    } catch (cause) {
      setError(cause.message);
      return null;
    }
  };

  const authenticate = async (method, values) => {
    setError('');
    try {
      const nextToken = await method(values);
      await session.saveToken(nextToken);
      await refresh(nextToken);
      setToken(nextToken);
      setScreen('home');
      setPhase('authenticated');
    } catch (cause) {
      setError(cause.message);
    }
  };

  const createPost = async (question) => {
    if (!question.trim()) return false;
    return (await execute(async () => { await store.createPost(token, question.trim()); await refresh(token); })) !== null;
  };

  const createResponse = async (postId, text) => {
    if (!text.trim()) return false;
    return (await execute(async () => {
      await store.createResponse(token, postId, text.trim());
      const next = await refresh(token);
      const updated = next.posts.find((post) => String(post.id) === String(postId));
      if (updated) setSelectedPost(updated);
    })) !== null;
  };

  const savePostEdit = async (postId, question) => {
    if (!question.trim()) return false;
    return (await execute(async () => {
      await store.updatePost(token, postId, question.trim());
      const next = await refresh(token);
      const updated = next.posts.find((post) => String(post.id) === String(postId));
      if (updated && String(selectedPost?.id) === String(postId)) setSelectedPost(updated);
      setEditingPost(null);
    })) !== null;
  };

  const deletePost = (post) => Alert.alert('Delete this post?', 'This removes the post and its responses from this device.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () => execute(async () => {
        await store.deletePost(token, post.id);
        await refresh(token);
        if (String(selectedPost?.id) === String(post.id)) setSelectedPost(null);
      }),
    },
  ]);

  const openProfile = async (person) => {
    const id = idOf(person);
    if (!id) return;
    setProfile({ user: person, posts: [] });
    setScreen('profile');
    await execute(async () => setProfile(normalizeProfile(await store.getProfile(token, id), person)));
  };

  const pickAvatar = () => execute(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error('Photo library permission is needed to choose a profile picture.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await store.updateProfile(token, { avatarUrl: result.assets[0].uri });
      await refresh(token);
    }
  });

  const resetLocalData = () => Alert.alert('Delete all local data?', 'This permanently removes every account, post, reply, and setting saved on this device.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete all',
      style: 'destructive',
      onPress: () => execute(async () => {
        await store.clearAll();
        setData(initialData);
        setToken(null);
        setProfile(null);
        setSelectedPost(null);
        setPhase('signedOut');
      }),
    },
  ]);

  const signOut = () => Alert.alert('Log out?', 'You can sign in again whenever you’re ready.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => execute(async () => { await session.clear(); setData(initialData); setToken(null); setPhase('signedOut'); }) },
  ]);

  if (phase === 'loading') return <SystemScreen icon="sync-outline" title="Loading Secret" text="Loading your space…" />;
  if (phase === 'offline') return <SystemScreen icon="alert-circle-outline" title="We couldn’t load local data" text={error || 'Try loading your saved data again.'} onPrimary={restore} primaryLabel="Try again" />;
  if (phase === 'signedOut') return <AuthScreen error={error} onLogin={(values) => authenticate(store.login, values)} onRegister={(values) => authenticate(store.register, values)} />;

  const reload = () => execute(() => refresh(token));
  const favorite = (postId) => execute(async () => { await store.toggleFavorite(token, postId); await refresh(token); });
  const readAll = () => execute(async () => { await store.markNotificationsRead(token); await refresh(token); });
  const updatePreferences = (changes) => execute(async () => { await store.updatePreferences(token, changes); await refresh(token); });
  const follow = () => execute(async () => {
    const id = idOf(profile?.user);
    if (!id) return;
    const result = await store.toggleFollow(token, id);
    await refresh(token);
    setProfile(normalizeProfile(result, profile.user));
  });

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.page} />
      {screen === 'home' && <HomeScreen data={data} onNavigate={setScreen} onOpenPost={setSelectedPost} onOpenProfile={openProfile} onCreatePost={createPost} onFavorite={favorite} onEditPost={setEditingPost} onDeletePost={deletePost} onSettings={() => setScreen('settings')} onRefresh={reload} />}
      {screen === 'discover' && <DiscoverScreen data={data} onNavigate={setScreen} onOpenProfile={openProfile} onSettings={() => setScreen('settings')} onRefresh={reload} />}
      {screen === 'notifications' && <NotificationsScreen data={data} onNavigate={setScreen} onOpenProfile={openProfile} onSettings={() => setScreen('settings')} onReadAll={readAll} onRefresh={reload} />}
      {screen === 'settings' && <SettingsScreen currentUser={data.currentUser} preferences={data.preferences} onUpdate={updatePreferences} onBack={() => setScreen('home')} onPickAvatar={pickAvatar} onResetData={resetLocalData} onSignOut={signOut} />}
      {screen === 'profile' && <ProfileScreen profile={profile} currentUser={data.currentUser} onBack={() => setScreen('home')} onFollow={follow} onOpenPost={setSelectedPost} onFavorite={favorite} onEditPost={setEditingPost} onDeletePost={deletePost} />}
      <ReplySheet post={selectedPost} currentUser={data.currentUser} onClose={() => setSelectedPost(null)} onReply={createResponse} />
      <PostEditorSheet post={editingPost} onClose={() => setEditingPost(null)} onSave={savePostEdit} />
      {!!error && <ErrorBar message={error} onClose={() => setError('')} />}
    </SafeAreaView>
  );
}

function AuthScreen({ error, onLogin, onRegister }) {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const validationError = validateCredentials({ username, email, password, confirmPassword: confirm, register });
  const valid = !validationError;
  const submit = () => register
    ? onRegister({ username: username.trim(), email: email.trim(), password })
    : onLogin({ username: username.trim(), password });
  return (
    <KeyboardAvoidingView style={styles.authWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <Brand />
        <View style={styles.authCard}>
          <Tag>{register ? 'CREATE YOUR SPACE' : 'WELCOME TO SECRET'}</Tag>
          <Text style={styles.authTitle}>{register ? 'Join the conversation.' : 'Speak freely.\nStay connected.'}</Text>
          <Text style={styles.authSubtitle}>{register ? 'Create an account to find people who share your world.' : 'Sign in to see conversations and updates from your community.'}</Text>
          <Input label="Username" value={username} onChangeText={setUsername} placeholder="Enter your username" autoCapitalize="none" maxLength={30} />
          {register && <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" maxLength={254} />}
          <Input label="Password" value={password} onChangeText={setPassword} placeholder={register ? 'At least 4 characters' : 'Enter your password'} secureTextEntry={!showPassword} action={showPassword ? 'Hide' : 'Show'} onAction={() => setShowPassword((value) => !value)} />
          {register && <Input label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Enter password again" secureTextEntry={!showPassword} />}
          {!!error && <InlineError text={error} />}
          <Pressable disabled={!valid} style={[styles.primaryButton, !valid && styles.disabled]} onPress={submit}><Text style={styles.primaryButtonText}>{register ? 'Create account' : 'Sign in'}</Text><Icon name="arrow-forward" color={colors.white} size={19} style={styles.buttonEnd} /></Pressable>
        </View>
        <Text style={styles.authFooter}>{register ? 'Already a member?' : 'New to Secret?'} <Text style={styles.link} onPress={() => { setRegister((value) => !value); setPassword(''); setConfirm(''); }}>{register ? 'Sign in' : 'Create an account'}</Text></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, action, onAction, ...props }) {
  return <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text><View style={styles.inputShell}><TextInput {...props} style={styles.input} placeholderTextColor={colors.muted} />{action && <Pressable onPress={onAction}><Text style={styles.inputAction}>{action}</Text></Pressable>}</View></View>;
}

function HomeScreen({ data, onNavigate, onOpenPost, onOpenProfile, onCreatePost, onFavorite, onEditPost, onDeletePost, onSettings, onRefresh }) {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  const query = search.trim().toLowerCase();
  const posts = useMemo(() => data.posts.filter((post) => !query || postText(post).toLowerCase().includes(query) || nameOf(post.author || post.user).toLowerCase().includes(query)), [data.posts, query]);
  const publish = async () => { if (await onCreatePost(draft)) setDraft(''); };
  return (
    <View style={styles.screen}>
      <Header onSettings={onSettings} unread={data.unreadNotificationCount} />
      <FlatList
        data={posts}
        keyExtractor={(post) => String(post.id)}
        renderItem={({ item: post }) => <PostCard post={post} canManage={String(idOf(post.author || post.user)) === String(idOf(data.currentUser))} onOpen={() => onOpenPost(post)} onFavorite={() => onFavorite(post.id)} onEdit={() => onEditPost(post)} onDelete={() => onDeletePost(post)} onOpenProfile={() => onOpenProfile(post.author || post.user)} />}
        ListHeaderComponent={<><View style={styles.search}><Icon name="search-outline" color={colors.muted} size={19} /><TextInput value={search} onChangeText={setSearch} style={styles.searchInput} placeholder="Search people or questions" placeholderTextColor={colors.muted} /></View><View style={styles.composer}><Pressable onPress={() => onOpenProfile(data.currentUser)}><Avatar person={data.currentUser} size={45} /></Pressable><View style={styles.composerBody}><TextInput value={draft} onChangeText={setDraft} style={styles.composerInput} multiline maxLength={220} placeholder="Ask what’s on your mind…" placeholderTextColor={colors.muted} /><View style={styles.composerFooter}><Text style={styles.mutedSmall}>{draft.length}/220</Text><Pressable disabled={!draft.trim()} onPress={publish} style={[styles.smallButton, !draft.trim() && styles.disabled]}><Text style={styles.smallButtonText}>Post</Text></Pressable></View></View></View><TitleRow title="Your feed" onRefresh={handleRefresh} /></>}
        ListEmptyComponent={<Empty icon="chatbubble-ellipses-outline" text={query ? 'No conversations match your search.' : 'Your feed is waiting for its first conversation.'} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}
      />
      <BottomNav active="home" onNavigate={onNavigate} unread={data.unreadNotificationCount} />
    </View>
  );
}

function PostCard({ post, canManage, onOpen, onFavorite, onOpenProfile, onEdit, onDelete }) {
  const author = post.author || post.user || {};
  const count = countOf(post);
  return (
    <View style={styles.card}>
      <View style={styles.postTop}><Pressable accessibilityLabel={`Open ${nameOf(author)} profile`} onPress={onOpenProfile}><Avatar person={author} size={42} /></Pressable><Pressable onPress={onOpenProfile} style={styles.postAuthor}><Text style={styles.postName}>{nameOf(author)}</Text><Text style={styles.mutedSmall}>{formatRelativeTime(post.createdAt || post.time)}</Text></Pressable>{canManage && <Pressable accessibilityLabel="Manage your post" onPress={() => Alert.alert('Post options', undefined, [{ text: 'Edit', onPress: onEdit }, { text: 'Delete', style: 'destructive', onPress: onDelete }, { text: 'Cancel', style: 'cancel' }])} style={styles.iconHit}><Icon name="ellipsis-horizontal" color={colors.muted} size={20} /></Pressable>}<Pressable accessibilityLabel={favoriteOf(post) ? 'Remove favorite' : 'Favorite post'} onPress={onFavorite} style={styles.iconHit}><Icon name={favoriteOf(post) ? 'star' : 'star-outline'} color={favoriteOf(post) ? '#D88991' : '#BDB6CB'} size={23} /></Pressable></View>
      <Pressable onPress={onOpen}><Text style={styles.postText}>{postText(post)}</Text></Pressable>
      <View style={styles.postActions}><Pressable onPress={onOpen} style={styles.inlineAction}><Icon name="chatbubble-ellipses-outline" color={colors.purple} size={17} /><Text style={styles.mutedSmall}>{count} {count === 1 ? 'response' : 'responses'}</Text></Pressable><Pressable onPress={onOpen} style={styles.inlineAction}><Icon name="arrow-undo-outline" color={colors.purple} size={16} /><Text style={styles.replyText}>Reply</Text></Pressable></View>
    </View>
  );
}

function DiscoverScreen({ data, onNavigate, onOpenProfile, onSettings, onRefresh }) {
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  return (
    <View style={styles.screen}>
      <Header title="Discover" onSettings={onSettings} unread={data.unreadNotificationCount} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}>
        <View style={styles.hero}><Text style={styles.kicker}>EXPLORE</Text><Text style={styles.heroTitle}>Find your next conversation.</Text><Text style={styles.heroSub}>See what the Secret community is thinking about today.</Text></View>
        <TitleRow title="Trending now" onRefresh={handleRefresh} />
        {data.trends.length ? <View style={styles.card}>{data.trends.map((trend, index) => <View key={String(trend.id || trend.tag || index)} style={styles.trend}><Text style={styles.trendNumber}>{String(index + 1).padStart(2, '0')}</Text><View style={styles.flex}><Text style={styles.trendTag}>{trend.tag || trend.name || trend.title || ''}</Text><Text style={styles.mutedSmall}>{typeof (trend.postCount ?? trend.count) === 'number' ? `${trend.postCount ?? trend.count} posts` : trend.subtitle || ''}</Text></View><Icon name="chevron-forward" color={colors.purple} size={19} /></View>)}</View> : <Empty icon="trending-up-outline" text="No trends are available right now." />}
        <Text style={styles.sectionTitle}>People you may like</Text>
        {data.suggestions.length ? <View style={styles.card}>{data.suggestions.map((person, index) => <Pressable key={String(idOf(person) || index)} onPress={() => onOpenProfile(person)} style={[styles.personRow, index < data.suggestions.length - 1 && styles.divider]}><Avatar person={person} size={47} /><View style={[styles.flex, styles.personCopy]}><Text style={styles.postName}>{nameOf(person)}</Text><Text style={styles.mutedSmall}>{person.postCount ?? person.subtitle ?? ''}</Text></View><View style={styles.viewPill}><Text style={styles.viewText}>{person.isFollowing ?? person.viewerIsFollowing ? 'Following' : 'View'}</Text></View></Pressable>)}</View> : <Empty icon="people-outline" text="No suggestions are available right now." />}
      </ScrollView>
      <BottomNav active="discover" onNavigate={onNavigate} unread={data.unreadNotificationCount} />
    </View>
  );
}

function NotificationsScreen({ data, onNavigate, onOpenProfile, onSettings, onReadAll, onRefresh }) {
  const { refreshing, onRefresh: handleRefresh } = usePullToRefresh(onRefresh);
  return (
    <View style={styles.screen}>
      <Header title="Updates" onSettings={onSettings} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.purple} />}>
        <View style={styles.notificationHeading}><View><Text style={styles.sectionTitle}>Notifications</Text><Text style={styles.mutedSmall}>{data.unreadNotificationCount ? `${data.unreadNotificationCount} unread updates` : 'You’re all caught up'}</Text></View><Pressable onPress={onReadAll} style={styles.readPill}><Text style={styles.readText}>Mark all read</Text></Pressable></View>
        {data.notifications.length ? <View style={styles.card}>{data.notifications.map((item, index) => { const actor = item.actor || item.user || item.author || {}; return <Pressable key={String(item.id || index)} onPress={() => onOpenProfile(actor)} style={[styles.notification, index < data.notifications.length - 1 && styles.divider]}><View><Avatar person={actor} size={49} />{!item.read && <View style={styles.dot} />}</View><View style={[styles.flex, styles.notificationCopy]}><Text style={styles.notificationText}><Text style={styles.postName}>{nameOf(actor)}</Text>{item.message || item.text || item.content ? ` ${item.message || item.text || item.content}` : ''}</Text><Text style={styles.mutedSmall}>{formatRelativeTime(item.createdAt || item.time)}</Text></View></Pressable>; })}</View> : <Empty icon="notifications-outline" text="You have no notifications yet." />}
        <Pressable onPress={handleRefresh} style={styles.refreshButton}><Icon name="refresh-outline" color={colors.purple} size={17} /><Text style={styles.refreshText}>Refresh updates</Text></Pressable>
      </ScrollView>
      <BottomNav active="notifications" onNavigate={onNavigate} />
    </View>
  );
}

function SettingsScreen({ currentUser, preferences, onUpdate, onBack, onPickAvatar, onResetData, onSignOut }) {
  const rows = [
    ['privateProfile', 'lock-closed-outline', 'Private profile', 'Only followers can see posts'],
    ['darkMode', 'moon-outline', 'Dark mode', 'Use your preferred appearance'],
  ];
  return (
    <View style={styles.screen}>
      <Header title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityLabel="Choose a profile photo" onPress={onPickAvatar} style={styles.settingsProfile}><Avatar person={currentUser} size={58} /><View style={[styles.flex, styles.personCopy]}><Text style={styles.postName}>{nameOf(currentUser)}</Text><Text style={styles.mutedSmall}>{currentUser?.username ? `@${currentUser.username}` : currentUser?.email || ''}</Text></View><Icon name="camera-outline" color={colors.purple} size={21} /></Pressable>
        <Text style={styles.groupLabel}>PREFERENCES</Text>
        <View style={styles.card}>{rows.map(([key, icon, title, detail], index) => <View key={key} style={[styles.setting, index < rows.length - 1 && styles.divider]}><View style={styles.settingIcon}><Icon name={icon} color={colors.purple} size={16} /></View><View style={[styles.flex, styles.personCopy]}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.mutedSmall}>{detail}</Text></View><Switch value={Boolean(preferences[key])} onValueChange={(value) => onUpdate({ [key]: value })} trackColor={{ false: colors.line, true: colors.lavender }} thumbColor={colors.white} /></View>)}</View>
        <Text style={styles.groupLabel}>SUPPORT</Text>
        <View style={styles.card}><StaticSetting icon="mail-outline" title="Email notifications" detail="Available when an email service is connected" /><StaticSetting icon="help-circle-outline" title="Help center" detail="Get answers and contact support" /><StaticSetting icon="information-circle-outline" title="About Secret" detail="Learn about the community" /></View>
        <Text style={styles.groupLabel}>LOCAL DATA</Text>
        <Pressable accessibilityLabel="Delete all local app data" style={styles.resetButton} onPress={onResetData}><Icon name="trash-outline" color={colors.danger} size={19} /><View style={styles.flex}><Text style={styles.resetTitle}>Delete local data</Text><Text style={styles.mutedSmall}>Remove accounts, posts, and settings</Text></View></Pressable>
        <Pressable style={styles.logoutButton} onPress={onSignOut}><Icon name="log-out-outline" color={colors.danger} size={19} /><Text style={styles.logoutText}>Log out</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function StaticSetting({ icon, title, detail }) {
  return <View style={styles.setting}><View style={styles.settingIcon}><Icon name={icon} color={colors.purple} size={16} /></View><View style={[styles.flex, styles.personCopy]}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.mutedSmall}>{detail}</Text></View><Icon name="chevron-forward" color={colors.muted} size={20} /></View>;
}

function ProfileScreen({ profile, currentUser, onBack, onFollow, onOpenPost, onFavorite, onEditPost, onDeletePost }) {
  const [tab, setTab] = useState('Posts');
  const person = profile?.user;
  const tabPosts = tab === 'Posts' ? profile?.posts || [] : tab === 'Answers' ? profile?.answers || [] : profile?.favorites || [];
  if (!person) return <SystemScreen icon="person-outline" title="Loading profile" text="Getting profile details…" />;
  const self = String(idOf(person)) === String(idOf(currentUser));
  const following = Boolean(person.isFollowing ?? person.viewerIsFollowing);
  const canViewContent = person.canViewContent !== false;
  return (
    <View style={styles.screen}>
      <Header title="Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}><Avatar person={person} size={94} /><View style={[styles.flex, styles.profileCopy]}><Text style={styles.profileName}>{nameOf(person)}</Text><Text style={styles.mutedSmall}>{person.pronouns || ''}</Text></View>{!self && <Pressable onPress={onFollow} style={[styles.followButton, following && styles.followingButton]}><Text style={[styles.followText, following && styles.followingText]}>{following ? 'Following' : 'Follow'}</Text></Pressable>}</View>
        {!!person.bio && <Text style={styles.bio}>{person.bio}</Text>}
        <View style={styles.stats}><Stat value={person.followingCount} label="Following" /><View style={styles.statLine} /><Stat value={person.followersCount ?? person.followerCount} label="Followers" /><View style={styles.statLine} /><Stat value={person.postCount ?? profile?.posts?.length} label="Posts" /></View>
        {canViewContent ? <><View style={styles.tabs}>{['Posts', 'Answers', 'Favorites'].map((item) => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}><Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item}</Text></Pressable>)}</View>{tabPosts.length ? tabPosts.map((post) => <PostCard key={String(post.id)} post={post} canManage={String(idOf(post.author || post.user)) === String(idOf(currentUser))} onOpen={() => onOpenPost(post)} onFavorite={() => onFavorite(post.id)} onEdit={() => onEditPost(post)} onDelete={() => onDeletePost(post)} onOpenProfile={() => {}} />) : <Empty icon={tab === 'Posts' ? 'chatbubble-ellipses-outline' : 'folder-open-outline'} text={`No ${tab.toLowerCase()} to show yet.`} />}</> : <Empty icon="lock-closed-outline" text="Follow this private profile to see its activity." />}
      </ScrollView>
    </View>
  );
}

function ReplySheet({ post, currentUser, onClose, onReply }) {
  const [reply, setReply] = useState('');
  if (!post) return null;
  const author = post.author || post.user || {};
  const send = async () => { if (await onReply(post.id, reply)) setReply(''); };
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}><Pressable style={styles.dismiss} onPress={onClose} /><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.sheet}>
        <View style={styles.handle} /><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Responses</Text><Pressable onPress={onClose} style={styles.close}><Icon name="close" color={colors.purpleDark} size={20} /></Pressable></View>
        <View style={styles.question}><Avatar person={author} size={35} /><View style={[styles.flex, styles.questionCopy]}><Text style={styles.postName}>{nameOf(author)}</Text><Text style={styles.questionText}>{postText(post)}</Text></View></View>
        <ScrollView style={styles.responses} contentContainerStyle={styles.responsesContent}>{responsesOf(post).length ? responsesOf(post).map((response, index) => <Response key={String(response.id || index)} response={response} />) : <Empty icon="chatbubble-outline" text="Be the first to respond." />}</ScrollView>
        <View style={styles.replyInput}><Avatar person={currentUser} size={35} /><TextInput value={reply} onChangeText={setReply} multiline maxLength={220} style={styles.replyTextInput} placeholder="Write a response" placeholderTextColor={colors.muted} /><Pressable disabled={!reply.trim()} onPress={send} style={[styles.send, !reply.trim() && styles.disabled]}><Icon name="arrow-up" color={colors.white} size={19} /></Pressable></View>
      </View></KeyboardAvoidingView></View>
    </Modal>
  );
}

function PostEditorSheet({ post, onClose, onSave }) {
  const [question, setQuestion] = useState('');
  useEffect(() => { setQuestion(post ? postText(post) : ''); }, [post]);
  if (!post) return null;
  const save = async () => {
    if (await onSave(post.id, question)) onClose();
  };
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}><Pressable style={styles.dismiss} onPress={onClose} /><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.editorSheet}>
        <View style={styles.handle} /><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Edit post</Text><Pressable accessibilityLabel="Close post editor" onPress={onClose} style={styles.close}><Icon name="close" color={colors.purpleDark} size={20} /></Pressable></View>
        <TextInput value={question} onChangeText={setQuestion} style={styles.editorInput} multiline maxLength={220} placeholder="Ask what is on your mind..." placeholderTextColor={colors.muted} autoFocus />
        <View style={styles.editorFooter}><Text style={styles.mutedSmall}>{question.length}/220</Text><Pressable disabled={!question.trim()} onPress={save} style={[styles.smallButton, !question.trim() && styles.disabled]}><Text style={styles.smallButtonText}>Save changes</Text></Pressable></View>
      </View></KeyboardAvoidingView></View>
    </Modal>
  );
}

function Response({ response }) {
  const author = response.author || response.user || response;
  return <View style={styles.response}><Avatar person={author} size={37} /><View style={[styles.flex, styles.responseCopy]}><View style={styles.responseTop}><Text style={styles.postName}>{nameOf(author)}</Text><Text style={styles.mutedSmall}>{formatRelativeTime(response.createdAt || response.time)}</Text></View><Text style={styles.responseBody}>{response.text || response.content || response.answer || ''}</Text></View></View>;
}

function Header({ title, onSettings, unread = 0, onBack }) {
  return <View style={styles.header}>{onBack ? <Pressable onPress={onBack} style={styles.headerIcon}><Icon name="chevron-back" color={colors.ink} size={23} /></Pressable> : <Brand compact />}{title && <Text style={styles.headerTitle}>{title}</Text>}{onSettings ? <Pressable onPress={onSettings} style={styles.headerIcon}><Icon name="settings-outline" color={colors.ink} size={19} />{unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text></View>}</Pressable> : <View style={styles.headerIcon} />}</View>;
}

function BottomNav({ active, onNavigate, unread = 0 }) {
  const items = [['home', 'home-outline', 'home', 'Home'], ['discover', 'compass-outline', 'compass', 'Discover'], ['notifications', 'notifications-outline', 'notifications', 'Updates']];
  return <View style={styles.nav}>{items.map(([key, outline, solid, label]) => <Pressable key={key} onPress={() => onNavigate(key)} style={styles.navItem}><View>{<Icon name={active === key ? solid : outline} color={active === key ? colors.purple : '#AAA4B7'} size={22} />}{key === 'notifications' && unread > 0 && <View style={styles.navBadge}><Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text></View>}</View><Text style={[styles.navText, active === key && styles.activeNavText]}>{label}</Text></Pressable>)}</View>;
}

function Brand({ compact = false }) {
  return <View style={[styles.brand, compact && styles.compactBrand]}>{!compact && <Image source={logo} style={styles.logo} resizeMode="contain" />}<Text style={styles.brandText}>secret<Text style={styles.brandDot}>.</Text></Text></View>;
}

function Tag({ children }) { return <View style={styles.tag}><Text style={styles.tagText}>{children}</Text></View>; }
function Icon({ name, color, size, style }) { return <Ionicons name={name} color={color} size={size} style={style} />; }
function TitleRow({ title, onRefresh }) { return <View style={styles.titleRow}><Text style={styles.sectionTitle}>{title}</Text><Pressable onPress={onRefresh}><Icon name="refresh-outline" color={colors.purple} size={20} /></Pressable></View>; }
function Empty({ icon, text }) { return <View style={styles.empty}><Icon name={icon} color="#C8C1D8" size={29} /><Text style={styles.emptyText}>{text}</Text></View>; }
function Stat({ value, label }) { return <View style={styles.stat}><Text style={styles.statValue}>{value === undefined || value === null ? '—' : String(value)}</Text><Text style={styles.mutedSmall}>{label}</Text></View>; }
function InlineError({ text }) { return <View style={styles.inlineError}><Icon name="alert-circle-outline" color={colors.danger} size={16} /><Text style={styles.errorText}>{text}</Text></View>; }
function ErrorBar({ message, onClose }) { return <Pressable onPress={onClose} style={styles.errorBar}><Icon name="alert-circle-outline" color={colors.white} size={18} /><Text numberOfLines={2} style={styles.errorBarText}>{message}</Text><Icon name="close" color={colors.white} size={18} /></Pressable>; }
function SystemScreen({ icon, title, text, onPrimary, primaryLabel }) { return <SafeAreaView style={styles.system}><Brand /><View style={styles.systemCard}><Icon name={icon} color={colors.purple} size={31} /><Text style={styles.systemTitle}>{title}</Text><Text style={styles.systemText}>{text}</Text>{onPrimary && <Pressable style={styles.primaryButton} onPress={onPrimary}><Text style={styles.primaryButtonText}>{primaryLabel}</Text></Pressable>}</View></SafeAreaView>; }

let styles;
const createStyles = () => StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.page }, screen: { flex: 1, backgroundColor: colors.page }, content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 98 },
  header: { height: 62, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerTitle: { position: 'absolute', left: 78, right: 78, textAlign: 'center', fontSize: 19, color: colors.ink, fontWeight: '800' }, headerIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -3, right: -5, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#E78895', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.page }, badgeText: { color: colors.white, fontSize: 8, fontWeight: '800' },
  brand: { alignItems: 'center', marginBottom: 18 }, compactBrand: { marginBottom: 0, flexDirection: 'row' }, logo: { width: 76, height: 58, marginBottom: -8 }, brandText: { color: colors.ink, fontSize: 26, fontWeight: '800', letterSpacing: -1.3 }, brandDot: { color: colors.purple },
  authWrap: { flex: 1, backgroundColor: colors.lavender }, authScroll: { flexGrow: 1, justifyContent: 'center', padding: 22 }, authCard: { backgroundColor: colors.white, borderRadius: 27, padding: 24, shadowColor: '#594E72', shadowOpacity: 0.11, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 3 }, tag: { alignSelf: 'flex-start', backgroundColor: colors.softPurple, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginBottom: 14 }, tagText: { color: colors.purpleDark, fontSize: 10, letterSpacing: 1, fontWeight: '800' }, authTitle: { color: colors.ink, fontSize: 29, lineHeight: 34, letterSpacing: -0.8, fontWeight: '800', marginBottom: 10 }, authSubtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 24 }, authFooter: { color: colors.purpleDark, textAlign: 'center', marginTop: 22, fontSize: 13 }, link: { color: colors.purpleDark, fontWeight: '800', textDecorationLine: 'underline' },
  inputGroup: { marginBottom: 16 }, inputLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 7 }, inputShell: { minHeight: 49, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.input, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }, input: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 10 }, inputAction: { color: colors.purple, fontSize: 12, fontWeight: '800', paddingLeft: 8 },
  primaryButton: { height: 52, borderRadius: 14, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 6 }, primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: '800' }, buttonEnd: { position: 'absolute', right: 18 }, disabled: { opacity: 0.58 }, inlineError: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dangerSurface, borderRadius: 10, padding: 10, marginBottom: 12 }, errorText: { flex: 1, color: colors.danger, fontSize: 12, marginLeft: 6, lineHeight: 17 },
  search: { height: 46, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginBottom: 16 }, searchInput: { flex: 1, color: colors.ink, fontSize: 14 },
  composer: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 22 }, composerBody: { flex: 1, marginLeft: 11 }, composerInput: { minHeight: 50, color: colors.ink, fontSize: 15, lineHeight: 21, textAlignVertical: 'top', paddingTop: 0 }, composerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, smallButton: { backgroundColor: colors.purple, height: 29, paddingHorizontal: 16, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, smallButtonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.25 }, mutedSmall: { color: colors.muted, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 15, marginBottom: 16 }, postTop: { flexDirection: 'row', alignItems: 'center' }, postAuthor: { flex: 1, marginLeft: 10 }, postName: { color: colors.ink, fontSize: 14, fontWeight: '800' }, iconHit: { padding: 5 }, postText: { color: colors.ink, fontSize: 16, lineHeight: 23, fontWeight: '600', marginTop: 14 }, postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 17, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line }, inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 5 }, replyText: { color: colors.purple, fontSize: 12, fontWeight: '800' },
  nav: { height: 67, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, borderTopWidth: 1, borderColor: colors.line, paddingBottom: Platform.OS === 'ios' ? 5 : 0 }, navItem: { width: 74, alignItems: 'center', paddingTop: 6 }, navText: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 3 }, activeNavText: { color: colors.purple }, navBadge: { position: 'absolute', top: -5, right: -11, minWidth: 15, height: 15, borderRadius: 8, backgroundColor: '#E78895', justifyContent: 'center', alignItems: 'center' },
  hero: { backgroundColor: colors.lavender, borderRadius: 19, padding: 21, marginBottom: 24 }, kicker: { color: colors.purpleDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }, heroTitle: { color: colors.ink, fontSize: 25, lineHeight: 29, letterSpacing: -0.7, fontWeight: '800', marginBottom: 8 }, heroSub: { color: colors.ink, fontSize: 13, lineHeight: 19, maxWidth: 260 },
  trend: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.line }, trendNumber: { color: colors.muted, fontSize: 11, fontWeight: '800', width: 32 }, flex: { flex: 1 }, trendTag: { color: colors.ink, fontSize: 15, fontWeight: '800' }, personRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center' }, personCopy: { marginLeft: 11 }, divider: { borderBottomWidth: 1, borderColor: colors.line }, viewPill: { borderWidth: 1.25, borderColor: colors.purple, height: 31, minWidth: 57, paddingHorizontal: 9, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, viewText: { color: colors.purple, fontSize: 11, fontWeight: '800' },
  notificationHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 3 }, readPill: { backgroundColor: colors.softPurple, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 11 }, readText: { color: colors.purpleDark, fontSize: 11, fontWeight: '800' }, notification: { flexDirection: 'row', paddingVertical: 15 }, notificationCopy: { marginLeft: 11, paddingTop: 1 }, notificationText: { color: colors.ink, fontSize: 13, lineHeight: 19 }, dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E78895', position: 'absolute', top: -1, right: -1, borderWidth: 2, borderColor: colors.white }, refreshButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 7, backgroundColor: colors.softPurple, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }, refreshText: { color: colors.purpleDark, fontSize: 12, fontWeight: '800' },
  settingsProfile: { backgroundColor: colors.lavender, borderRadius: 18, minHeight: 88, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 25 }, groupLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8, marginLeft: 3 }, setting: { minHeight: 70, flexDirection: 'row', alignItems: 'center' }, settingIcon: { width: 33, height: 33, borderRadius: 10, backgroundColor: colors.softPurple, alignItems: 'center', justifyContent: 'center' }, settingTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, resetButton: { minHeight: 65, borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.dangerSurface, borderRadius: 14, paddingHorizontal: 15, marginBottom: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, resetTitle: { color: colors.danger, fontSize: 13, fontWeight: '800' }, logoutButton: { height: 51, borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.dangerSurface, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  profileHero: { flexDirection: 'row', alignItems: 'center' }, profileCopy: { marginLeft: 14 }, profileName: { color: colors.ink, fontSize: 21, letterSpacing: -0.4, fontWeight: '800' }, followButton: { height: 35, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.purple, justifyContent: 'center', alignItems: 'center' }, followingButton: { backgroundColor: colors.softPurple, borderWidth: 1, borderColor: colors.line }, followText: { color: colors.white, fontSize: 12, fontWeight: '800' }, followingText: { color: colors.purpleDark }, bio: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 20 }, stats: { height: 74, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, marginTop: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, stat: { alignItems: 'center', flex: 1 }, statValue: { color: colors.ink, fontSize: 18, fontWeight: '800' }, statLine: { height: 29, width: 1, backgroundColor: colors.line }, tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.line, marginTop: 26, marginBottom: 15 }, tab: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderColor: 'transparent' }, activeTab: { borderColor: colors.purple }, tabText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, activeTabText: { color: colors.purple, fontWeight: '800' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 9 }, emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center' }, fallbackAvatar: { backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35, 29, 48, 0.38)' }, dismiss: { flex: 1 }, sheet: { height: '75%', minHeight: 420, backgroundColor: colors.white, borderTopLeftRadius: 27, borderTopRightRadius: 27, paddingHorizontal: 18 }, handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 3, backgroundColor: colors.line, marginTop: 9 }, sheetHeader: { height: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' }, close: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.softPurple, justifyContent: 'center', alignItems: 'center' }, question: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: 14, padding: 12, marginBottom: 4 }, questionCopy: { marginLeft: 10 }, questionText: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '600', marginTop: 4 }, responses: { flex: 1 }, responsesContent: { paddingVertical: 6 }, response: { flexDirection: 'row', paddingVertical: 12 }, responseCopy: { marginLeft: 10 }, responseTop: { flexDirection: 'row', alignItems: 'baseline', gap: 6 }, responseBody: { color: colors.ink, fontSize: 13, lineHeight: 18, marginTop: 4 }, replyInput: { minHeight: 64, paddingVertical: 9, borderTopWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center' }, replyTextInput: { flex: 1, minHeight: 39, maxHeight: 75, borderRadius: 17, backgroundColor: colors.input, color: colors.ink, marginLeft: 9, paddingHorizontal: 13, paddingVertical: 9, fontSize: 13 }, send: { width: 35, height: 35, borderRadius: 18, backgroundColor: colors.purple, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  editorSheet: { minHeight: 265, backgroundColor: colors.white, borderTopLeftRadius: 27, borderTopRightRadius: 27, paddingHorizontal: 18, paddingBottom: 25 }, editorInput: { minHeight: 105, borderRadius: 14, backgroundColor: colors.input, color: colors.ink, padding: 14, fontSize: 15, textAlignVertical: 'top' }, editorFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  errorBar: { position: 'absolute', left: 16, right: 16, bottom: 18, minHeight: 52, borderRadius: 14, backgroundColor: '#4F4660', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, elevation: 7 }, errorBarText: { color: colors.white, fontSize: 12, lineHeight: 17, flex: 1 },
  system: { flex: 1, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', padding: 24 }, systemCard: { width: '100%', maxWidth: 380, backgroundColor: colors.white, borderRadius: 24, padding: 24, alignItems: 'center', gap: 13 }, systemTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' }, systemText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});

styles = createStyles();
