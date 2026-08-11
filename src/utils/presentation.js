export const list = (value) => (Array.isArray(value) ? value : []);

export const idOf = (person) => person?.id || person?.userId || person?._id;
export const nameOf = (person) =>
  person?.name || person?.displayName || person?.username || "Unknown user";
export const postText = (post) =>
  post?.question || post?.content || post?.text || "";
export const responsesOf = (post) => list(post?.responses || post?.answers);
export const countOf = (post) =>
  post?.responseCount ?? post?.answerCount ?? responsesOf(post).length;
export const favoriteOf = (post) =>
  Boolean(post?.viewerHasFavorited ?? post?.isFavorited ?? post?.favorited);
