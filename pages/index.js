import Head from "next/head";
import SEO from "../components/SEO";
import { organizationJsonLd, websiteJsonLd } from "../lib/seo";
import { useEffect } from "react";
import { readJson, siteUrl } from "../lib/serverData";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import DynamicSections from "../components/DynamicSections";
import SiteFooter from "../components/SiteFooter";
import { useCart } from "../components/CartContext";
import { useLang } from "../components/LanguageContext";

export async function getServerSideProps() {
  const products = readJson("products");
  const categories = readJson("categories").sort((a,b)=>(a.order||0)-(b.order||0));
  const cms = readJson("pagesCms");
  return { props: { products, categories, content: readJson("content"), settings: readJson("settings"), cms, canonical: siteUrl() } };
}

export default function Home({ products, categories, content, settings, cms, canonical }) {
  const cart = useCart();
  const { t, translateProduct, translateSections, translateText } = useLang();
  useEffect(() => { cart?.registerProducts(products); }, [products]);

  const home = cms.home || {};
  const translatedProducts = products.map(translateProduct);
  const translatedSections = translateSections(home.sections || []);
  return (
    <>
      <SEO title={home.seoTitle || settings.seoTitle} description={home.seoDescription || settings.seoDescription} canonical="/" image="/logo-nabet.png" keywords={settings.seoKeywords} jsonLd={{"@context":"https://schema.org","@graph":[organizationJsonLd(), websiteJsonLd()]}} />

      <Header categories={categories} content={content} cms={cms} />
      <main>
        <DynamicSections sections={translatedSections} />

        <section id="products" className="section">
          <div className="sectionHead">
            <div><span className="mini">{t("collection")}</span><h2>{translateText(content.collectionTitle) || t("products")}</h2></div>
          </div>
          <div className="grid">
            {translatedProducts.map(p => <ProductCard key={p.id} p={p} cat={categories.find(c=>c.id===p.categoryId)} />)}
          </div>
        </section>
      </main>
      <SiteFooter cms={cms} />
    </>
  );
}