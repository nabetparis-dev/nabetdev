import Head from "next/head";
const SITE_URL = "https://www.nabet-paris.com";
export default function SEO({title,description,canonical="/",image="/logo-nabet.png",type="website",jsonLd=null,keywords=""}) {
  const url = canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`;
  const img = image?.startsWith("http") ? image : `${SITE_URL}${image || "/logo-nabet.png"}`;
  return <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href={url} />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:type" content={type} />
    <meta property="og:site_name" content="NABET PARIS" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={img} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={img} />
    <link rel="preconnect" href="https://usercontent.one" />
    <link rel="dns-prefetch" href="https://usercontent.one" />
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />}
  </Head>;
}