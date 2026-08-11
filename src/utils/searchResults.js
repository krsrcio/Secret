import { idOf, list, nameOf, postText } from "./presentation";

const matches = (value, query) => String(value || "").toLowerCase().includes(query);

function peopleIn(data) {
  const seen = new Set();
  return [data?.currentUser, ...list(data?.suggestions), ...list(data?.posts).map((post) => post.author || post.user)]
    .filter(Boolean)
    .filter((person) => {
      const key = String(idOf(person) || person.username || person.email || nameOf(person));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function searchResults(data, searchTerm) {
  const query = String(searchTerm || "").trim().toLowerCase();
  if (!query) return { people: [], posts: [] };

  const people = peopleIn(data)
    .filter((person) => matches(nameOf(person), query) || matches(person.username, query) || matches(person.email, query))
    .slice(0, 12);
  const posts = list(data?.posts)
    .filter((post) => matches(postText(post), query) || matches(nameOf(post.author || post.user), query))
    .slice(0, 15);

  return { people, posts };
}
