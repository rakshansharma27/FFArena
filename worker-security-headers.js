export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 1. Intercept sitemap requests
        if (url.pathname === "/sitemap.xml") {
            return buildSitemap(env);
        }

        // 2. Intercept debug requests
        if (url.pathname === "/debug-sitemap") {
            return debugSitemap(env);
        }

        // 3. FIX: Fallback to standard fetch if not on Pages, 
        // or use env.ASSETS if you are specifically on Cloudflare Pages.
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }
        return fetch(request);
    }
};

async function buildSitemap(env) {
    const base = "https://ffarena.live";
    const today = new Date().toISOString().slice(0, 10);

    // Ensure these Environment Variables are set in Cloudflare Settings -> Variables
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseAnon = env.SUPABASE_ANON_KEY;

    const staticUrls = [
        { loc: `${base}/`, changefreq: "daily", priority: "1.0" },
        { loc: `${base}/news.html`, changefreq: "daily", priority: "0.9" },
        { loc: `${base}/leaderboard.html`, changefreq: "hourly", priority: "0.9" },
        { loc: `${base}/about.html`, changefreq: "monthly", priority: "0.6" },
        { loc: `${base}/contact.html`, changefreq: "monthly", priority: "0.6" },
        { loc: `${base}/privacy.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/terms.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/character-combos.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/faq.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/headshot-settings.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/hub.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/lfg.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/my-tournaments.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/organizer.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/organizers.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/post.html`, changefreq: "daily", priority: "0.5" },
        { loc: `${base}/redeem-codes.html`, changefreq: "daily", priority: "0.5" },
        { loc: `${base}/results.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/road-to-pro.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/rules.html`, changefreq: "yearly", priority: "0.5" },
        { loc: `${base}/sensitivity-settings.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/teams.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/tips.html`, changefreq: "hourly", priority: "0.5" },
        { loc: `${base}/tournament.html`, changefreq: "hourly", priority: "0.5" },
    ];

    let posts = [];
    try {
        const endpoint = `${supabaseUrl}/rest/v1/news?select=slug,created_at&slug=not.is.null&order=created_at.desc&limit=1000`;
        const res = await fetch(endpoint, {
            headers: {
                apikey: supabaseAnon,
                Authorization: `Bearer ${supabaseAnon}`
            }
        });
        if (res.ok) posts = await res.json();
    } catch (e) {
        console.error("Supabase fetch failed:", e);
    }

    const dynamicUrls = (posts || []).map((p) => ({
        loc: `${base}/post.html?id=${encodeURIComponent(p.slug)}`,
        lastmod: (p.created_at || today).slice(0, 10),
        changefreq: "weekly",
        priority: "0.8"
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].map(
        (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ).join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "content-type": "application/xml; charset=UTF-8",
            "cache-control": "public, max-age=300"
        }
    });
}

// Simple debug function to see if data is coming through
async function debugSitemap(env) {
    return new Response(JSON.stringify({
        url_configured: !!env.SUPABASE_URL,
        key_configured: !!env.SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString()
    }), { headers: { "content-type": "application/json" } });
}

function escapeXml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}