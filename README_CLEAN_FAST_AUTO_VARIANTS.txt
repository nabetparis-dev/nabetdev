Mise à jour NABET PARIS - clean + rapide + auto variantes

Ajouté/corrigé :
1. Génération automatique de produits visibles depuis les variantes couleur/taille.
   Exemple : Produit original + couleur bleu => nouveau produit visible "Produit bleu".
   Exemple : couleur bleu + taille grand => nouveau produit visible "Produit bleu grand".
2. Les produits générés gardent la description, les catégories, le prix par défaut, la photo de la couleur, le stock et le SEO.
3. Page d'accueil plus rapide : produits organisés par catégories.
4. Chaque catégorie affiche 12 produits au départ + bouton Voir plus.
5. Nouveaux produits en premier via createdAt/updatedAt.
6. API upload nettoyée : réponse propre, plus de warning "API resolved without sending a response".
7. Les images restent compressées en WebP dans /uploads/products.

À faire après installation :
npm install
npm run build
pm2 restart nabet-paris
sudo systemctl restart nginx
