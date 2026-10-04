import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  publish: vi.fn(),
  update: vi.fn(),
  save: vi.fn(),
  upload: vi.fn(),
  list: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/content/publish", () => ({ publishArticle: mocks.publish }));
vi.mock("@/lib/content/edit-article", () => ({ updateArticle: mocks.update }));
vi.mock("@/lib/content/sections/content", () => ({
  heroContent: { save: mocks.save },
}));
vi.mock("@/lib/content/sections/media", () => ({
  uploadSectionImage: mocks.upload,
}));
vi.mock("@/lib/content/media-library", () => ({
  listMediaLibrary: mocks.list,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));
import { publishArticleAction } from "@/app/admin/(protected)/articles/new/publish-actions";
import { updateArticleAction } from "@/app/admin/(protected)/articles/[id]/edit/actions";
import { saveHeroAction } from "@/app/admin/(protected)/sections/hero/actions";
import { listMediaAction } from "@/app/admin/(protected)/media-actions";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ email: "approved@example.test" });
});
const form = () => {
  const f = new FormData();
  f.set("title", "School story");
  f.set("category", "events");
  f.set("body", "Story text");
  f.set("imageIds", "");
  f.set("revision", "2");
  f.set("mutationKey", "d3bf6210-f5ec-4360-a0cb-0eb6f630d24a");
  return f;
};
describe("server action boundaries", () => {
  it.each(["publish", "edit", "section", "library"])(
    "authorizes %s before accessing content",
    async (kind) => {
      mocks.requireAdmin.mockRejectedValue(new Error("denied"));
      const action = () =>
        kind === "publish"
          ? publishArticleAction(null, form())
          : kind === "edit"
            ? updateArticleAction(1, null, form())
            : kind === "section"
              ? saveHeroAction(null, form())
              : listMediaAction({ search: "", page: 1 });
      await expect(action()).rejects.toThrow("denied");
      expect(mocks.publish).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.save).not.toHaveBeenCalled();
      expect(mocks.upload).not.toHaveBeenCalled();
      expect(mocks.list).not.toHaveBeenCalled();
    },
  );
  it("passes article revision and request identity", async () => {
    mocks.update.mockResolvedValue({
      status: "success",
      slug: "school",
      articlePath: "/news/school",
      uploadedImages: [],
      revision: 3,
    });
    await updateArticleAction(1, null, form());
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ postId: 1, expectedRevision: 2 }),
    );
    mocks.publish.mockResolvedValue({
      status: "validation_error",
      fieldErrors: { title: "Invalid" },
      uploadedImages: [],
    });
    await publishArticleAction(null, form());
    expect(mocks.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationKey: "d3bf6210-f5ec-4360-a0cb-0eb6f630d24a",
      }),
    );
  });
  it("does not replay a completed save if refreshing fails", async () => {
    mocks.publish.mockResolvedValue({
      status: "success",
      slug: "school",
      articlePath: "/news/school",
      uploadedImages: [],
      revision: 1,
    });
    mocks.refresh.mockImplementation(() => {
      throw new Error("refresh");
    });
    expect(await publishArticleAction(null, form())).toMatchObject({
      status: "success",
      cacheWarning: true,
    });
    expect(mocks.publish).toHaveBeenCalledTimes(1);
  });
});
