import { selectPostId } from "./InstagramPostEmbed";

describe("selectPostId()", () => {
  it("selects the id from post links", () => {
    expect(
      selectPostId("https://www.instagram.com/p/foobar/?utm_medium=copy_link")
    ).toEqual("p/foobar");
  });

  it("selects the id from video links", () => {
    expect(
      selectPostId("https://www.instagram.com/tv/foobar?utm_medium=copy_link")
    ).toEqual("tv/foobar");
  });

  it("selects the id from authenticated post links", () => {
    expect(
      selectPostId("https://www.instagram.com/accounts/login/?next=/p/foobar")
    ).toEqual("p/foobar");
  });
});
