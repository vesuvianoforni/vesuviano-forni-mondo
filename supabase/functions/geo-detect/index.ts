const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map ISO country code → flag emoji
const countryToFlag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Try to get the real client IP from common proxy headers
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "";

    const apiKey = Deno.env.get("IPAPI_API_KEY");
    // ipapi.co endpoint — works with or without IP (auto-detects when no IP given)
    const url = ip
      ? `https://ipapi.co/${ip}/json/${apiKey ? `?key=${apiKey}` : ""}`
      : `https://ipapi.co/json/${apiKey ? `?key=${apiKey}` : ""}`;

    const res = await fetch(url, { headers: { "User-Agent": "VesuvianoForni/1.0" } });

    if (!res.ok) {
      console.error("ipapi error", res.status, await res.text());
      return new Response(
        JSON.stringify({ country_code: "IT", country_name: "Italy", flag: "🇮🇹" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const code = (data.country_code || data.country || "IT").toString().toUpperCase();
    const name = data.country_name || data.country || "Italy";

    return new Response(
      JSON.stringify({
        country_code: code,
        country_name: name,
        flag: countryToFlag(code),
        city: data.city || null,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (e) {
    console.error("geo-detect error", e);
    return new Response(
      JSON.stringify({ country_code: "IT", country_name: "Italy", flag: "🇮🇹" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
