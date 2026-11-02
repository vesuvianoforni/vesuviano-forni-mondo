import { test } from "node:test";
import { strict as assert } from "node:assert";
import { leadCountryFromPhone } from "./leadCountry";

test("UK da +44 e 0044", () => {
  assert.equal(leadCountryFromPhone("+44 7700 900123"), "UK");
  assert.equal(leadCountryFromPhone("00447755543112"), "UK");
});
test("FR da +33", () => assert.equal(leadCountryFromPhone("+33 6 12 34 56 78"), "FR"));
test("Irlanda prima di prefissi corti", () => assert.equal(leadCountryFromPhone("+353 87 123 4567"), "IE"));
test("cellulare italiano senza prefisso", () => assert.equal(leadCountryFromPhone("3501234567"), "IT"));
test("vuoto = null", () => assert.equal(leadCountryFromPhone(""), null));
