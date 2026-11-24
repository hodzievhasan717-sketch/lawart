// Собирает для каждой опубликованной статьи страницу a/<id>.html
// (заголовок, авторы, аннотация, теги для Google и Google Scholar)
// и обновляет sitemap.xml. Запускается в GitHub Actions по расписанию.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from "node:fs";

const SITE = "https://lawart.uz";
const SUPABASE_URL = "https://xgwzpygoewtfeexraats.supabase.co";
const KEY = readFileSync("assets/key.js", "utf8").match(/"(eyJ[^"]+)"/)[1];

const api = async (path) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
};

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const day = (d) => String(d || "").slice(0, 10);
const names = (s) =>
  String(s || "").split(/;|\n/).map((x) => x.split(",")[0].trim()).filter(Boolean);
const short = (s, n) => {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s;
};

const articles = await api(
  "articles?status=eq.published&select=id,title,authors,category,abstract,keywords,lang,published_at&order=published_at.desc"
);
const news = await api("news?published=eq.true&select=id,created_at&order=created_at.desc");

function page(a) {
  const url = `${SITE}/a/${a.id}.html`;
  const au = names(a.authors);
  const kws = String(a.keywords || "").split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const desc = short(a.abstract || a.title, 300);
  const lang = a.lang || "ru";
  const ld = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: a.title,
    name: a.title,
    author: au.map((n) => ({ "@type": "Person", name: n })),
    datePublished: a.published_at,
    inLanguage: lang,
    keywords: kws.join(", "),
    abstract: a.abstract || undefined,
    about: a.category || undefined,
    url,
    isPartOf: { "@type": "Periodical", name: "Lawart", url: SITE },
    publisher: { "@type": "Organization", name: "Lawart", url: SITE },
  };
  return `<!doctype html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(a.title)} — Lawart</title>
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(kws.join(", "))}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Lawart">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(short(a.abstract, 200))}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta name="citation_title" content="${esc(a.title)}">
${au.map((n) => `<meta name="citation_author" content="${esc(n)}">`).join("\n")}
<meta name="citation_publication_date" content="${day(a.published_at).replace(/-/g, "/")}">
<meta name="citation_journal_title" content="Lawart">
<meta name="citation_publisher" content="Lawart">
<meta name="citation_language" content="${esc(lang)}">
${kws.length ? `<meta name="citation_keywords" content="${esc(kws.join("; "))}">` : ""}
<meta name="citation_abstract_html_url" content="${url}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;600&display=swap">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<style>
body{margin:0;background:#0b0c10;color:#e9e6df;font:17px/1.65 Manrope,system-ui,sans-serif}
.w{max-width:820px;margin:0 auto;padding:40px 22px 80px}
.top a{color:#c9a96e;text-decoration:none;font:600 22px "Cormorant Garamond",serif;letter-spacing:.04em}
.cat{color:#c9a96e;font-size:13px;text-transform:uppercase;letter-spacing:.12em;margin-top:48px}
h1{font:600 clamp(28px,4.4vw,44px)/1.15 "Cormorant Garamond",serif;margin:12px 0 18px}
.au{font-weight:600}.dt{color:#9a978f;font-size:14px}
h2{font:600 22px "Cormorant Garamond",serif;margin:36px 0 8px;color:#c9a96e}
.kw span{display:inline-block;border:1px solid #2c2d33;border-radius:20px;padding:3px 12px;margin:0 6px 8px 0;font-size:14px}
.btn{display:inline-block;margin-top:34px;background:#c9a96e;color:#0b0c10;padding:13px 26px;border-radius:30px;font-weight:600;text-decoration:none}
</style>
</head>
<body>
<div class="w">
<div class="top"><a href="/">Lawart</a></div>
${a.category ? `<div class="cat">${esc(a.category)}</div>` : ""}
<article>
<h1>${esc(a.title)}</h1>
<div class="au">${esc(au.join(", "))}</div>
<div class="dt">Lawart, ${day(a.published_at).split("-").reverse().join(".")}</div>
${a.abstract ? `<h2>Аннотация</h2>\n<p>${esc(a.abstract)}</p>` : ""}
${kws.length ? `<h2>Ключевые слова</h2>\n<div class="kw">${kws.map((k) => `<span>${esc(k)}</span>`).join("")}</div>` : ""}
<a class="btn" href="/article.html?id=${a.id}">Читать статью и скачать PDF</a>
</article>
</div>
</body>
</html>
`;
}

// страницы статей
mkdirSync("a", { recursive: true });
const keep = new Set();
const changed = [];
for (const a of articles) {
  const file = `a/${a.id}.html`;
  const html = page(a);
  keep.add(`${a.id}.html`);
  const old = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (old !== html) {
    writeFileSync(file, html);
    changed.push(`${SITE}/${file}`);
  }
}
// снятые с публикации статьи убираем
for (const f of readdirSync("a")) {
  if (f.endsWith(".html") && !keep.has(f)) {
    unlinkSync(`a/${f}`);
    changed.push(`${SITE}/a/${f}`);
  }
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const lastArt = articles[0] ? day(articles[0].published_at) : today;
const u = (loc, mod) => `<url><loc>${esc(loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ""}</url>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  u(`${SITE}/`, lastArt),
  u(`${SITE}/articles.html`, lastArt),
  u(`${SITE}/news.html`),
  u(`${SITE}/authors.html`),
  u(`${SITE}/offer.html`),
  ...articles.map((a) => u(`${SITE}/a/${a.id}.html`, day(a.published_at))),
  ...news.map((n) => u(`${SITE}/news-item.html?id=${n.id}`, day(n.created_at))),
].join("\n")}
</urlset>
`;
const oldMap = existsSync("sitemap.xml") ? readFileSync("sitemap.xml", "utf8") : "";
if (oldMap !== sitemap) {
  writeFileSync("sitemap.xml", sitemap);
  changed.push(`${SITE}/sitemap.xml`);
}

writeFileSync(".seo-changed", changed.join("\n"));
console.log(`Статей: ${articles.length}, новостей: ${news.length}, изменено: ${changed.length}`);
changed.forEach((x) => console.log("  " + x));
