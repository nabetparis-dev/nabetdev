export const LANGS = [{ code: "he", label: "HE", dir: "rtl", name: "עברית" }];

const he = {
  cart: "עגלה",
  collection: "קולקציה",
  products: "המוצרים שלנו",
  viewProduct: "צפייה במוצר",
  addToCart: "הוספה לעגלה",
  outOfStock: "אזל מהמלאי",
  color: "צבע",
  reviews: "ביקורות",
  discount2: "10% הנחה נוספת בקניית 2+",
  cartTitle: "העגלה שלך",
  emptyCart: "העגלה ריקה",
  emptyCartText: "בחר מוצר והוסף אותו לעגלה בלחיצה אחת.",
  customerDetails: "פרטי לקוח",
  fullName: "שם מלא",
  phone: "טלפון",
  emailOrder: "אימייל לקבלת אישור הזמנה",
  addressNotes: "כתובת / הערות / נקודת איסוף",
  deliveryOptions: "אפשרויות אספקה",
  homeDelivery: "משלוח עד הבית — 59.9 ₪ להזמנה",
  pickup: "איסוף עצמי מנקודת מכירה — ללא דמי משלוח",
  paymentOptions: "אפשרויות תשלום",
  payOnReceive: "תשלום בעת קבלת המוצר / תשלום במקום",
  productsAmount: "מוצרים",
  shipping: "משלוח",
  total: "סה״כ",
  discountLine: "הנחת 10% בקנייה של 2+",
  upsell: "הוסיפו עוד מוצר וקבלו 10% הנחה נוספת",
  terms: "קראתי ואני מאשר/ת את תקנון האתר ותנאי הרכישה",
  validateOrder: "אישור ההזמנה",
  growPay: "תשלום בכרטיס אשראי",
  securePay: "תשלום מאובטח",
  cartNote: "לאחר אישור הזמנה תקבלו מספר הזמנה ואישור במייל. WhatsApp משמש לתיאום זמינות בלבד.",
  remove: "מחיקה",
  lastStock: "האחרון במלאי — אל תפספסו",
  limitedStock: "מלאי מוגבל",
  productUnavailable: "המוצר אזל מהמלאי",
  alertEmpty: "העגלה ריקה",
  alertTerms: "יש לאשר את תקנון האתר ותנאי הרכישה לפני אישור ההזמנה.",
  alertCustomer: "נא למלא שם מלא וטלפון"
};

export function LanguageProvider({ children }) {
  return children;
}

export function useLang(){
  return {
    lang:"he",
    setLang(){},
    t:(k)=>he[k] || k,
    langs:LANGS,
    dir:"rtl",
    translateText:(x)=>x,
    translateProduct:(x)=>x,
    translateCategory:(x)=>x,
    translateSections:(x)=>x
  };
}