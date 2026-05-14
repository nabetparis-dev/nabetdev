export function shekel(n) {
  return `${Number(n || 0).toLocaleString("he-IL")} ₪`;
}