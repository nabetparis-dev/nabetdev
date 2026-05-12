import { siteUrl } from "../lib/serverData";
export async function getServerSideProps({ res }) {
  const base = siteUrl().replace(/^http:\/\//, "https://");
  res.setHeader("Content-Type", "text/plain");
  res.write(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${base}/sitemap.xml\nSitemap: ${base}/google-shopping-feed.xml
Host: ${base.replace(/^https?:\/\//,"")}
`);
  res.end();
  return { props: {} };
}
export default function Robots() { return null; }