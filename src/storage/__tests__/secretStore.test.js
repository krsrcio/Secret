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

  it('persists a voice-only post', async () => {
    const userId = await createUser('podcaster');
    await store.createPost(userId, '', null, 'file:///post-voice-note.m4a', 65000);

    const data = await store.getBootstrap(userId);
    expect(data.posts[0]).toMatchObject({
      question: '',
      audioUrl: 'file:///post-voice-note.m4a',
      audioDurationMs: 65000,
    });
  });

  it('replaces post attachments during an edit', async () => {
    const userId = await createUser('editor');
    await store.createPost(userId, 'Original', 'file:///first.jpg', 'file:///first.m4a', 1000);
    const post = (await store.getBootstrap(userId)).posts[0];

    await store.updatePost(userId, post.id, {
      question: 'Updated',
      imageUrl: null,
      audioUrl: 'file:///replacement.m4a',
      audioDurationMs: 3600,
    });

    expect((await store.getBootstrap(userId)).posts[0]).toMatchObject({
      question: 'Updated',
      imageUrl: null,
      audioUrl: 'file:///replacement.m4a',
      audioDurationMs: 3600,
    });
  });

  it('persists a voice-only response', async () => {
    const userId = await createUser('speaker');
    await store.createPost(userId, 'Share an update');
    const post = (await store.getBootstrap(userId)).posts[0];

    await store.createResponse(userId, post.id, '', 'file:///voice-note.m4a', 4200);

    const data = await store.getBootstrap(userId);
    expect(data.posts[0].responses[0]).toMatchObject({
      text: '',
      audioUrl: 'file:///voice-note.m4a',
      audioDurationMs: 4200,
    });
  });

  it('links reply notifications to their post and can mark one as read', async () => {
    const ownerId = await createUser('owner-notification');
    const responderId = await createUser('responder-notification');
    await store.createPost(ownerId, 'Tell me something good.');
    const post = (await store.getBootstrap(ownerId)).posts[0];

    await store.createResponse(responderId, post.id, 'A good reply.');
    const notification = (await store.getBootstrap(ownerId)).notifications[0];
    expect(notification).toMatchObject({ postId: post.id, type: 'response', read: false });

    await store.markNotificationRead(ownerId, notification.id);
    expect((await store.getBootstrap(ownerId)).notifications[0].read).toBe(true);
  });

  it('saves and clears a local post draft', async () => {
    const userId = await createUser('drafter');
    await store.savePostDraft(userId, { question: 'Finish this later', imageUrl: 'file:///draft.jpg' });

    await expect(store.getPostDraft(userId)).resolves.toMatchObject({
      question: 'Finish this later',
      imageUrl: 'file:///draft.jpg',
    });

    await store.clearPostDraft(userId);
    await expect(store.getPostDraft(userId)).resolves.toBeNull();
  });

  it('hides muted profiles from the local feed', async () => {
    const ownerId = await createUser('noisy');
    const viewerId = await createUser('quiet');
    await store.createPost(ownerId, 'A post to hide');

    await store.toggleMute(viewerId, ownerId);
    expect((await store.getBootstrap(viewerId)).posts).toHaveLength(0);

    await store.toggleMute(viewerId, ownerId);
    expect((await store.getBootstrap(viewerId)).posts).toHaveLength(1);
  });

  it('updates editable profile details locally', async () => {
    const userId = await createUser('profile');
    await store.updateProfile(userId, {
      name: 'Profile Person',
      bio: 'Building a local-first app.',
      pronouns: 'they/them',
    });

    const data = await store.getBootstrap(userId);
    expect(data.currentUser).toMatchObject({
      name: 'Profile Person',
      bio: 'Building a local-first app.',
      pronouns: 'they/them',
    });
  });
});
