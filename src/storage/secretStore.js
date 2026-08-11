import AsyncStorage from '@react-native-async-storage/async-storage';

const DATABASE_KEY = '@secret/local-database';
const SESSION_KEY = '@secret/current-user';
const MAX_USERNAME_LENGTH = 30;
const MAX_EMAIL_LENGTH = 254;
const MAX_CONTENT_LENGTH = 220;
const MAX_IMAGE_URL_LENGTH = 2048;
const MAX_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 180;
const MAX_PRONOUNS_LENGTH = 40;
const allowedPreferenceKeys = new Set(['darkMode', 'privateProfile', 'largeText']);

const makeEmptyDatabase = () => ({
  users: [],
  posts: [],
  notifications: [],
  preferences: {},
  drafts: {},
  privacy: {},
  onboarding: {},
});

const asArray = (value) => Array.isArray(value) ? value : [];
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// AsyncStorage does not offer transactions. Queue writes so rapid taps cannot
// cause two read-modify-write operations to overwrite one another.
let mutationQueue = Promise.resolve();
function enqueueMutation(operation) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => undefined);
  return result;
}

function normalizedUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  if (!username) throw new Error('Enter a username.');
  if (username.length > MAX_USERNAME_LENGTH) throw new Error(`Usernames can be at most ${MAX_USERNAME_LENGTH} characters.`);
  if (!/^[a-z0-9._-]+$/.test(username)) throw new Error('Usernames may use letters, numbers, periods, underscores, and hyphens only.');
  return username;
}

function normalizedEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > MAX_EMAIL_LENGTH) throw new Error('Enter a valid email address.');
  return email;
}

function validatedContent(value, label) {
  const text = String(value || '').trim();
  if (!text) throw new Error(`${label} cannot be empty.`);
  if (text.length > MAX_CONTENT_LENGTH) throw new Error(`${label} can be at most ${MAX_CONTENT_LENGTH} characters.`);
  return text;
}

function profileText(value, label, maxLength, required = false) {
  const text = String(value || '').trim();
  if (required && !text) throw new Error(`${label} cannot be empty.`);
  if (text.length > maxLength) throw new Error(`${label} can be at most ${maxLength} characters.`);
  return text;
}

function optionalMediaUrl(value, label) {
  if (value === null || value === undefined || value === '') return null;
  const imageUrl = typeof value === 'string' ? value.trim() : '';
  if (!imageUrl || imageUrl.length > MAX_IMAGE_URL_LENGTH || !/^(?:file|content|https?):\/\/|^blob:/i.test(imageUrl)) {
    throw new Error(`Choose a valid ${label}.`);
  }
  return imageUrl;
}

function validatedAudio(audioUrl, audioDurationMs) {
  const safeAudioUrl = optionalMediaUrl(audioUrl, 'voice message');
  const duration = Number(audioDurationMs);
  return {
    audioUrl: safeAudioUrl,
    audioDurationMs: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 0,
  };
}

function validatedPost(question, imageUrl, audioUrl, audioDurationMs) {
  const text = String(question || '').trim();
  const safeImageUrl = optionalMediaUrl(imageUrl, 'post photo');
  const audio = validatedAudio(audioUrl, audioDurationMs);
  if (!text && !safeImageUrl && !audio.audioUrl) throw new Error('A post needs text, a photo, or a voice message.');
  if (text.length > MAX_CONTENT_LENGTH) throw new Error(`A post can be at most ${MAX_CONTENT_LENGTH} characters.`);
  return { text, imageUrl: safeImageUrl, ...audio };
}

function validatedResponse(text, audioUrl, audioDurationMs) {
  const content = String(text || '').trim();
  const audio = validatedAudio(audioUrl, audioDurationMs);
  if (!content && !audio.audioUrl) throw new Error('A response needs text or a voice message.');
  if (content.length > MAX_CONTENT_LENGTH) throw new Error(`A response can be at most ${MAX_CONTENT_LENGTH} characters.`);
  return {
    text: content,
    ...audio,
  };
}

function requireUser(database, userId) {
  const user = database.users.find((item) => item.id === userId);
  if (!user) throw new Error('Your local account is no longer available. Please sign in again.');
  return user;
}

function privacyFor(database, userId) {
  const value = database.privacy?.[userId] || {};
  return {
    mutedIds: asArray(value.mutedIds),
    blockedIds: asArray(value.blockedIds),
  };
}

function isHiddenByViewer(database, viewerId, targetUserId) {
  if (!viewerId || viewerId === targetUserId) return false;
  const privacy = privacyFor(database, viewerId);
  return privacy.mutedIds.includes(targetUserId) || privacy.blockedIds.includes(targetUserId);
}

