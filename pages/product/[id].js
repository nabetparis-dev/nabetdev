import Head from "next/head";
import SEO from "../../components/SEO";
import { productJsonLd, breadcrumbJsonLd } from "../../lib/seo";
import Link from "next/link";
import { shekel } from "../../lib/format";
import { useEffect } from "react";
import { useCart } from "../../components/CartContext";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import ProductGallery from "../../components/ProductGallery";
import { useLang } from "../../components/LanguageContext";

export async function getServerSideProps({ params }) {
  const { readJson, siteUrl } = await import("../../lib/serverData");
  const products = readJson("products");
  const categories = readJson("categories");
  const product = products.find(p => p.id === params.id || p.slug === params.id);
  if (!product) return { notFound: true };
  const canonical = `${siteUrl()}/product/${product.id}`;
  const related = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 30);
  return { props: { product, related, category: categories.find(c => c.id === product.categoryId) || null, categories, content: readJson("content"), cms: readJson("pagesCms"), canonical } };
}

function productUrgency(product, t){
  if(Number(product.stock) <= 0) return t("outOfStock");
  if(product.urgentText) return product.urgentText;
  if(product.showStockUrgency === false) return "";
  if(Number(product.stock) === 1) return t("lastStock");
  if(Number(product.stock) <= 3) return t("limitedStock");
  return "";
}

export default function Product({ product, related = [], category, categories, content, cms, canonical }) {
  const { translateProduct, translateCategory, translateText, t } = useLang();
  const tProduct = translateProduct(product);
  const tCategory = translateCategory(category);
  const tRelated = related.map(translateProduct);
  const schema = {
    "@context":"https://schema.org",
    "@type":"Product",
    name: tProduct.name,
    image: product.image,
    description: tProduct.seoDescription || tProduct.shortDescription,
    brand: {"@type":"Brand","name":"NABET PARIS"},
    offers: {"@type":"Offer", priceCurrency:"ILS", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock":"https://schema.org/OutOfStock", url: canonical}
  };

  const cart = useCart();
  useEffect(() => { cart?.registerProducts([product, ...related]); }, [product, related]);

  function addToCart() {
    cart.add(product);
  }


  return (
    <>
      <SEO title={tProduct.seoTitle || `${tProduct.name} | NABET PARIS`} description={tProduct.seoDescription || tProduct.shortDescription} canonical={`/product/${product.id}`} image={(product.images && product.images[0]) || product.image} type="product" jsonLd={{"@context":"https://schema.org","@graph":[productJsonLd(tProduct, tCategory), breadcrumbJsonLd([{name:"בית",url:"/"},{name:tCategory?.name || t("products"),url:`/category/${category?.id || ""}`},{name:tProduct.name,url:`/product/${product.id}`}])]}} />

      <Header categories={categories} content={content} cms={cms} />

      <main className="productPage">
        <ProductGallery product={tProduct} />
        <div className="productInfo">
          <Link href={`/category/${category?.id || ""}`} className="mini">{tCategory?.name}</Link>
          <h1>{tProduct.name}</h1>
          <div className="productRatingBlock">
          <span>★★★★★</span>
          <b>{product.rating || 5}/5</b>
          <em>{product.reviewCount || 50} {t("reviews")}</em>
        </div>
        <p className="lead">{tProduct.shortDescription}</p>
        {tProduct.color && <div className="productColorBadge">{t("color")}: {tProduct.color}</div>}
        {productUrgency(tProduct, t) && <div className="productUrgencyBig">{productUrgency(tProduct, t)}</div>}
        <div className="galleryTrustLine">{translateText("✓ כמה תמונות מוצר  ✓ זום להגדלה  ✓ קנייה בטוחה")}</div>
          <div className="prices big"><b>{shekel(product.price)}</b><span>{shekel(product.oldPrice)}</span></div>
        <div className="multiBuyPromo">
          <b>{t("discount2")}</b>
          <span>{translateText("בקנייה של 2 מוצרים או יותר — הזדמנות מושלמת להוסיף עוד פריט לעגלה.")}</span>
        </div>
          <p>{tProduct.description}</p>
          <p className="stock">{translateText("נשארו במלאי")}: {product.stock}</p>
          <div className="productActions"><button onClick={addToCart} disabled={product.stock <= 0} className="buy">{t("addToCart")}</button></div>
        </div>
      </main>

      <section className="reviewsSection">
        <div className="sectionTitle">
          <span>NABET PARIS</span>
          <h2>{translateText("לקוחות ממליצים")}</h2>
          <p>{translateText("ביקורות אמיתיות בסגנון קצר וברור שנותנות ביטחון לפני רכישה.")}</p>
        </div>
        <div className="reviewsGrid">
          {(product.reviews || []).map((r, i) => (
            <article key={i} className="reviewCard">
              <div className="reviewStars">★★★★★</div>
              <b>{r.name}</b>
              <p>{translateText(r.text)}</p>
            </article>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="relatedProductsSection">
          <div className="sectionTitle">
            <span>{translateText("מומלץ להוסיף")}</span>
            <h2>{translateText("מוצרים שמתאימים לקנייה יחד")}</h2>
            <p>{translateText("בקניית 2 מוצרים או יותר תקבלו 10% הנחה נוספת — כדאי להוסיף עוד מוצר לעגלה.")}</p>
          </div>
          <div className="relatedCarousel">
            {tRelated.map(p => <ProductCard key={p.id} p={p} cat={tCategory} />)}
          </div>
        </section>
      )}
    </>
  );
}