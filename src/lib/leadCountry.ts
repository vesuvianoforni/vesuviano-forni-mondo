// Deduce il paese del lead dal prefisso internazionale del telefono.
export const leadCountries: { code: string; label: string; prefix: string }[] = [
  { code: "IT", label: "Italia", prefix: "39" },
  { code: "UK", label: "Regno Unito", prefix: "44" },
  { code: "FR", label: "Francia", prefix: "33" },
  { code: "DE", label: "Germania", prefix: "49" },
  { code: "ES", label: "Spagna", prefix: "34" },
  { code: "CH", label: "Svizzera", prefix: "41" },
  { code: "BE", label: "Belgio", prefix: "32" },
  { code: "NL", label: "Paesi Bassi", prefix: "31" },
  { code: "AT", label: "Austria", prefix: "43" },
  { code: "IE", label: "Irlanda", prefix: "353" },
  { code: "PT", label: "Portogallo", prefix: "351" },
  { code: "US", label: "USA / Canada", prefix: "1" },
  { code: "AE", label: "Emirati Arabi", prefix: "971" },
  { code: "AU", label: "Australia", prefix: "61" },
];

const byLongestPrefix = [...leadCountries].sort((a, b) => b.prefix.length - a.prefix.length);

export function leadCountryFromPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (trimmed.startsWith("+")) {
    // già internazionale
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("3") && digits.length === 10) {
    return "IT"; // cellulare italiano senza prefisso
  } else if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    return "IT"; // fisso italiano senza prefisso
  }
  const match = byLongestPrefix.find(c => digits.startsWith(c.prefix));
  return match ? match.code : "OTHER";
}
