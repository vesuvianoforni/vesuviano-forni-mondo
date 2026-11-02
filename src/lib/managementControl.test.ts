import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { orderCosts, orderMargin, profitAndLoss } from "./managementControl";

describe("managementControl", () => {
  test("margine ordine = ricavo meno costi diretti", () => {
    assert.deepEqual(orderMargin(10000, 6500), { value: 3500, percentage: 35 });
  });
  test("ordine in perdita ha margine negativo", () => {
    assert.equal(orderMargin(5000, 5600).value, -600);
  });
  test("costi sommati per ordine", () => {
    assert.deepEqual(orderCosts([{ order_id: "a", amount: 100 }, { order_id: "a", amount: 50.5 }, { order_id: "b", amount: 10 }]), { a: 150.5, b: 10 });
  });
  test("utile d'esercizio = ricavi − costi diretti − spese, solo per l'anno scelto", () => {
    const pl = profitAndLoss(2026,
      [{ id: "a", total_amount: 20000, created_at: "2026-03-01" }, { id: "b", total_amount: 9000, created_at: "2025-12-01" }],
      [{ order_id: "a", amount: 12000 }, { order_id: "b", amount: 5000 }],
      [{ expense_date: "2026-05-01", amount: 3000 }, { expense_date: "2025-05-01", amount: 999 }]);
    assert.equal(pl.revenue, 20000);
    assert.equal(pl.directCosts, 12000);
    assert.equal(pl.result, 5000);
  });
});
