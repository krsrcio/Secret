import AsyncStorage from '@react-native-async-storage/async-storage';

const DATABASE_KEY = '@secret/local-database';
const SESSION_KEY = '@secret/current-user';
const emptyDatabase = {
  users: [],
  posts: [],
  notifications: [],
  preferences: {},
};

const asArray = (value) => Array.isArray(value) ? value : [];
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function readDatabase() {
  const saved = await AsyncStorage.getItem(DATABASE_KEY);
  if (!saved) return { ...emptyDatabase };
  try {
    const parsed = JSON.parse(saved);
    return {
      ...emptyDatabase,
      ...parsed,
      users: asArray(parsed.users),
      posts: asArray(parsed.posts),
      notifications: asArray(parsed.notifications),
      preferences: parsed.preferences || {},
    };
  } catch {
    return { ...emptyDatabase };
  }
}

const writeDatabase = (database) => AsyncStorage.setItem(DATABASE_KEY, JSON.stringify(database));

function publicUser(database, user, viewerId) {
  if (!user) return null;
  const followingIds = asArray(user.followingIds);
  const viewerFollowingIds = asArray(database.users.find((item) => item.id === viewerId)?.followingIds);
  const followersCount = database.users.filter((item) => asArray(item.followingIds).includes(user.id)).length;
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
  };
}

function publicResponse(database, response, viewerId) {
  return {
    ...response,
    author: publicUser(database, database.users.find((user) => user.id === response.authorId), viewerId),
  };
}

function publicPost(database, post, viewerId) {
  const responses = asArray(post.responses).map((response) => publicResponse(database, response, viewerId));
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

async function createNotification(database, userId, actorId, message) {
  if (!userId || userId === actorId) return;
  database.notifications.unshift({
    id: makeId('notification'),
    userId,
    actorId,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

async function bootstrap(userId) {
  const database = await readDatabase();
  const currentUser = database.users.find((user) => user.id === userId);
  if (!currentUser) throw new Error('Your local session is no longer available. Please sign in again.');
  const posts = [...database.posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => publicPost(database, post, userId));
  const notifications = database.notifications
    .filter((notification) => notification.userId === userId)
    .map((notification) => ({
      ...notification,
      actor: publicUser(database, database.users.find((user) => user.id === notification.actorId), userId),
    }));
  return {
    currentUser: publicUser(database, currentUser, userId),
    posts,
    trends: buildTrends(database.posts),
    suggestions: database.users.filter((user) => user.id !== userId).map((user) => publicUser(database, user, userId)),
    notifications,
    preferences: database.preferences[userId] || {},
    unreadNotificationCount: notifications.filter((notification) => !notification.read).length,
  };
}

export const session = {
  getToken: () => AsyncStorage.getItem(SESSION_KEY),
  saveToken: (userId) => AsyncStorage.setItem(SESSION_KEY, userId),
  clear: () => AsyncStorage.removeItem(SESSION_KEY),
};

export const store = {
  async register({ username, email, password }) {
    const database = await readDatabase();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    if (database.users.some((user) => user.username.toLowerCase() === normalizedUsername || user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with that username or email already exists on this device.');
    }
    const user = {
      id: makeId('user'),
      username: normalizedUsername,
      name: username.trim(),
      email: normalizedEmail,
      password,
      followingIds: [],
      createdAt: new Date().toISOString(),
    };
    database.users.push(user);
    await writeDatabase(database);
    return user.id;
  },

  async login({ username, password }) {
    const database = await readDatabase();
    const identity = username.trim().toLowerCase();
    const user = database.users.find((item) => (item.username.toLowerCase() === identity || item.email.toLowerCase() === identity) && item.password === password);
    if (!user) throw new Error('We could not find a matching local account.');
    return user.id;
  },

  getBootstrap: bootstrap,

  async getProfile(viewerId, targetUserId) {
    const database = await readDatabase();
    const user = database.users.find((item) => item.id === targetUserId);
    if (!user) throw new Error('This profile is no longer available.');
    const posts = database.posts.filter((post) => post.authorId === targetUserId).map((post) => publicPost(database, post, viewerId));
    const answers = database.posts.filter((post) => asArray(post.responses).some((response) => response.authorId === targetUserId)).map((post) => publicPost(database, post, viewerId));
    const favorites = database.posts.filter((post) => asArray(post.favoriteUserIds).includes(targetUserId)).map((post) => publicPost(database, post, viewerId));
    return { user: publicUser(database, user, viewerId), posts, answers, favorites };
  },

  async createPost(userId, question) {
    const database = await readDatabase();
    database.posts.unshift({
      id: makeId('post'),
      authorId: userId,
      question,
      createdAt: new Date().toISOString(),
      responses: [],
      favoriteUserIds: [],
    });
    await writeDatabase(database);
  },

  async createResponse(userId, postId, text) {
    const database = await readDatabase();
    const post = database.posts.find((item) => item.id === postId);
    if (!post) throw new Error('This conversation is no longer available.');
    post.responses = [...asArray(post.responses), { id: makeId('response'), authorId: userId, text, createdAt: new Date().toISOString() }];
    await createNotification(database, post.authorId, userId, 'replied to your question.');
    await writeDatabase(database);
  },

  async toggleFavorite(userId, postId) {
    const database = await readDatabase();
    const post = database.posts.find((item) => item.id === postId);
    if (!post) throw new Error('This conversation is no longer available.');
    const ids = asArray(post.favoriteUserIds);
    post.favoriteUserIds = ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId];
    await writeDatabase(database);
  },

  async toggleFollow(viewerId, targetUserId) {
    const database = await readDatabase();
    const viewer = database.users.find((item) => item.id === viewerId);
    const target = database.users.find((item) => item.id === targetUserId);
    if (!viewer || !target) throw new Error('This profile is no longer available.');
    const following = asArray(viewer.followingIds);
    const nowFollowing = !following.includes(targetUserId);
    viewer.followingIds = nowFollowing ? [...following, targetUserId] : following.filter((id) => id !== targetUserId);
    if (nowFollowing) await createNotification(database, targetUserId, viewerId, 'started following you.');
    await writeDatabase(database);
    return store.getProfile(viewerId, targetUserId);
  },

  async markNotificationsRead(userId) {
    const database = await readDatabase();
    database.notifications = database.notifications.map((notification) => notification.userId === userId ? { ...notification, read: true } : notification);
    await writeDatabase(database);
  },

  async updatePreferences(userId, changes) {
    const database = await readDatabase();
    database.preferences[userId] = { ...(database.preferences[userId] || {}), ...changes };
    await writeDatabase(database);
  },
};