function canViewerSeeContent(database, targetUserId, viewerId) {
  if (targetUserId === viewerId) return true;
  if (isHiddenByViewer(database, viewerId, targetUserId)) return false;
  const preferences = database.preferences[targetUserId] || {};
  if (!preferences.privateProfile) return true;
  const viewer = database.users.find((user) => user.id === viewerId);
  return asArray(viewer?.followingIds).includes(targetUserId);
}

async function readDatabase() {
  const saved = await AsyncStorage.getItem(DATABASE_KEY);
  if (!saved) return makeEmptyDatabase();
  try {
    const parsed = JSON.parse(saved);
    return {
      ...makeEmptyDatabase(),
      ...parsed,
      users: asArray(parsed.users),
      posts: asArray(parsed.posts),
      notifications: asArray(parsed.notifications),
      preferences: parsed.preferences || {},
      drafts: parsed.drafts || {},
      privacy: parsed.privacy || {},
      onboarding: parsed.onboarding || {},
    };
  } catch {
    throw new Error('Your saved local data could not be read. Clear local app data to start again.');
  }
}

const writeDatabase = (database) => AsyncStorage.setItem(DATABASE_KEY, JSON.stringify(database));

function publicUser(database, user, viewerId) {
  if (!user) return null;
  const followingIds = asArray(user.followingIds);
  const viewerFollowingIds = asArray(database.users.find((item) => item.id === viewerId)?.followingIds);
  const followersCount = database.users.filter((item) => asArray(item.followingIds).includes(user.id)).length;
  const isPrivate = Boolean(database.preferences[user.id]?.privateProfile);
  const viewerPrivacy = privacyFor(database, viewerId);
  return {
    id: user.id,
    username: user.username,
    name: user.name || user.username,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    bio: user.bio || '',
    pronouns: user.pronouns || '',
    followingCount: followingIds.length,
    followersCount,
    postCount: database.posts.filter((post) => post.authorId === user.id).length,
    isFollowing: viewerId ? viewerFollowingIds.includes(user.id) : false,
    viewerIsFollowing: viewerId ? viewerFollowingIds.includes(user.id) : false,
    isPrivate,
    isMuted: viewerPrivacy.mutedIds.includes(user.id),
    isBlocked: viewerPrivacy.blockedIds.includes(user.id),
    canViewContent: canViewerSeeContent(database, user.id, viewerId),
  };
}

function publicResponse(database, response, viewerId) {
  return {
    ...response,
    author: publicUser(database, database.users.find((user) => user.id === response.authorId), viewerId),
  };
}

function publicPost(database, post, viewerId) {
  const responses = asArray(post.responses)
    .filter((response) => canViewerSeeContent(database, response.authorId, viewerId))
    .map((response) => publicResponse(database, response, viewerId));
  return {
    ...post,
    author: publicUser(database, database.users.find((user) => user.id === post.authorId), viewerId),
    responses,
    responseCount: responses.length,
    viewerHasFavorited: asArray(post.favoriteUserIds).includes(viewerId),
  };
}

function buildTrends(posts) {
  const counts = new Map();
  posts.forEach((post) => {
    const matches = String(post.question || '').match(/#[\p{L}\p{N}_]+/gu) || [];
    matches.forEach((tag) => counts.set(tag.toLowerCase(), (counts.get(tag.toLowerCase()) || 0) + 1));
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, postCount]) => ({ id: tag, tag, postCount }));
}

