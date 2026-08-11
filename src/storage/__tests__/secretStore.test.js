const mockValues = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key) => mockValues.get(key) ?? null),
  setItem: jest.fn(async (key, value) => { mockValues.set(key, value); }),
  removeItem: jest.fn(async (key) => { mockValues.delete(key); }),
  multiRemove: jest.fn(async (keys) => { keys.forEach((key) => mockValues.delete(key)); }),
}));

import { store } from '../secretStore';

describe('local store', () => {
  beforeEach(async () => {
    mockValues.clear();
    await store.clearAll();
  });

  async function createUser(username) {
    return store.register({ username, email: `${username}@example.com`, password: 'passcode' });
  }

  it('keeps private activity out of a non-follower’s feed and profile', async () => {
    const ownerId = await createUser('owner');
    const viewerId = await createUser('viewer');
    await store.createPost(ownerId, 'A private #update');
    await store.updatePreferences(ownerId, { privateProfile: true });

    const beforeFollowing = await store.getBootstrap(viewerId);
    expect(beforeFollowing.posts).toHaveLength(0);

    const privateProfile = await store.getProfile(viewerId, ownerId);
    expect(privateProfile.user.canViewContent).toBe(false);
    expect(privateProfile.posts).toHaveLength(0);

    await store.toggleFollow(viewerId, ownerId);
    const afterFollowing = await store.getBootstrap(viewerId);
    expect(afterFollowing.posts.map((post) => post.question)).toEqual(['A private #update']);
  });

  it('serializes rapid writes and enforces content limits', async () => {
    const ownerId = await createUser('writer');
    await Promise.all([
      store.createPost(ownerId, 'First post'),
      store.createPost(ownerId, 'Second post'),
    ]);

    const data = await store.getBootstrap(ownerId);
    expect(data.posts).toHaveLength(2);
    await expect(store.createResponse(ownerId, data.posts[0].id, 'x'.repeat(221))).rejects.toThrow(/220 characters/i);
  });

  it('does not allow following the current user', async () => {
    const userId = await createUser('self');
    await expect(store.toggleFollow(userId, userId)).rejects.toThrow(/own profile/i);
  });

  it('only accepts safe image-picker URI schemes for profile photos', async () => {
    const userId = await createUser('avatar');
    await store.updateProfile(userId, { avatarUrl: 'file:///profile-photo.jpg' });
    await expect(store.updateProfile(userId, { avatarUrl: 'javascript:alert(1)' })).rejects.toThrow(/valid profile photo/i);
  });

  it('persists an optional photo with a photo-only post', async () => {
    const userId = await createUser('photographer');
    await store.createPost(userId, '', 'file:///post-photo.jpg');

    const data = await store.getBootstrap(userId);
    expect(data.posts[0]).toMatchObject({ question: '', imageUrl: 'file:///post-photo.jpg' });
  });
});
