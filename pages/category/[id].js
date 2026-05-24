import Head from "next/head";
import SEO from "../../components/SEO";
import { breadcrumbJsonLd } from "../../lib/seo";
import Header from "../../components/Header";
import { useLang } from "../../components/LanguageContext";
import ProductCard from "../../components/ProductCard";
import { useEffect } from "react";
import { useCart } from "../../components/CartContext";

export async function getServerSideProps({ params }) {
  const { readJson, siteUrl } = await import("../../lib/serverData");
  const categories = readJson("categories").sort((a,b)=>(a.order||0)-(b.order||0));
  const products = readJson("products");
  const category = categories.find(c => c.id === params.id || c.slug === params.id);
  if (!category) return { notFound: true };
  return { props: { category, categories, products: products.filter(p => p.categoryId === category.id || (Array.isArray(p.categoryIds) && p.categoryIds.includes(category.id))), content: readJson("content"), cms: readJson("pagesCms"), canonical: `${siteUrl()}/category/${category.id}` } };
}

export default function Category({ category, categories, products, content, cms, canonical }) {
  const { translateProduct, translateCategory, translateText } = useLang();
  const tCategory = translateCategory(category);
  const tProducts = products.map(translateProduct);
  const cart = useCart();
  useEffect(() => { cart?.registerProducts(products); }, [products]);
  return (
    <>
      <SEO title={tCategory.seoTitle || `${tCategory.name} | NABET PARIS`} description={tCategory.seoDescription || tCategory.description} canonical={`/category/${category.id}`} image={products[0]?.image || "/logo-nabet.png"} jsonLd={breadcrumbJsonLd([{name:"בית",url:"/"},{name:tCategory.name,url:`/category/${category.id}`}])} />
      <Header categories={categories} content={content} cms={cms} />
      <main className="section">
        <span className="mini">{translateText("קטגוריה")}</span>
        <h1>{tCategory.name}</h1>
        <p className="lead">{tCategory.description}</p>
        <div className="grid">{tProducts.map(p => <ProductCard key={p.id} p={p} cat={tCategory} />)}</div>
      </main>
    </>
  );
}