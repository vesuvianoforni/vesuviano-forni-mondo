import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { customerPrice, effectiveDiscount, marginPercentage } from "./productPricing";

describe("productPricing", () => {
  test("lo sconto personale sostituisce quello del tipo cliente", () => {
    assert.equal(effectiveDiscount(17, 25), 25);
    assert.equal(effectiveDiscount(17, null), 17);
    assert.equal(effectiveDiscount(17, 0), 0);
  });
  test("prezzo cliente = listino del paese meno sconto", () => {
    assert.equal(customerPrice(6000, 17), 4980);
    assert.equal(customerPrice(null, 10), null);
  });
  test("margine solo con stessa valuta", () => {
    assert.equal(marginPercentage(3000, "EUR", 6000, "EUR"), 50);
    assert.equal(marginPercentage(3000, "EUR", 6000, "GBP"), null);
  });
});
