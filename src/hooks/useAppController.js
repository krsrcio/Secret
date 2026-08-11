import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initialData } from '../constants/appData';
import { session, store } from '../storage/secretStore';
import { normalizeAppData, normalizeProfile } from '../utils/normalizeData';
import { idOf } from '../utils/presentation';

export function useAppController() {
  const [phase, setPhase] = useState('loading');
  const [token, setToken] = useState(null);
  const [screen, setScreen] = useState('home');
  const [data, setData] = useState(initialData);
  const [profile, setProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async (activeToken) => {
    const next = normalizeAppData(await store.getBootstrap(activeToken));
    setData(next);
    return next;
  }, []);

  const restore = useCallback(async () => {
    setPhase('loading');
    try {
      const savedToken = await session.getToken();
      if (!savedToken) {
        setPhase('signedOut');
        return;
      }
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
    setProfile({ user: person, posts: [], answers: [], favorites: [], isLoading: true });
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

  const login = (values) => authenticate(store.login, values);
  const register = (values) => authenticate(store.register, values);

  return {
    phase,
    screen,
    setScreen,
    data,
    profile,
    selectedPost,
    setSelectedPost,
    editingPost,
    setEditingPost,
    error,
    setError,
    restore,
    login,
    register,
    createPost,
    createResponse,
    savePostEdit,
    deletePost,
    openProfile,
    pickAvatar,
    resetLocalData,
    signOut,
    reload,
    favorite,
    readAll,
    updatePreferences,
    follow,
  };
}
