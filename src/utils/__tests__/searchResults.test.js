import { searchResults } from "../searchResults";

const data = {
  currentUser: { id: "me", name: "Mina" },
  suggestions: [{ id: "ada", name: "Ada Lovelace", username: "ada" }],
  posts: [
    { id: "post-1", question: "A quiet coffee shop recommendation?", author: { id: "tom", name: "Tom" } },
    { id: "post-2", question: "Learning React Native today", author: { id: "ada", name: "Ada Lovelace", username: "ada" } },
  ],
};

describe("searchResults", () => {
  it("finds matching people and posts without repeating a person", () => {
    const results = searchResults(data, "ada");
    expect(results.people).toHaveLength(1);
    expect(results.people[0].id).toBe("ada");
    expect(results.posts.map((post) => post.id)).toEqual(["post-2"]);
  });

  it("returns no results before a search is entered", () => {
    expect(searchResults(data, " ")).toEqual({ people: [], posts: [] });
  });
});
