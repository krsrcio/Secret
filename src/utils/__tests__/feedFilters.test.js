import { matchesFeedFilter } from "../feedFilters";

const post = { question: "A post", imageUrl: "file:///photo.jpg", audioUrl: "file:///voice.m4a", responseCount: 0 };

describe("matchesFeedFilter", () => {
  it("matches media and unanswered filters", () => {
    expect(matchesFeedFilter(post, "text")).toBe(true);
    expect(matchesFeedFilter(post, "photo")).toBe(true);
    expect(matchesFeedFilter(post, "voice")).toBe(true);
    expect(matchesFeedFilter(post, "unanswered")).toBe(true);
  });
});
