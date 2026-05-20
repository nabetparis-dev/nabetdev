import Head from "next/head";
import { useEffect, useState } from "react";
import { shekel } from "../lib/format";

const sectionTemplates = {
  hero: { type:"hero", title:"כותרת ראשית", text:"טקסט", image:"/hero-premium.jpg", buttonText:"כפתור", buttonUrl:"#", secondButtonText:"כפתור שני", secondButtonUrl:"#", badge:"50%", badgeText:"הנחה" },
  slider: { type:"html", html:"<section class='homeSlider'><h2>סליידר בית</h2></section>" },
  text: { type:"text", title:"כותרת", text:"טקסט", buttonText:"", buttonUrl:"" },
  columns: { type:"columns", title:"כותרת עמודות", columns:[{title:"עמודה 1", text:"טקסט", icon:"💪"},{title:"עמודה 2", text:"טקסט", icon:"💧"},{title:"עמודה 3", text:"טקסט", icon:"🔒"}] },
  icons: { type:"columns", title:"יתרונות", columns:[{title:"משלוח מהיר", text:"שירות מהיר", icon:"🚚"},{title:"עמיד למים", text:"איכות גבוהה", icon:"💧"},{title:"תשלום בטוח", text:"קנייה בטוחה", icon:"🔒"},{title:"RFID", text:"הגנה לכרטיסים", icon:"💳"}] },
  divider: { type:"html", html:"<hr class='luxDivider'/>" },
  promo: { type:"html", html:"<section class='promoBanner'><h2>-50% על כל החנות</h2><p>מבצעי אאוטלט לזמן מוגבל</p></section>" },
  products: { type:"html", html:"<section id='products'></section>" },
  categories: { type:"html", html:"<section class='categoriesBlock'>קטגוריות</section>" },
  branches: { type:"branches", title:"הסניפים שלנו", branches:[{name:"שם סניף", phone:"", map:"https://www.google.com/maps/search/?api=1&query=ישראל"}] },
  image: { type:"image", title:"כותרת תמונה", text:"טקסט", image:"/hero-premium.jpg" },
  video: { type:"video", title:"כותרת וידאו", text:"טקסט", video:"" },
  html: { type:"html", html:"<div>HTML חופשי</div>" }
};

