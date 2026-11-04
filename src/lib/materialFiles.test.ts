import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { materialFormat, materialUploadKind } from "./materialFiles";

describe("Material file recognition", () => {
  it("recognizes the reported PDF instead of treating it as a photo", () => {
    assert.equal(materialFormat("https://example.com/VESUVIANO_RealBosco_100cm-4.pdf"), "pdf");
    assert.equal(materialUploadKind("VESUVIANO_RealBosco_100cm-4.pdf", "application/pdf", "foto"), "documento");
  });
  it("preserves the selected technical sheet category for a PDF", () => {
    assert.equal(materialUploadKind("scheda.PDF", "application/pdf", "scheda"), "scheda");
  });
  it("recognizes MIME types and URLs with query parameters", () => {
    assert.equal(materialFormat("file", "application/pdf"), "pdf");
    assert.equal(materialFormat("photo.JPG?download=1"), "image");
    assert.equal(materialFormat("video.mp4#t=1"), "video");
    assert.equal(materialUploadKind("video.mp4", "video/mp4", "foto"), "video");
  });
});