import { readJson, siteUrl } from "../lib/serverData";

function esc(s="") {
  return String(s || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

export async function getServerSideProps({ res }) {
  const base = siteUrl().replace(/^http:\/\//, "https://");
  const products = readJson("products").filter(p => Number(p.stock || 0) > 0);
  const categories = readJson("categories");
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const items = products.map(p => {
    const url = `${base}/product/${encodeURIComponent(p.id)}`;
    const img = (p.images && p.images[0]) || p.image || "/logo-nabet.png";
    const imageUrl = img.startsWith("http") ? img : `${base}${img}`;
    const category = catMap[p.categoryId]?.name || "NABET PARIS";
    const description = p.seoDescription || p.shortDescription || p.description || p.name;

    return `
    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(description)}</g:description>
      <g:link>${esc(url)}</g:link>
      <g:image_link>${esc(imageUrl)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${Number(p.price || 0).toFixed(2)} ILS</g:price>
      <g:brand>NABET PARIS Official</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${esc(category)}</g:product_type>
      <g:google_product_category>Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases</g:google_product_category>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
    <channel>
      <title>NABET PARIS Official Products</title>
      <link>${base}</link>
      <description>ארנקים, מזוודות, תיקי גב ואביזרי נסיעות NABET PARIS Official</description>
      ${items}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Feed() { return null; }