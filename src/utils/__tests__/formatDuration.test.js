import { formatDuration } from "../formatDuration";

describe("formatDuration", () => {
  it("formats milliseconds as minutes and seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(4200)).toBe("0:04");
    expect(formatDuration(65000)).toBe("1:05");
  });
});
