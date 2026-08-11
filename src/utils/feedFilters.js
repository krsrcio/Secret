import { countOf, postText } from "./presentation";

export const feedFilters = [
  ["all", "All"],
  ["text", "Text"],
  ["photo", "Photos"],
  ["voice", "Voice"],
  ["unanswered", "Unanswered"],
];

export function matchesFeedFilter(post, filter) {
  if (filter === "text") return Boolean(postText(post));
  if (filter === "photo") return Boolean(post?.imageUrl);
  if (filter === "voice") return Boolean(post?.audioUrl);
  if (filter === "unanswered") return countOf(post) === 0;
  return true;
}
