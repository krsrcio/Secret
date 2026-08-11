import { initialData } from "../constants/appData";
import { list } from "./presentation";

const body = (value) => value?.data || value || {};

export function normalizeAppData(result) {
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
    unreadNotificationCount:
      value.unreadNotificationCount ??
      notifications.filter((item) => !item.read).length,
  };
}

export function normalizeProfile(result, fallback) {
  const value = body(result);
  return {
    user: value.user || value.profile || fallback || null,
    posts: list(value.posts),
    answers: list(value.answers),
    favorites: list(value.favorites),
  };
}