function emptyProduct(categories=[]){
  return {id:"",name:"",slug:"",categoryId:categories[0]?.id||"",categoryIds:categories[0]?.id?[categories[0].id]:[],price:"",oldPrice:"",stock:"",badge:"מבצע",color:"",image:"",images:[],colorVariants:[],sizeVariants:[],shortDescription:"",description:"",seoTitle:"",seoDescription:"",rating:5,reviewCount:36,reviews:[],showStockUrgency:true,urgentText:"",createdAt:new Date().toISOString()};
}
function makeSlug(text){ return String(text||"product").toLowerCase().replace(/[״׳'"]/g,"").replace(/[^\w\u0590-\u05FF]+/g,"-").replace(/^-+|-+$/g,"") || "product"; }

export default function Admin(){
  const [token,setToken]=useState("");
  const [password,setPassword]=useState("");
  const [full,setFull]=useState({products:[],categories:[],orders:[],customers:[],coupons:[],media:[],content:{},pagesCms:{},apiSettings:{},socialSettings:{},designSettings:{},translations:{},settings:{}});
  const [tab,setTab]=useState("dashboard");
  const [jsonText,setJsonText]=useState("");
  const [currentProduct,setCurrentProduct]=useState(null);
  const [currentCat,setCurrentCat]=useState(null);
  const [currentOrder,setCurrentOrder]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [optimizing,setOptimizing]=useState(false);
  const [optResult,setOptResult]=useState(null);
  const [adminMenuOpen,setAdminMenuOpen]=useState(false);

  async function load(){ const f=await fetch("/api/full").then(r=>r.json()); setFull(f); setJsonText(JSON.stringify(f.pagesCms||{},null,2)); }
  useEffect(()=>{ const t=localStorage.getItem("adminToken"); if(t)setToken(t); load(); },[]);

  async function login(){ const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})}).then(r=>r.json()); if(!r.ok)return alert("סיסמה לא נכונה"); setToken(r.token); localStorage.setItem("adminToken",r.token); }

  async function uploadFiles(files, callback){ if(!files?.length)return; setUploading(true); const fd=new FormData(); [...files].forEach(f=>fd.append("files",f)); const res=await fetch("/api/admin/upload",{method:"POST",headers:{"x-admin-token":token},body:fd}); const data=await res.json(); setUploading(false); if(!data.ok)return alert(data.error||"שגיאה בהעלאה"); callback(data.files||[]); load(); }

  async function optimizeAllImages(){
    if(!confirm("Compresser et convertir toutes les images en WebP ?")) return;
    setOptimizing(true);
    setOptResult(null);
    try{
      const res = await fetch("/api/admin/optimize-images", {method:"POST", headers:{"x-admin-token":token}});
      const data = await res.json();
      setOptResult(data);
      if(data.ok){
        alert(`Images optimisées: ${data.optimized}\nAvant: ${data.beforeMB} MB\nAprès: ${data.afterMB} MB\nRéduction: ${data.reductionPercent}%`);
        load();
      } else {
        alert(data.error || "Erreur optimisation images");
      }
    }catch(e){
      alert("Erreur optimisation images: " + e.message);
    }finally{
      setOptimizing(false);
    }
  }

  async function saveCms(nextCms=full.pagesCms){ await fetch("/api/admin/pages-cms",{method:"PUT",headers:{"Content-Type":"application/json","x-admin-token":token},body:JSON.stringify(nextCms)}); alert("נשמר"); load(); }
  function updateCms(path,value){ const cms=structuredClone(full.pagesCms||{}); let obj=cms; for(let i=0;i<path.length-1;i++){ obj[path[i]]=obj[path[i]]||{}; obj=obj[path[i]]; } obj[path[path.length-1]]=value; setFull({...full,pagesCms:cms}); }
  function addSection(pageKey,type){ const cms=structuredClone(full.pagesCms||{}); cms[pageKey]=cms[pageKey]||{title:pageKey,sections:[]}; cms[pageKey].sections=cms[pageKey].sections||[]; cms[pageKey].sections.push(structuredClone(sectionTemplates[type])); setFull({...full,pagesCms:cms}); }
  function removeSection(pageKey,index){ const cms=structuredClone(full.pagesCms||{}); cms[pageKey].sections.splice(index,1); setFull({...full,pagesCms:cms}); }
  function moveSection(pageKey,index,dir){ const cms=structuredClone(full.pagesCms||{}); const arr=cms[pageKey].sections; const ni=index+dir; if(ni<0||ni>=arr.length)return; [arr[index],arr[ni]]=[arr[ni],arr[index]]; setFull({...full,pagesCms:cms}); }
  async function saveJson(){ try{ await saveCms(JSON.parse(jsonText)); }catch{ alert("JSON לא תקין"); } }

  function duplicateProduct(p){ const stamp=Date.now().toString().slice(-6); const newName=`${p.name||"מוצר"} - צבע חדש`; const copy={...p,id:`${makeSlug(p.id||p.name)}-copy-${stamp}`,slug:makeSlug(newName),name:newName,color:p.color||"",images:p.images?[...p.images]:(p.image?[p.image]:[]),image:p.image||"",seoTitle:`${newName} | NABET PARIS ישראל`,seoDescription:p.seoDescription||p.shortDescription||"",stock:p.stock||20,showStockUrgency:p.showStockUrgency ?? true,urgentText:p.urgentText||""}; setCurrentProduct(copy); setTab("products"); }

  async function saveProduct(){
    const p={...currentProduct}; if(!p.id)p.id=makeSlug(p.name); if(!p.slug)p.slug=makeSlug(p.name||p.id); p.categoryIds = Array.isArray(p.categoryIds) && p.categoryIds.length ? p.categoryIds : (p.categoryId ? [p.categoryId] : []); p.categoryId = p.categoryIds[0] || p.categoryId; if(!p.createdAt)p.createdAt=new Date().toISOString(); p.updatedAt=new Date().toISOString(); if(!p.image&&p.colorVariants?.[0]?.image)p.image=p.colorVariants[0].image; if(!p.image&&p.images?.length)p.image=p.images[0]; if(!p.seoTitle)p.seoTitle=`${p.name} | NABET PARIS ישראל`; if(!p.seoDescription)p.seoDescription=p.shortDescription||p.description||"";
    const exists=full.products.find(x=>x.id===p.id);
    await fetch(exists?`/api/admin/products/${p.id}`:"/api/admin/products",{method:exists?"PUT":"POST",headers:{"Content-Type":"application/json","x-admin-token":token},body:JSON.stringify(p)});
    alert("המוצר נשמר"); setCurrentProduct(null); load();
  }
  async function deleteProduct(id){ if(!confirm("למחוק מוצר?"))return; await fetch(`/api/admin/products/${id}`,{method:"DELETE",headers:{"x-admin-token":token}}); load(); }

  async function saveCategory(){ const exists=full.categories.find(c=>c.id===currentCat.id); const res=await fetch(exists?`/api/admin/categories/${currentCat.id}`:"/api/admin/categories",{method:exists?"PUT":"POST",headers:{"Content-Type":"application/json","x-admin-token":token},body:JSON.stringify(currentCat)}); const data=await res.json().catch(()=>({})); if(!res.ok)return alert(data.error||"שגיאה"); alert("הקטגוריה נשמרה"); setCurrentCat(null); load(); }
  async function deleteCategory(id){ if(!confirm("למחוק קטגוריה?"))return; const res=await fetch(`/api/admin/categories/${id}`,{method:"DELETE",headers:{"x-admin-token":token}}); if(!res.ok)return alert("אי אפשר למחוק"); load(); }

  async function saveOrder(order=currentOrder){ await fetch(`/api/admin/orders/${order.id}`,{method:"PUT",headers:{"Content-Type":"application/json","x-admin-token":token},body:JSON.stringify({...order, sendEmail:true})}); alert("הזמנה נשמרה + מייל נשלח אם יש אימייל לקוח"); setCurrentOrder(null); load(); }
  async function orderAction(id, action, label){
    if(!confirm(`${label}? מייל אוטומטי יישלח ללקוח אם יש אימייל.`)) return;
    const note = action === "refuse" || action === "cancel" ? prompt("הערה ללקוח / Note client (אפשר להשאיר ריק)") || "" : "";
    const res = await fetch(`/api/admin/orders/${id}`,{method:"POST",headers:{"Content-Type":"application/json","x-admin-token":token},body:JSON.stringify({action,note})});
    const data = await res.json().catch(()=>({}));
    if(!res.ok || !data.ok) return alert(data.error || "שגיאה בעדכון הזמנה");
    alert(`${label} בוצע. ${data.statusMail?.ok ? "המייל נשלח" : "המייל נשמר בלוג / לא נשלח (בדוק SMTP או אימייל לקוח)"}`);
    load();
  }
  async function deleteOrder(id){ if(!confirm("למחוק הזמנה?"))return; await fetch(`/api/admin/orders/${id}`,{method:"DELETE",headers:{"x-admin-token":token}}); load(); }
  async function savePluginSettings(){ await fetch("/api/admin/plugin-settings",{method:"PUT",headers:{"Content-Type":"application/json","x-admin-token":token},body:JSON.stringify({apiSettings:full.apiSettings,socialSettings:full.socialSettings,designSettings:full.designSettings,coupons:full.coupons,translations:full.translations,settings:full.settings})}); alert("נשמר"); load(); }

  if(!token) return <main className="adminLogin"><Head><title>NABET PARIS Admin</title></Head><h1>כניסה לניהול</h1><input type="password" placeholder="סיסמה" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={login}>כניסה</button></main>;

  const masterProducts=(full.products||[]).filter(p=>!p.autoGeneratedFrom && !p.isCatalogShortcut); const shortcutProducts=(full.products||[]).filter(p=>p.autoGeneratedFrom || p.isCatalogShortcut);
  const revenue=(full.orders||[]).reduce((s,o)=>s+Number(o.total||0),0); const pending=(full.orders||[]).filter(o=>o.status==="pending").length; const lowStock=masterProducts.filter(p=>Number(p.stock||0)<=3).length;

  return <main className="admin wcAdmin">
    <Head><title>ניהול NABET PARIS</title></Head>
    <div className="adminTop"><h1>ניהול NABET PARIS</h1></div>
    <button className="adminMobileMenuBtn" onClick={()=>setAdminMenuOpen(v=>!v)} type="button">☰ תפריט ניהול</button><div className={`adminTabs wcTabs ${adminMenuOpen ? "open" : ""}`}>{[["dashboard","Dashboard"],["orders","Commandes"],["customers","Clients"],["products","Produits"],["media","Médias"],["imageOptimizer","Compresseur images"],["categories","Catégories"],["coupons","Coupons"],["home","Accueil"],["pages","Pages"],["header","Menu / Header"],["footer","Footer"],["socials","Google / Instagram / Facebook"],["apis","APIs / Grow / Email"],["design","Logo / Couleurs"],["seo","SEO"],["maintenance","Mode Chabbat / Maintenance"],["json","Avancé JSON"]].map(([k,l])=><button key={k} className={tab===k?"active":""} onClick={()=>{setTab(k);setAdminMenuOpen(false)}}>{l}</button>)}</div>

    {tab==="dashboard"&&<section className="dashboardGrid"><div className="dashCard"><span>CA total</span><b>{shekel(revenue)}</b></div><div className="dashCard"><span>Commandes</span><b>{full.orders?.length||0}</b></div><div className="dashCard"><span>En attente</span><b>{pending}</b></div><div className="dashCard"><span>Stock faible</span><b>{lowStock}</b></div><div className="adminBox wide"><h2>Dernières commandes</h2><OrdersTable orders={(full.orders||[]).slice(0,8)} setCurrentOrder={setCurrentOrder} deleteOrder={deleteOrder} orderAction={orderAction}/></div></section>}
    {tab==="orders"&&<section className="adminBox"><h2>Commandes</h2><OrdersTable orders={full.orders||[]} setCurrentOrder={setCurrentOrder} deleteOrder={deleteOrder} orderAction={orderAction}/></section>}
    {currentOrder&&<OrderModal order={currentOrder} setOrder={setCurrentOrder} save={saveOrder} close={()=>setCurrentOrder(null)} />}
    {tab==="customers"&&<CustomersPanel orders={full.orders||[]} />}

    {tab==="products"&&<section className="adminBox"><div className="boxHead"><h2>Produits maîtres</h2><button onClick={()=>setCurrentProduct(emptyProduct(full.categories))}>+ Ajouter un produit</button></div><p className="adminHint">Tu modifies seulement le produit maître. Les cartes catalogue couleur/taille se créent automatiquement pour la boutique, mais ne compliquent pas ton admin.</p><div className="shortcutInfo">Cartes catalogue automatiques visibles sur le site : <b>{shortcutProducts.length}</b></div><div className="adminList productList">{([...masterProducts||[]].sort((a,b)=>new Date(b.createdAt||b.updatedAt||0)-new Date(a.createdAt||a.updatedAt||0))).map(p=><div key={p.id} className="adminItem"><img src={(p.images&&p.images[0])||p.image||"/products/placeholder-wallet.svg"} onError={e=>{e.currentTarget.src="/products/placeholder-wallet.svg"}}/><b>{p.name}</b><span>{shekel(p.price)} — Stock {p.stock}</span><small>{(p.colorVariants||[]).length} couleurs · {(p.sizeVariants||[]).length} tailles</small><button onClick={()=>setCurrentProduct({...p,images:p.images||(p.image?[p.image]:[])})}>Modifier</button><button onClick={()=>duplicateProduct(p)}>Dupliquer</button><button onClick={()=>deleteProduct(p.id)}>Supprimer</button></div>)}</div></section>}
    {currentProduct&&<ProductModal p={currentProduct} setP={setCurrentProduct} categories={full.categories||[]} save={saveProduct} close={()=>setCurrentProduct(null)} uploadFiles={uploadFiles} uploading={uploading} media={full.media||[]} />}

    {tab==="media"&&<MediaPanel media={full.media||[]} token={token} uploadFiles={uploadFiles} uploading={uploading} reload={load}/>}
    {tab==="imageOptimizer"&&<ImageOptimizerPanel optimizing={optimizing} result={optResult} optimizeAllImages={optimizeAllImages} uploadFiles={uploadFiles} uploading={uploading} reload={load}/>}
    {tab==="categories"&&<CategoriesPanel full={full} setCurrentCat={setCurrentCat} currentCat={currentCat} setCurrentCatDirect={setCurrentCat} saveCategory={saveCategory} deleteCategory={deleteCategory}/>}
    {tab==="coupons"&&<CouponsPanel full={full} setFull={setFull} save={savePluginSettings}/>}
    {tab==="home"&&<PageEditor pageKey="home" page={full.pagesCms?.home} updateCms={updateCms} addSection={addSection} removeSection={removeSection} moveSection={moveSection} saveCms={()=>saveCms()} />}
    {tab==="pages"&&<PagesPanel full={full} setFull={setFull} saveCms={saveCms} updateCms={updateCms} addSection={addSection} removeSection={removeSection} moveSection={moveSection}/>}
    {tab==="header"&&<MenuPanel full={full} updateCms={updateCms} saveCms={()=>saveCms()}/>}
    {tab==="footer"&&<FooterPanel full={full} updateCms={updateCms} saveCms={()=>saveCms()}/>}
    {tab==="socials"&&<SocialPanel full={full} setFull={setFull} save={savePluginSettings}/>}
    {tab==="apis"&&<ApiPanel full={full} setFull={setFull} save={savePluginSettings}/>}
    {tab==="design"&&<DesignPanel full={full} setFull={setFull} save={savePluginSettings} uploadFiles={uploadFiles}/>}
    {tab==="seo"&&<SeoPanel />}
    {tab==="maintenance"&&<MaintenancePanel full={full} setFull={setFull} save={savePluginSettings} />}
    {tab==="json"&&<section className="adminBox"><h2>JSON avancé</h2><textarea className="jsonEditor" value={jsonText} onChange={e=>setJsonText(e.target.value)}/><button onClick={saveJson}>Sauvegarder JSON</button></section>}
  </main>
}