function createNotification(database, userId, actorId, message, details = {}) {
  if (!userId || userId === actorId) return;
  database.notifications.unshift({
    id: makeId('notification'),
    userId,
    actorId,
    message,
    type: details.type || 'profile',
    postId: details.postId || null,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

function profileData(database, viewerId, targetUserId) {
  const user = database.users.find((item) => item.id === targetUserId);
  if (!user) throw new Error('This profile is no longer available.');
  const canViewContent = canViewerSeeContent(database, targetUserId, viewerId);
  if (!canViewContent) return { user: publicUser(database, user, viewerId), posts: [], answers: [], favorites: [] };
  const posts = database.posts.filter((post) => post.authorId === targetUserId).map((post) => publicPost(database, post, viewerId));
  const answers = database.posts.filter((post) => asArray(post.responses).some((response) => response.authorId === targetUserId)).map((post) => publicPost(database, post, viewerId));
  const favorites = database.posts.filter((post) => asArray(post.favoriteUserIds).includes(targetUserId)).map((post) => publicPost(database, post, viewerId));
  return { user: publicUser(database, user, viewerId), posts, answers, favorites };
}

async function bootstrap(userId) {
  const database = await readDatabase();
  const currentUser = requireUser(database, userId);
  const visiblePosts = database.posts.filter((post) => canViewerSeeContent(database, post.authorId, userId));
  const posts = [...visiblePosts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => publicPost(database, post, userId));
  const notifications = database.notifications
    .filter((notification) => notification.userId === userId)
    .map((notification) => ({
      ...notification,
      actor: publicUser(database, database.users.find((user) => user.id === notification.actorId), userId),
    }));
  const currentFollowing = asArray(currentUser.followingIds);
  return {
    currentUser: publicUser(database, currentUser, userId),
    posts,
    trends: buildTrends(visiblePosts),
    suggestions: database.users
      .filter((user) => user.id !== userId && !currentFollowing.includes(user.id) && !isHiddenByViewer(database, userId, user.id))
      .map((user) => publicUser(database, user, userId)),
    notifications,
    preferences: database.preferences[userId] || {},
    draft: database.drafts[userId] || null,
    onboardingComplete: Boolean(database.onboarding[userId]),
    unreadNotificationCount: notifications.filter((notification) => !notification.read).length,
  };
}

export const session = {
  getToken: () => AsyncStorage.getItem(SESSION_KEY),
  saveToken: (userId) => AsyncStorage.setItem(SESSION_KEY, userId),
  clear: () => AsyncStorage.removeItem(SESSION_KEY),
};

export const store = {
  register({ username, email, password }) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      const usernameValue = normalizedUsername(username);
      const emailValue = normalizedEmail(email);
      if (typeof password !== 'string' || password.length < 4) throw new Error('Use at least 4 characters for your password.');
      if (database.users.some((user) => user.username.toLowerCase() === usernameValue || user.email.toLowerCase() === emailValue)) {
        throw new Error('An account with that username or email already exists on this device.');
      }
      const user = {
        id: makeId('user'),
        username: usernameValue,
        name: usernameValue,
        email: emailValue,
        password,
        followingIds: [],
        createdAt: new Date().toISOString(),
      };
      database.users.push(user);
      await writeDatabase(database);
      return user.id;
    });
  },

  async login({ username, password }) {
    const database = await readDatabase();
    const identity = String(username || '').trim().toLowerCase();
    const user = database.users.find((item) => (item.username.toLowerCase() === identity || item.email.toLowerCase() === identity) && item.password === password);
    if (!user) throw new Error('We could not find a matching local account.');
    return user.id;
  },

  getBootstrap: bootstrap,

  async getProfile(viewerId, targetUserId) {
    const database = await readDatabase();
    return profileData(database, viewerId, targetUserId);
  },

  createPost(userId, question, imageUrl = null, audioUrl = null, audioDurationMs = 0) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const post = validatedPost(question, imageUrl, audioUrl, audioDurationMs);
      database.posts.unshift({
        id: makeId('post'),
        authorId: userId,
        question: post.text,
        imageUrl: post.imageUrl,
        audioUrl: post.audioUrl,
        audioDurationMs: post.audioDurationMs,
        createdAt: new Date().toISOString(),
        responses: [],
        favoriteUserIds: [],
      });
      await writeDatabase(database);
    });
  },

  updatePost(userId, postId, changes) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const post = database.posts.find((item) => item.id === postId);
      if (!post || post.authorId !== userId) throw new Error('You can only edit your own posts.');
      const next = validatedPost(changes?.question, changes?.imageUrl, changes?.audioUrl, changes?.audioDurationMs);
      post.question = next.text;
      post.imageUrl = next.imageUrl;
      post.audioUrl = next.audioUrl;
      post.audioDurationMs = next.audioDurationMs;
      post.updatedAt = new Date().toISOString();
      await writeDatabase(database);
    });
  },

  getPostDraft(userId) {
    return readDatabase().then((database) => {
      requireUser(database, userId);
      return database.drafts[userId] || null;
    });
  },

  savePostDraft(userId, draft) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const text = String(draft?.question || '').trim();
      const imageUrl = optionalMediaUrl(draft?.imageUrl, 'draft photo');
      const audio = validatedAudio(draft?.audioUrl, draft?.audioDurationMs);
      if (!text && !imageUrl && !audio.audioUrl) {
        delete database.drafts[userId];
      } else {
        if (text.length > MAX_CONTENT_LENGTH) throw new Error(`A draft can be at most ${MAX_CONTENT_LENGTH} characters.`);
        database.drafts[userId] = { question: text, imageUrl, ...audio, updatedAt: new Date().toISOString() };
      }
      await writeDatabase(database);
    });
  },

  clearPostDraft(userId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      delete database.drafts[userId];
      await writeDatabase(database);
    });
  },

  deletePost(userId, postId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const post = database.posts.find((item) => item.id === postId);
      if (!post || post.authorId !== userId) throw new Error('You can only delete your own posts.');
      database.posts = database.posts.filter((item) => item.id !== postId);
      await writeDatabase(database);
    });
  },

  createResponse(userId, postId, text, audioUrl = null, audioDurationMs = 0) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const post = database.posts.find((item) => item.id === postId);
      if (!post) throw new Error('This conversation is no longer available.');
      const response = validatedResponse(text, audioUrl, audioDurationMs);
      post.responses = [...asArray(post.responses), {
        id: makeId('response'),
        authorId: userId,
        ...response,
        createdAt: new Date().toISOString(),
      }];
      createNotification(database, post.authorId, userId, 'replied to your question.', { type: 'response', postId: post.id });
      await writeDatabase(database);
    });
  },

  toggleFavorite(userId, postId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const post = database.posts.find((item) => item.id === postId);
      if (!post) throw new Error('This conversation is no longer available.');
      const ids = asArray(post.favoriteUserIds);
      post.favoriteUserIds = ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId];
      await writeDatabase(database);
    });
  },

  async toggleFollow(viewerId, targetUserId) {
    await enqueueMutation(async () => {
      const database = await readDatabase();
      const viewer = requireUser(database, viewerId);
      const target = database.users.find((item) => item.id === targetUserId);
      if (!target) throw new Error('This profile is no longer available.');
      if (viewer.id === target.id) throw new Error('You cannot follow your own profile.');
      const following = asArray(viewer.followingIds);
      const nowFollowing = !following.includes(targetUserId);
      viewer.followingIds = nowFollowing ? [...following, targetUserId] : following.filter((id) => id !== targetUserId);
      if (nowFollowing) createNotification(database, targetUserId, viewerId, 'started following you.', { type: 'follow' });
      await writeDatabase(database);
    });
    return store.getProfile(viewerId, targetUserId);
  },

  markNotificationsRead(userId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      database.notifications = database.notifications.map((notification) => notification.userId === userId ? { ...notification, read: true } : notification);
      await writeDatabase(database);
    });
  },

  markNotificationRead(userId, notificationId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      database.notifications = database.notifications.map((notification) => (
        notification.userId === userId && notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
      await writeDatabase(database);
    });
  },

  updatePreferences(userId, changes) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      const safeChanges = Object.fromEntries(Object.entries(changes || {}).filter(([key, value]) => allowedPreferenceKeys.has(key) && typeof value === 'boolean'));
      if (!Object.keys(safeChanges).length) throw new Error('No valid preference changes were provided.');
      database.preferences[userId] = { ...(database.preferences[userId] || {}), ...safeChanges };
      await writeDatabase(database);
    });
  },

  updateProfile(userId, changes) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      const user = requireUser(database, userId);
      if (Object.hasOwn(changes || {}, 'avatarUrl')) user.avatarUrl = optionalMediaUrl(changes.avatarUrl, 'profile photo');
      if (Object.hasOwn(changes || {}, 'name')) user.name = profileText(changes.name, 'Display name', MAX_NAME_LENGTH, true);
      if (Object.hasOwn(changes || {}, 'bio')) user.bio = profileText(changes.bio, 'Bio', MAX_BIO_LENGTH);
      if (Object.hasOwn(changes || {}, 'pronouns')) user.pronouns = profileText(changes.pronouns, 'Pronouns', MAX_PRONOUNS_LENGTH);
      await writeDatabase(database);
    });
  },

  toggleMute(userId, targetUserId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      if (userId === targetUserId) throw new Error('You cannot mute your own profile.');
      requireUser(database, targetUserId);
      const privacy = privacyFor(database, userId);
      database.privacy[userId] = {
        ...privacy,
        mutedIds: privacy.mutedIds.includes(targetUserId) ? privacy.mutedIds.filter((id) => id !== targetUserId) : [...privacy.mutedIds, targetUserId],
      };
      await writeDatabase(database);
    });
  },

  toggleBlock(userId, targetUserId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      const viewer = requireUser(database, userId);
      if (userId === targetUserId) throw new Error('You cannot block your own profile.');
      requireUser(database, targetUserId);
      const privacy = privacyFor(database, userId);
      const blocked = privacy.blockedIds.includes(targetUserId);
      database.privacy[userId] = {
        ...privacy,
        blockedIds: blocked ? privacy.blockedIds.filter((id) => id !== targetUserId) : [...privacy.blockedIds, targetUserId],
        mutedIds: privacy.mutedIds.filter((id) => id !== targetUserId),
      };
      if (!blocked) viewer.followingIds = asArray(viewer.followingIds).filter((id) => id !== targetUserId);
      await writeDatabase(database);
    });
  },

  completeOnboarding(userId) {
    return enqueueMutation(async () => {
      const database = await readDatabase();
      requireUser(database, userId);
      database.onboarding[userId] = true;
      await writeDatabase(database);
    });
  },

  clearAll() {
    return enqueueMutation(() => AsyncStorage.multiRemove([DATABASE_KEY, SESSION_KEY]));
  },
};
