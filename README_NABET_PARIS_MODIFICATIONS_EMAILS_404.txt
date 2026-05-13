MODIFICATIONS AJOUTÉES DANS CE ZIP

1) Admin commandes
- Dans /admin > Commandes, chaque commande a maintenant des boutons :
  Accepter, Refuser, Annuler, Expédiée, Remboursement lancé, Remboursement confirmé.
- Chaque action met à jour le statut de la commande dans data/orders.json.
- Chaque action essaye d'envoyer un email automatique au client si l'email client existe.

2) Emails automatiques clients
Les emails élégants NABET PARIS sont prêts pour :
- commande reçue
- commande acceptée / validée
- commande refusée
- commande annulée
- commande expédiée
- remboursement lancé
- remboursement confirmé

Chaque email contient :
- logo NABET PARIS
- numéro de commande
- résumé produits
- total
- statut clair en hébreu + français
- bouton retour boutique

Important : pour que les emails partent vraiment, configurer SMTP dans l'admin APIs/Email ou dans .env :
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

Si SMTP n'est pas configuré, l'email n'est pas envoyé mais il est enregistré dans data/emailLogs.json.

3) SEO / 404
- Page 404 propre ajoutée : pages/404.js
- Redirections ajoutées dans next.config.js pour les anciennes URLs Google :
  /product-category/*, /category/*, /shop/*, /collections/*, /products/*, /cart, /checkout, /wp-content/*, /he/*, /fr/*

4) Ordre du plan confirmé
Admin → Emails → Paiement Stripe/HYP → Apple Pay/Google Pay → SEO 404 → Vitesse

INSTALLATION SUR LE VPS
1. Envoyer ce dossier sur le serveur.
2. Dans le dossier du site : npm install
3. Tester : npm run build
4. Redémarrer : pm2 restart nabet-paris
5. Redémarrer nginx si besoin : sudo systemctl restart nginx
