export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  // Comparaison
  if (username === validUsername && password === validPassword) {
    return res.status(200).json({ success: true });
  }

  // Si échec, on construit un message d'erreur détaillé (visible dans la page)
  const debugMsg = 
    `Reçu user: "${username}" (longueur ${username?.length}), ` +
    `attendu: "${validUsername}" (longueur ${validUsername?.length}) | ` +
    `Reçu pass: "${password}" (longueur ${password?.length}), ` +
    `attendu: "${validPassword}" (longueur ${validPassword?.length})`;

  return res.status(401).json({ success: false, message: `Identifiants incorrects. Debug: ${debugMsg}` });
}
