import { readJson } from "../../lib/serverData";
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  const api = readJson("apiSettings");
  const grow = api.grow || {};
  if(!grow.enabled || !grow.apiKey){
    return res.status(400).json({error:"Grow / Meshulam עדיין לא מוגדר. יש להוסיף API Key ופרטי מסוף באדמין."});
  }
  // Placeholder prêt pour intégration officielle Grow/Meshulam API.
  // Le connecteur garde les paramètres admin et créera l’URL de paiement dès que les identifiants API sont actifs.
  return res.status(400).json({error:"Grow / Meshulam מוכן להגדרה, אך יש לחבר את נקודת ה-API הרשמית שקיבלת מ-Grow."});
}