function OrdersTable({orders,setCurrentOrder,deleteOrder,orderAction}){
  const statusLabel = {pending:"ממתינה",received:"התקבלה",accepted:"אושרה",confirmed:"אושרה",refused:"סורבה",cancelled:"בוטלה",shipped:"נשלחה",refund_started:"החזר בטיפול",refund_confirmed:"החזר אושר",refunded:"הוחזר"};
  return <div className="ordersTable">
    <div className="ordersHead"><b>ID</b><b>Client</b><b>Total</b><b>Statut</b><b>Date</b><b>Actions</b></div>
    {orders.map(o=><div key={o.id} className="ordersRow">
      <span>{o.id}</span>
      <span>{o.customer?.name||"-"}<small>{o.customer?.phone}</small><small>{o.customer?.email}</small></span>
      <b>{shekel(o.total||0)}</b>
      <span className={"status "+o.status}>{statusLabel[o.status]||o.status}</span>
      <span>{o.date?new Date(o.date).toLocaleString("he-IL"):""}</span>
      <div className="orderActions">
        <button onClick={()=>setCurrentOrder({...o})}>Voir</button>
        <button onClick={()=>orderAction(o.id,"accept","אישור הזמנה")}>Accepter</button>
        <button onClick={()=>orderAction(o.id,"refuse","סירוב הזמנה")}>Refuser</button>
        <button onClick={()=>orderAction(o.id,"cancel","ביטול הזמנה")}>Annuler</button>
        <button onClick={()=>orderAction(o.id,"ship","סימון כנשלח")}>Expédiée</button>
        <button onClick={()=>orderAction(o.id,"refund_start","התחלת החזר")}>Remb. lancé</button>
        <button onClick={()=>orderAction(o.id,"refund_confirm","אישור החזר")}>Remb. confirmé</button>
        <button className="dangerBtn" onClick={()=>deleteOrder(o.id)}>×</button>
      </div>
    </div>)}
  </div>
}

