import React, { useMemo } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { ErrorBar, SystemScreen } from './src/components/Ui';
import { HomeSkeletonScreen } from './src/components/LoadingSkeletons';
import { PostEditorSheet, ReplySheet } from './src/components/PostSheets';
import { applyTheme, colors } from './src/constants/theme';
import { useAppController } from './src/hooks/useAppController';
import { AuthScreen } from './src/screens/AuthScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { createStyles } from './src/styles/createStyles';

export default function App() {
  const app = useAppController();
  const darkMode = Boolean(app.data.preferences?.darkMode);

  applyTheme(darkMode);
  const styles = useMemo(() => createStyles(), [darkMode]);

  if (app.phase === 'loading') return <HomeSkeletonScreen styles={styles} />;
  if (app.phase === 'offline') return <SystemScreen icon="alert-circle-outline" title="We couldn’t load local data" text={app.error || 'Try loading your saved data again.'} onPrimary={app.restore} primaryLabel="Try again" styles={styles} colors={colors} />;
  if (app.phase === 'signedOut') return <AuthScreen error={app.error} onLogin={app.login} onRegister={app.register} styles={styles} colors={colors} />;

  return <SafeAreaView style={styles.app}>
    <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.page} />
    {app.screen === 'home' && <HomeScreen data={app.data} onNavigate={app.setScreen} onOpenPost={app.setSelectedPost} onOpenProfile={app.openProfile} onCreatePost={app.createPost} onPickPostImage={app.pickPostImage} onError={app.setError} onFavorite={app.favorite} onEditPost={app.setEditingPost} onDeletePost={app.deletePost} onSettings={() => app.setScreen('settings')} onRefresh={app.reload} styles={styles} colors={colors} />}
    {app.screen === 'discover' && <DiscoverScreen data={app.data} onNavigate={app.setScreen} onOpenProfile={app.openProfile} onSettings={() => app.setScreen('settings')} onRefresh={app.reload} styles={styles} colors={colors} />}
    {app.screen === 'notifications' && <NotificationsScreen data={app.data} onNavigate={app.setScreen} onOpenProfile={app.openProfile} onSettings={() => app.setScreen('settings')} onReadAll={app.readAll} onRefresh={app.reload} styles={styles} colors={colors} />}
    {app.screen === 'settings' && <SettingsScreen currentUser={app.data.currentUser} preferences={app.data.preferences} onUpdate={app.updatePreferences} onBack={() => app.setScreen('home')} onPickAvatar={app.pickAvatar} onResetData={app.resetLocalData} onSignOut={app.signOut} styles={styles} colors={colors} />}
    {app.screen === 'profile' && <ProfileScreen profile={app.profile} currentUser={app.data.currentUser} onBack={() => app.setScreen('home')} onFollow={app.follow} onOpenPost={app.setSelectedPost} onFavorite={app.favorite} onEditPost={app.setEditingPost} onDeletePost={app.deletePost} styles={styles} colors={colors} />}
    <ReplySheet post={app.selectedPost} currentUser={app.data.currentUser} onClose={() => app.setSelectedPost(null)} onReply={app.createResponse} onError={app.setError} styles={styles} colors={colors} />
    <PostEditorSheet post={app.editingPost} onClose={() => app.setEditingPost(null)} onSave={app.savePostEdit} styles={styles} colors={colors} />
    {!!app.error && <ErrorBar message={app.error} onClose={() => app.setError('')} styles={styles} colors={colors} />}
  </SafeAreaView>;
}
