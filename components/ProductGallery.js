import { useEffect, useState } from "react";

export default function ProductGallery({ product }) {
  const fallback = "/products/placeholder-wallet.svg";
  const images = product.images?.length ? product.images : [product.image || fallback];
  const [active, setActive] = useState(images[0]);
  const [zoom, setZoom] = useState(false);
  useEffect(() => { setActive(images[0]); }, [images[0]]);

  function safeImg(e){ e.currentTarget.src = fallback; }

  return (
    <div className="productGallery">
      <div className="mainProductImage" onClick={() => setZoom(true)}>
        <img src={active} alt={product.name} onError={safeImg} />
        <span className="zoomHint">לחצו להגדלה 🔍</span>
      </div>
      <div className="thumbGrid">
        {images.map((img, i) => (
          <button key={i} className={active === img ? "active" : ""} onClick={() => setActive(img)} type="button">
            <img src={img} alt={`${product.name} ${i+1}`} onError={safeImg} />
          </button>
        ))}
      </div>
      {zoom && (
        <div className="zoomOverlay" onClick={() => setZoom(false)}>
          <button className="zoomClose" type="button">×</button>
          <img src={active} alt={product.name} onError={safeImg} />
        </div>
      )}
    </div>
  );
}