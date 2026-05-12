import Link from "next/link";
import { useLang } from "./LanguageContext";

export default function DynamicSections({ sections = [] }) {
  const { translateText } = useLang();
  return (
    <>
      {sections.map((s, i) => {
        if (s.type === "hero") return <HeroSection key={i} s={s} translateText={translateText} />;
        if (s.type === "columns") return <ColumnsSection key={i} s={s} translateText={translateText} />;
        if (s.type === "branches") return <BranchesSection key={i} s={s} translateText={translateText} />;
        if (s.type === "image") return <ImageSection key={i} s={s} translateText={translateText} />;
        if (s.type === "video") return <VideoSection key={i} s={s} translateText={translateText} />;
        if (s.type === "html") return <HtmlSection key={i} s={s} translateText={translateText} />;
        return <TextSection key={i} s={s} translateText={translateText} />;
      })}
    </>
  );
}

function HeroSection({ s, translateText }) {
  return (
    <section className="cmsHero" style={{ backgroundImage: `linear-gradient(90deg,rgba(255,255,255,.9),rgba(255,255,255,.58),rgba(255,255,255,.08)), url('${s.image || "/hero-premium.jpg"}')` }}>
      <div className="cmsHeroText">
        <span className="dealPill">NABET PARIS</span>
        <h1>{translateText(s.title)}</h1>
        <p>{translateText(s.text)}</p>
        <div className="actions">
          {s.buttonText && <a href={s.buttonUrl || "#"} className="btn red">{translateText(s.buttonText)}</a>}
          {s.secondButtonText && <a href={s.secondButtonUrl || "#"} className="btn light">{translateText(s.secondButtonText)}</a>}
        </div>
      </div>
      <div className="cmsHeroSale">
        <b>{s.badge || "50%"}</b>
        <span>{translateText(s.badgeText || "הנחה")}</span>
      </div>
    </section>
  );
}

function TextSection({ s, translateText }) {
  return (
    <section className="cmsTextSection">
      <h2>{translateText(s.title)}</h2>
      <p>{translateText(s.text)}</p>
      {s.buttonText && <a href={s.buttonUrl || "#"} className="btn red">{translateText(s.buttonText)}</a>}
    </section>
  );
}

function ColumnsSection({ s, translateText }) {
  return (
    <section className="cmsColumnsSection">
      <h2>{translateText(s.title)}</h2>
      <div className="cmsColumnsGrid">
        {(s.columns || []).map((c, i) => (
          <article key={i}>
            {c.image && <img src={c.image} alt={c.title || ""} />}
            {c.icon && <div className="cmsIcon">{c.icon}</div>}
            <h3>{translateText(c.title)}</h3>
            <p>{translateText(c.text)}</p>
            {c.buttonText && <a href={c.buttonUrl || "#"}>{c.buttonText}</a>}
          </article>
        ))}
      </div>
    </section>
  );
}

function BranchesSection({ s, translateText }) {
  return (
    <section className="cmsBranchesSection">
      <h2>{s.title || "הסניפים שלנו"}</h2>
      <div className="cmsBranchesGrid">
        {(s.branches || []).map((b, i) => (
          <article key={i}>
            <h3>{translateText(b.name)}</h3>
            {b.phone && <p>טלפון: {b.phone}</p>}
            {b.map && <iframe src={b.map.includes("output=embed") ? b.map : b.map.replace("/search/?api=1&query=", "?q=") + "&output=embed"} loading="lazy" />}
            {b.map && <a href={b.map} target="_blank" rel="noopener">ניווט ב-Google Maps</a>}
          </article>
        ))}
      </div>
    </section>
  );
}

function ImageSection({ s, translateText }) {
  return (
    <section className="cmsImageSection">
      {s.title && <h2>{translateText(s.title)}</h2>}
      {s.image && <img src={s.image} alt={s.title || ""} />}
      {s.text && <p>{translateText(s.text)}</p>}
    </section>
  );
}

function VideoSection({ s, translateText }) {
  return (
    <section className="cmsVideoSection">
      {s.title && <h2>{translateText(s.title)}</h2>}
      {s.video && <video src={s.video} controls playsInline />}
      {s.text && <p>{translateText(s.text)}</p>}
    </section>
  );
}

function HtmlSection({ s, translateText }) {
  return <section className="cmsHtmlSection" dangerouslySetInnerHTML={{ __html: translateText(s.html) || "" }} />;
}
