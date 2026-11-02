import { describe, it, expect } from "vitest";
import { leadCountryFromPhone } from "./leadCountry";

describe("leadCountryFromPhone", () => {
  it("UK da +44 e 0044", () => {
    expect(leadCountryFromPhone("+44 7700 900123")).toBe("UK");
    expect(leadCountryFromPhone("00447755543112")).toBe("UK");
  });
  it("FR da +33", () => expect(leadCountryFromPhone("+33 6 12 34 56 78")).toBe("FR"));
  it("Irlanda prima di prefissi corti", () => expect(leadCountryFromPhone("+353 87 123 4567")).toBe("IE"));
  it("cellulare italiano senza prefisso", () => expect(leadCountryFromPhone("3501234567")).toBe("IT"));
  it("vuoto = null", () => expect(leadCountryFromPhone("")).toBeNull());
});
