import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { materialMatchesProduct, materialProductIds, materialProductNames, toggleMaterialProduct } from "./materialProducts";

const material = {
  product_id: "anastasia",
  products: { name: "Anastasia" },
  product_asset_links: [
    { product_id: "anastasia", products: { id: "anastasia", name: "Anastasia" } },
    { product_id: "real-bosco", products: { id: "real-bosco", name: "Real Bosco" } },
  ],
};

describe("Materiali collegati a più prodotti", () => {
  for (const kind of ["foto", "video", "scheda"]) {
    it(`rende lo stesso materiale ${kind} disponibile per entrambi i prodotti`, () => {
      const asset = { ...material, kind };
      assert.equal(materialMatchesProduct(asset, "anastasia"), true);
      assert.equal(materialMatchesProduct(asset, "real-bosco"), true);
      assert.equal(materialMatchesProduct(asset, "ottavio"), false);
      assert.deepEqual(materialProductIds(asset), ["anastasia", "real-bosco"]);
    });
  }
  it("mantiene il collegamento singolo precedente", () => {
    assert.deepEqual(materialProductIds({ product_id: "anastasia" }), ["anastasia"]);
  });
  it("rimuove un prodotto senza rimuovere gli altri", () => {
    assert.deepEqual(toggleMaterialProduct(["anastasia", "real-bosco"], "anastasia"), ["real-bosco"]);
    assert.deepEqual(toggleMaterialProduct(["anastasia"], "real-bosco"), ["anastasia", "real-bosco"]);
  });
  it("considera aziendale solo il materiale senza collegamenti", () => {
    assert.equal(materialMatchesProduct({ product_id: null, product_asset_links: material.product_asset_links }, "general"), false);
    assert.equal(materialMatchesProduct({ product_id: null, product_asset_links: [] }, "general"), true);
  });
  it("include tutti i nomi prodotto senza duplicare quello principale", () => {
    assert.deepEqual(materialProductNames(material), ["Anastasia", "Real Bosco"]);
  });
});