function OrderModal({order,setOrder,save,close}){
  const items = Array.isArray(order.items) ? order.items : [];
  const customer = order.customer || {};

  return (
    <div className="modalShade" onClick={close}>
      <div className="adminModal" onClick={e=>e.stopPropagation()}>
        <button className="modalClose" onClick={close}>×</button>
        <h2>Commande {order.id}</h2>

        <div className="twoCols">
          <label>Nom client
            <input value={customer.name || ""} onChange={e=>setOrder({...order, customer:{...customer, name:e.target.value}})} />
          </label>
          <label>Téléphone
            <input value={customer.phone || ""} onChange={e=>setOrder({...order, customer:{...customer, phone:e.target.value}})} />
          </label>
          <label>Email
            <input value={customer.email || ""} onChange={e=>setOrder({...order, customer:{...customer, email:e.target.value}})} />
          </label>
          <label>Statut
            <select value={order.status || "pending"} onChange={e=>setOrder({...order,status:e.target.value})}>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptée</option>
              <option value="refused">Refusée</option>
              <option value="cancelled">Annulée</option>
              <option value="shipped">Expédiée</option>
              <option value="refund_started">Remboursement lancé</option>
              <option value="refund_confirmed">Remboursement confirmé</option>
            </select>
          </label>
        </div>

        <h3>Produits</h3>
        <div className="adminList">
          {items.length ? items.map((item,i)=>(
            <div className="adminItem" key={i}>
              <img src={item.image || item.img || "/products/placeholder-wallet.svg"} onError={e=>{e.currentTarget.src="/products/placeholder-wallet.svg"}} />
              <b>{item.name || item.title || "Produit"}</b>
              <span>Quantité: {item.qty || item.quantity || 1}</span>
              <span>{Number(item.price || 0).toFixed(2)} ₪</span>
            </div>
          )) : <p>Aucun produit dans cette commande.</p>}
        </div>

        <h3>Total: {Number(order.total || 0).toFixed(2)} ₪</h3>

        <div className="modalActions">
<button onClick={()=>{
  setOrder({...order,status:"completed"});
  save({...order,status:"completed"});
}}>
  🚚 ההזמנה נמסרה + מייל
</button>
          <button onClick={()=>save(order)}>Sauvegarder + envoyer mail</button>
          <button onClick={close}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
function CustomersPanel({orders}){ const map={}; orders.forEach(o=>{const key=o.customer?.phone||o.customer?.email||o.customer?.name||"unknown"; if(!map[key])map[key]={...o.customer,orders:0,total:0}; map[key].orders++; map[key].total+=Number(o.total||0);}); const customers=Object.values(map); return <section className="adminBox"><h2>Clients</h2><div className="ordersTable"><div className="ordersHead"><b>Nom</b><b>Téléphone</b><b>Email</b><b>Commandes</b><b>Total</b><b>WhatsApp</b></div>{customers.map((c,i)=><div key={i} className="ordersRow"><span>{c.name}</span><span>{c.phone}</span><span>{c.email}</span><b>{c.orders}</b><b>{shekel(c.total)}</b><a href={`https://wa.me/${String(c.phone||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer">WhatsApp</a></div>)}</div></section> }


function ProductModal({p,setP,categories,save,close,uploadFiles,uploading,media}){
  function set(k,v){setP({...p,[k]:v})}
  function numberOrBlank(v){ return v === "" ? "" : Number(v); }
  function addImages(files){uploadFiles(files,urls=>{const images=[...(p.images||[]),...urls]; setP({...p,images,image:p.image||images[0]})})}
  function removeImage(i){const images=[...(p.images||[])]; images.splice(i,1); setP({...p,images,image:images[0]||""})}
  function mainImage(i){const images=[...(p.images||[])]; const selected=images.splice(i,1)[0]; images.unshift(selected); setP({...p,images,image:selected})}
  function addMedia(url){const images=[...(p.images||[]),url]; setP({...p,images,image:p.image||url})}
  const colorVariants = Array.isArray(p.colorVariants) ? p.colorVariants : [];
  const sizeVariants = Array.isArray(p.sizeVariants) ? p.sizeVariants : [];
  const categoryIds = Array.isArray(p.categoryIds) && p.categoryIds.length ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
  function updateColor(i,k,v){const a=[...colorVariants]; a[i]={...(a[i]||{}),[k]:v}; setP({...p,colorVariants:a});}
  function addColor(){setP({...p,colorVariants:[...colorVariants,{colorName:"שחור",colorHex:"#111111",image:"",images:[],stock:p.stock||""}]});}
  function removeColor(i){const a=[...colorVariants]; a.splice(i,1); setP({...p,colorVariants:a});}
  function addColorImage(i, files){uploadFiles(files,urls=>{const a=[...colorVariants]; const v={...(a[i]||{})}; v.image=v.image||urls[0]; v.images=[...(v.images||[]),...urls]; a[i]=v; setP({...p,colorVariants:a,image:p.image||v.image});})}
  function updateSize(i,k,v){const a=[...sizeVariants]; a[i]={...(a[i]||{}),[k]:v}; setP({...p,sizeVariants:a});}
  function addSize(){setP({...p,sizeVariants:[...sizeVariants,{label:"קטן",description:"20 אינץ׳ — מתאים לקבינה",price:p.price||"",oldPrice:p.oldPrice||"",stock:p.stock||""}]});}
  function removeSize(i){const a=[...sizeVariants]; a.splice(i,1); setP({...p,sizeVariants:a});}
  function toggleCat(id){const has=categoryIds.includes(id); const next=has?categoryIds.filter(x=>x!==id):[...categoryIds,id]; setP({...p,categoryIds:next,categoryId:next[0]||""});}
  function pickMediaForColor(i,url){const a=[...colorVariants]; const v={...(a[i]||{})}; v.image=url; v.images=[url,...((v.images||[]).filter(x=>x!==url))]; a[i]=v; setP({...p,colorVariants:a,image:p.image||url});}
  return <div className="modalShade noAutoClose"><div className="adminModal productModal" onClick={e=>e.stopPropagation()}><button className="modalClose" onClick={close}>×</button><h2>{p.id?"Modifier produit":"Ajouter produit"}</h2>
    <div className="variantAdminNotice"><b>Mode pro AliExpress / Shopify</b><span>Ajoute des couleurs avec une photo par couleur, des tailles, plusieurs catégories. Le client choisit couleur + taille avant ajout panier.</span></div>
    <div className="twoCols"><label>Nom produit<input value={p.name||""} onChange={e=>set("name",e.target.value)}/></label><label>ID / URL<input value={p.id||""} onChange={e=>set("id",e.target.value)} placeholder="automatique si vide"/></label><label>Prix<input type="number" value={p.price ?? ""} onChange={e=>set("price",numberOrBlank(e.target.value))} placeholder="Prix"/></label><label>Ancien prix<input type="number" value={p.oldPrice ?? ""} onChange={e=>set("oldPrice",numberOrBlank(e.target.value))} placeholder="Ancien prix"/></label><label>Stock général<input type="number" value={p.stock ?? ""} onChange={e=>set("stock",numberOrBlank(e.target.value))} placeholder="Stock"/></label><label><input type="checkbox" checked={p.showStockUrgency!==false} onChange={e=>set("showStockUrgency",e.target.checked)}/> Afficher urgence stock</label></div>
    <div className="adminBox softBox"><h3>Catégories du produit</h3><p>Tu peux choisir plusieurs catégories.</p><div className="catMultiGrid">{categories.map(c=><label key={c.id} className={categoryIds.includes(c.id)?"active":""}><input type="checkbox" checked={categoryIds.includes(c.id)} onChange={()=>toggleCat(c.id)}/>{c.name}</label>)}</div></div>
    <label>Texte urgence personnalisé<textarea value={p.urgentText||""} onChange={e=>set("urgentText",e.target.value)} placeholder="האחרון במלאי — אל תפספסו"/></label><label>Sous-titre<textarea value={p.shortDescription||""} onChange={e=>set("shortDescription",e.target.value)}/></label><label>Description longue<textarea value={p.description||""} onChange={e=>set("description",e.target.value)}/></label>
    <div className="adminBox softBox"><div className="boxHead"><h3>Couleurs avec photos</h3><button onClick={addColor}>+ Ajouter couleur</button></div>{colorVariants.length===0&&<p>Aucune couleur. Si tu n’ajoutes rien, le produit reste simple.</p>}{colorVariants.map((v,i)=><div className="variantRow" key={i}><div className="variantTop"><b>Couleur #{i+1}</b><button onClick={()=>removeColor(i)}>Supprimer</button></div><div className="twoCols"><label>Nom couleur<input value={v.colorName||""} onChange={e=>updateColor(i,"colorName",e.target.value)} placeholder="שחור / חום / בז׳"/></label><label>Couleur bouton<input type="color" value={v.colorHex||"#111111"} onChange={e=>updateColor(i,"colorHex",e.target.value)}/></label><label>Stock couleur<input type="number" value={v.stock ?? ""} onChange={e=>updateColor(i,"stock",numberOrBlank(e.target.value))}/></label><label>Lien image couleur<input value={v.image||""} onChange={e=>updateColor(i,"image",e.target.value)} placeholder="/uploads/products/image.webp"/></label></div><label className="uploadDrop">{uploading?"Upload...":"+ Upload photo de cette couleur"}<input type="file" multiple accept="image/*" onChange={e=>addColorImage(i,e.target.files)}/></label><div className="imagePreviewGrid">{([v.image,...(v.images||[])].filter(Boolean).filter((x,j,a)=>a.indexOf(x)===j)).map((img,j)=><div className="imagePreviewItem" key={j}><button className="deleteImg" onClick={()=>{const a=[...colorVariants]; const vv={...(a[i]||{})}; vv.images=(vv.images||[]).filter(x=>x!==img); if(vv.image===img){vv.image=vv.images[0]||""} a[i]=vv; setP({...p,colorVariants:a});}}>×</button><img src={img} onError={e=>{e.currentTarget.src="/products/placeholder-wallet.svg"}}/><button onClick={()=>updateColor(i,"image",img)}>Photo principale</button></div>)}</div><details><summary>Choisir une image existante du dossier uploads</summary><div className="miniMediaGrid">{media.slice(0,120).map(m=><button key={m.id} onClick={()=>pickMediaForColor(i,m.url)}><img src={m.url}/><small>{m.name}</small></button>)}</div></details></div>)}</div>
    <div className="adminBox softBox"><div className="boxHead"><h3>Tailles</h3><button onClick={addSize}>+ Ajouter taille</button></div>{sizeVariants.length===0&&<p>Exemples: קטן / בינוני / גדול, 20\" / 24\" / 28\".</p>}{sizeVariants.map((v,i)=><div className="miniEditor sizeVariantEditor" key={i}><input value={v.label||""} onChange={e=>updateSize(i,"label",e.target.value)} placeholder="שם מידה / Petit / Moyen / Grand"/><input value={v.description||""} onChange={e=>updateSize(i,"description",e.target.value)} placeholder="תיאור קצר — 20 אינץ׳ / קבינה / שבוע נסיעה"/><input type="number" value={v.price ?? ""} onChange={e=>updateSize(i,"price",numberOrBlank(e.target.value))} placeholder="Prix"/><input type="number" value={v.oldPrice ?? ""} onChange={e=>updateSize(i,"oldPrice",numberOrBlank(e.target.value))} placeholder="Ancien prix"/><input type="number" value={v.stock ?? ""} onChange={e=>updateSize(i,"stock",numberOrBlank(e.target.value))} placeholder="Stock"/><button onClick={()=>removeSize(i)}>×</button></div>)}</div>
    <div className="imageAdminBox"><h3>Galerie générale du produit</h3><label className="uploadDrop">{uploading?"Upload...":"+ Ajouter images depuis mon Mac"}<input type="file" multiple accept="image/*" onChange={e=>addImages(e.target.files)}/></label><div className="imagePreviewGrid">{(p.images||[]).map((img,i)=><div key={i} className="imagePreviewItem"><button className="deleteImg" onClick={()=>removeImage(i)}>×</button><img src={img} onError={e=>{e.currentTarget.src="/products/placeholder-wallet.svg"}}/><button onClick={()=>mainImage(i)}>{p.image===img||i===0?"ראשית":"הפוך לראשית"}</button></div>)}</div><details><summary>Choisir depuis Médias / dossier photos</summary><div className="miniMediaGrid">{media.slice(0,120).map(m=><button key={m.id} onClick={()=>addMedia(m.url)}><img src={m.url}/><small>{m.name}</small></button>)}</div></details><label>URLs galerie<textarea className="galleryTextarea" value={(p.images||[]).join("\n")} onChange={e=>{const images=e.target.value.split(/\n|,/).map(x=>x.trim()).filter(Boolean); setP({...p,images,image:images[0]||p.image})}}/></label></div>
    <div className="twoCols"><label>SEO title<input value={p.seoTitle||""} onChange={e=>set("seoTitle",e.target.value)}/></label><label>SEO description<textarea value={p.seoDescription||""} onChange={e=>set("seoDescription",e.target.value)}/></label><label>Étoiles<input type="number" step="0.1" value={p.rating||5} onChange={e=>set("rating",Number(e.target.value))}/></label><label>Nombre avis<input type="number" value={p.reviewCount||0} onChange={e=>set("reviewCount",Number(e.target.value))}/></label></div><div className="modalActions"><button onClick={save}>Sauvegarder produit</button><button onClick={close}>Annuler</button></div></div></div> }

function MediaPanel({media,token,uploadFiles,uploading,reload}){ const [selected,setSelected]=useState([]); const [search,setSearch]=useState(""); const filtered=media.filter(m=>(m.name||m.url||"").toLowerCase().includes(search.toLowerCase())); async function del(id){if(!confirm("Supprimer cette image ?"))return; await fetch(`/api/admin/media/${id}`,{method:"DELETE",headers:{"x-admin-token":token}}); reload()} async function deleteSelected(){ if(!selected.length)return alert("Aucune image sélectionnée"); if(!confirm(`Supprimer ${selected.length} images ?`))return; for(const id of selected){await fetch(`/api/admin/media/${id}`,{method:"DELETE",headers:{"x-admin-token":token}})} setSelected([]); reload()} return <section className="adminBox"><div className="boxHead"><div><h2>Bibliothèque Médias</h2><p>Upload en masse, suppression et copie de liens.</p></div><button onClick={deleteSelected}>Supprimer sélection</button></div><label className="uploadDrop mediaUpload">{uploading?"Upload...":"+ Ajouter des images en masse"}<input type="file" multiple accept="image/*" onChange={e=>uploadFiles(e.target.files,()=>reload())}/></label><input className="mediaSearch" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="mediaStats">{filtered.length} / {media.length} images</div><div className="mediaLibraryGrid">{filtered.map(item=><div key={item.id} className={selected.includes(item.id)?"mediaItem selected":"mediaItem"}><button className="deleteImg" onClick={()=>del(item.id)}>×</button><label className="mediaCheck"><input type="checkbox" checked={selected.includes(item.id)} onChange={e=>setSelected(e.target.checked?[...selected,item.id]:selected.filter(x=>x!==item.id))}/></label><img src={item.url} onError={e=>{e.currentTarget.src="/products/placeholder-wallet.svg"}}/><small>{item.name}</small><div className="mediaActions"><button onClick={()=>{navigator.clipboard?.writeText(item.url);alert("Lien copié")}}>Copier lien</button><a href={item.url} target="_blank" rel="noreferrer">Voir</a></div></div>)}</div></section>}


function ImageOptimizerPanel({optimizing,result,optimizeAllImages,uploadFiles,uploading,reload}){
  return <section className="adminBox">
    <div className="boxHead">
      <div>
        <h2>Compresseur images WebP</h2>
        <p>Dépose tes photos ici : le site les redimensionne, compresse et convertit automatiquement en WebP pour rester très rapide.</p>
      </div>
      <button onClick={optimizeAllImages} disabled={optimizing}>{optimizing ? "Compression..." : "Compresser toutes les images"}</button>
    </div>

    <label className="uploadDrop mediaUpload">
      {uploading ? "Upload + compression..." : "+ Ajouter images optimisées"}
      <input type="file" multiple accept="image/*" onChange={e=>uploadFiles(e.target.files,()=>reload())}/>
    </label>

    <div className="optimizerInfo">
      <div><b>Format recommandé</b><span>WebP automatique</span></div>
      <div><b>Taille maximum</b><span>1400px</span></div>
      <div><b>Qualité</b><span>Optimisée e-commerce</span></div>
      <div><b>Performance</b><span>Mobile / Google</span></div>
    </div>

    {result && <div className="optimizerResult">
      <h3>Résultat</h3>
      <p>Images optimisées: <b>{result.optimized}</b></p>
      <p>Avant: <b>{result.beforeMB} MB</b></p>
      <p>Après: <b>{result.afterMB} MB</b></p>
      <p>Réduction: <b>{result.reductionPercent}%</b></p>
      {result.errors?.length > 0 && <p>Erreurs: {result.errors.length}</p>}
    </div>}
  </section>
}

function CategoriesPanel({full,setCurrentCat,currentCat,setCurrentCatDirect,saveCategory,deleteCategory}){ return <section className="adminBox"><div className="boxHead"><h2>Catégories</h2><button onClick={()=>setCurrentCat({id:"",name:"",slug:"",description:"",seoTitle:"",seoDescription:"",order:(full.categories||[]).length+1})}>+ Ajouter catégorie</button></div>{currentCat&&<div className="editor">{["id","name","slug","description","seoTitle","seoDescription","order"].map(k=><label key={k}>{k}<textarea value={currentCat[k]||""} onChange={e=>setCurrentCatDirect({...currentCat,[k]:e.target.value})}/></label>)}<button onClick={saveCategory}>Sauvegarder</button><button onClick={()=>setCurrentCatDirect(null)}>Annuler</button></div>}<div className="adminList">{(full.categories||[]).map(c=><div key={c.id} className="adminItem"><b>{c.name}</b><span>{c.description}</span><button onClick={()=>setCurrentCat({...c})}>Modifier</button><button onClick={()=>deleteCategory(c.id)}>Supprimer</button></div>)}</div></section> }

function CouponsPanel({full,setFull,save}){ const coupons=full.coupons||[]; return <section className="adminBox"><div className="boxHead"><h2>Coupons</h2><button onClick={()=>setFull({...full,coupons:[...coupons,{code:"NEW10",type:"percent",value:10,active:true,description:""}]})}>+ Coupon</button></div>{coupons.map((c,i)=><div className="miniEditor" key={i}><input value={c.code} onChange={e=>{const a=[...coupons];a[i].code=e.target.value;setFull({...full,coupons:a})}}/><input type="number" value={c.value} onChange={e=>{const a=[...coupons];a[i].value=Number(e.target.value);setFull({...full,coupons:a})}}/><label><input type="checkbox" checked={!!c.active} onChange={e=>{const a=[...coupons];a[i].active=e.target.checked;setFull({...full,coupons:a})}}/> Actif</label><button onClick={()=>{const a=[...coupons];a.splice(i,1);setFull({...full,coupons:a})}}>×</button></div>)}<button onClick={save}>Sauvegarder coupons</button></section> }
function SocialPanel({full,setFull,save}){ const s=full.socialSettings||{}; function upd(net,k,v){setFull({...full,socialSettings:{...s,[net]:{...(s[net]||{}),[k]:v}}})} return <section className="adminBox"><h2>Google / Instagram / Facebook</h2>{["instagram","facebook","tiktok","google","whatsapp"].map(net=><div className="socialEdit" key={net}><h3>{net}</h3><label>Actif <input type="checkbox" checked={!!s[net]?.enabled} onChange={e=>upd(net,"enabled",e.target.checked)}/></label>{net==="whatsapp"?<><label>Numéro<input value={s[net]?.number||""} onChange={e=>upd(net,"number",e.target.value)}/></label><label>Message<textarea value={s[net]?.message||""} onChange={e=>upd(net,"message",e.target.value)}/></label></>:<><label>URL<input value={s[net]?.url||s[net]?.businessUrl||""} onChange={e=>upd(net,net==="google"?"businessUrl":"url",e.target.value)}/></label>{net==="google"&&<label>Lien avis Google<input value={s.google?.reviewsUrl||""} onChange={e=>upd("google","reviewsUrl",e.target.value)}/></label>}</>}</div>)}<button onClick={save}>Sauvegarder réseaux</button></section>}
function ApiPanel({full,setFull,save}){ const a=full.apiSettings||{}; function upd(sec,k,v){setFull({...full,apiSettings:{...a,[sec]:{...(a[sec]||{}),[k]:v}}})} return <section className="adminBox"><h2>APIs / Paiements</h2><p>Grow / Meshulam, Google, Meta, TikTok, Email et WhatsApp configurables ici.</p>{["grow","google","meta","tiktok","email","whatsapp"].map(sec=><div className="apiBlock" key={sec}><h3>{sec}</h3>{Object.keys(a[sec]||{}).map(k=><label key={k}>{k}<input type={k.toLowerCase().includes("secret")||k.toLowerCase().includes("pass")||k.toLowerCase().includes("key")?"password":"text"} value={a[sec]?.[k]||""} onChange={e=>upd(sec,k,e.target.value)}/></label>)}</div>)}<button onClick={save}>Sauvegarder APIs</button></section>}
function DesignPanel({full,setFull,save,uploadFiles}){ const d=full.designSettings||{}; function upd(k,v){setFull({...full,designSettings:{...d,[k]:v}})} return <section className="adminBox"><h2>Logo / Couleurs / Favicon</h2><label>Logo<input value={d.logo||""} onChange={e=>upd("logo",e.target.value)}/></label><label className="uploadDrop">Upload logo<input type="file" accept="image/*" onChange={e=>uploadFiles(e.target.files,urls=>upd("logo",urls[0]))}/></label><label>Favicon<input value={d.favicon||""} onChange={e=>upd("favicon",e.target.value)}/></label><div className="twoCols"><label>Couleur principale<input type="color" value={d.primaryColor||"#b91c1c"} onChange={e=>upd("primaryColor",e.target.value)}/></label><label>Couleur accent<input type="color" value={d.accentColor||"#d4a017"} onChange={e=>upd("accentColor",e.target.value)}/></label><label>Fond<input type="color" value={d.backgroundColor||"#fffaf4"} onChange={e=>upd("backgroundColor",e.target.value)}/></label></div><button onClick={save}>Sauvegarder design</button></section>}
function LanguagePanel({full,setFull,save}){ return <section className="adminBox"><h2>Langues</h2><p>Langues client: hébreu, français, anglais, arabe, russe. Détection navigateur + bouton langue côté site.</p><textarea className="jsonEditor" value={JSON.stringify(full.translations||{},null,2)} onChange={e=>{try{setFull({...full,translations:JSON.parse(e.target.value)})}catch{}}}/><button onClick={save}>Sauvegarder traductions</button></section>}
function PagesPanel({full,setFull,saveCms,updateCms,addSection,removeSection,moveSection}){ const cms=full.pagesCms||{}; function addPage(){const id=prompt("URL page, ex: about"); if(!id)return; setFull({...full,pagesCms:{...cms,[id]:{title:id,seoTitle:id,seoDescription:"",sections:[]}}})} return <section className="adminBox"><div className="boxHead"><h2>Pages Builder</h2><button onClick={addPage}>+ Ajouter page</button></div>{Object.keys(cms).filter(k=>!["header","footer"].includes(k)).map(k=><details key={k} open={k==="home"}><summary>{cms[k].title||k}</summary><PageEditor pageKey={k} page={cms[k]} updateCms={updateCms} addSection={addSection} removeSection={removeSection} moveSection={moveSection} saveCms={saveCms}/></details>)}</section>}
function MenuPanel({full,updateCms,saveCms}){ const menu=full.pagesCms?.header?.menuItems||[]; function setMenu(items){updateCms(["header","menuItems"],items)} return <section className="adminBox"><h2>Menu / Header</h2><label>Logo<input value={full.pagesCms?.header?.logo||""} onChange={e=>updateCms(["header","logo"],e.target.value)}/></label><label>Top bar<textarea value={full.pagesCms?.header?.topbar||""} onChange={e=>updateCms(["header","topbar"],e.target.value)}/></label>{menu.map((m,i)=><div className="miniEditor" key={i}><input value={m.label} onChange={e=>{const a=[...menu];a[i].label=e.target.value;setMenu(a)}}/><input value={m.url} onChange={e=>{const a=[...menu];a[i].url=e.target.value;setMenu(a)}}/><label><input type="checkbox" checked={!!m.newTab} onChange={e=>{const a=[...menu];a[i].newTab=e.target.checked;setMenu(a)}}/> nouvel onglet</label><button onClick={()=>{const a=[...menu];a.splice(i,1);setMenu(a)}}>×</button></div>)}<button onClick={()=>setMenu([...menu,{label:"חדש",url:"/",newTab:false}])}>+ Ajouter menu</button><button onClick={saveCms}>Sauvegarder menu</button></section>}
function FooterPanel({full,updateCms,saveCms}){ const f=full.pagesCms?.footer||{}; return <section className="adminBox"><h2>Footer</h2><label>Titre<input value={f.title||""} onChange={e=>updateCms(["footer","title"],e.target.value)}/></label><label>Texte<textarea value={f.text||""} onChange={e=>updateCms(["footer","text"],e.target.value)}/></label><label><input type="checkbox" checked={!!f.showBranches} onChange={e=>updateCms(["footer","showBranches"],e.target.checked)}/> Afficher snifim</label><button onClick={saveCms}>Sauvegarder footer</button></section>}

function MaintenancePanel({full,setFull,save}){
  const settings = full.settings || {};
  const sh = settings.shabbatMode || {};
  function upd(k,v){setFull({...full,settings:{...settings,shabbatMode:{...sh,[k]:v}}})}
  return <section className="adminBox"><h2>Mode Chabbat / Maintenance</h2><p>Accès admin toujours ouvert. Ici tu modifies tout le contenu affiché au client quand le site est fermé.</p><div className="twoCols"><label><input type="checkbox" checked={!!sh.enabled} onChange={e=>upd("enabled",e.target.checked)}/> Activer mode Chabbat automatique</label><label>Ville<input value={sh.city||"Jerusalem"} onChange={e=>upd("city",e.target.value)}/></label><label>Fermer X minutes avant bougies<input type="number" value={sh.closeMinutesBeforeCandleLighting||0} onChange={e=>upd("closeMinutesBeforeCandleLighting",Number(e.target.value))}/></label><label>Ouvrir X minutes après sortie<input type="number" value={sh.openMinutesAfterHavdalah||0} onChange={e=>upd("openMinutesAfterHavdalah",Number(e.target.value))}/></label><label><input type="checkbox" checked={!!sh.forceClosed} onChange={e=>upd("forceClosed",e.target.checked)}/> Maintenance forcée maintenant</label></div><div className="adminSubBox"><h3>Contenu de la page fermée</h3><label>Logo affiché<input value={sh.logo||"/logo-nabet.png"} onChange={e=>upd("logo",e.target.value)} placeholder="/logo-nabet.png"/></label><label>Image de fond / image Chabbat<input value={sh.image||""} onChange={e=>upd("image",e.target.value)} placeholder="/uploads/products/image.webp ou URL"/></label><label>Badge court<input value={sh.badge||"שבת שלום"} onChange={e=>upd("badge",e.target.value)} /></label><label>Grand titre<input value={sh.title||"האתר סגור כעת לכבוד שבת"} onChange={e=>upd("title",e.target.value)} /></label><label>Message principal<textarea value={sh.message||""} onChange={e=>upd("message",e.target.value)} placeholder="האתר סגור כעת..."/></label><label>Message promotion après Chabbat<textarea value={sh.saleText||"אחרי שבת כל האתר עד 50% הנחה — תחזרו מהר!"} onChange={e=>upd("saleText",e.target.value)} /></label><label>Petit texte bas de page<textarea value={sh.smallText||"תודה על ההבנה. נשמח לראותכם שוב לאחר צאת השבת."} onChange={e=>upd("smallText",e.target.value)} /></label></div><button onClick={save}>Sauvegarder mode</button></section>
}

function SeoPanel(){ return <section className="adminBox"><h2>SEO / Google</h2><p>Sitemap, robots, schema Product, Organization, Review, Breadcrumb, Open Graph et canonical sont actifs.</p><div className="seoAdminLinks"><a href="/sitemap.xml" target="_blank">Sitemap</a><a href="/robots.txt" target="_blank">Robots</a><a href="https://search.google.com/search-console" target="_blank">Search Console</a></div></section>}
function PageEditor({pageKey,page={},updateCms,addSection,removeSection,moveSection,saveCms}){ return <section className="adminBox innerPageEditor"><h2>{page.title||pageKey}</h2><label>Titre page<input value={page.title||""} onChange={e=>updateCms([pageKey,"title"],e.target.value)}/></label><label>SEO Title<input value={page.seoTitle||""} onChange={e=>updateCms([pageKey,"seoTitle"],e.target.value)}/></label><label>SEO Description<textarea value={page.seoDescription||""} onChange={e=>updateCms([pageKey,"seoDescription"],e.target.value)}/></label><h3>Ajouter section / module</h3><div className="sectionButtons">{Object.keys(sectionTemplates).map(type=><button key={type} onClick={()=>addSection(pageKey,type)}>{type}</button>)}</div>{(page.sections||[]).map((s,i)=><div className="sectionEditor" key={i}><div className="sectionEditorHead"><b>Section #{i+1} — {s.type}</b><div><button onClick={()=>moveSection(pageKey,i,-1)}>↑</button><button onClick={()=>moveSection(pageKey,i,1)}>↓</button><button onClick={()=>removeSection(pageKey,i)}>מחיקה</button></div></div><textarea value={JSON.stringify(s,null,2)} onChange={e=>{try{updateCms([pageKey,"sections",i],JSON.parse(e.target.value))}catch{}}}/></div>)}<button onClick={saveCms}>Sauvegarder page</button></section>}
