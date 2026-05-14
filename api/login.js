import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const { username, password } = req.body;

  // Récupération des variables d'environnement
  const validUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const debugMode = process.env.DEBUG_LOGIN === 'true'; // active le débogage

  // Vérification du nom d'utilisateur
  if (!username || username !== validUsername) {
    const msg = debugMode
      ? `Échec nom d'utilisateur. Reçu : "${username}" (longueur ${username?.length}), Attendu : "${validUsername}" (longueur ${validUsername?.length})`
      : 'Identifiants incorrects';
    return res.status(401).json({ success: false, message: msg });
  }

  // Vérification de la présence du hash
  if (!passwordHash) {
    return res.status(500).json({
      success: false,
      message: 'Variable ADMIN_PASSWORD_HASH non définie sur Vercel'
    });
  }

  // Comparaison du mot de passe
  const match = await bcrypt.compare(password, passwordHash);

  if (!match) {
    // Message d'erreur enrichi en mode debug
    let debugInfo = 'Mot de passe incorrect (la comparaison bcrypt a échoué)';
    if (debugMode) {
      debugInfo += ` | Mot de passe reçu : longueur ${password?.length}, début: "${password?.substring(0, 3)}...", fin: "...${password?.slice(-3)}"`;
      debugInfo += ` | Hash stocké : longueur ${passwordHash?.length}, début: "${passwordHash?.substring(0, 10)}...", fin: "...${passwordHash?.slice(-10)}"`;
      // On ne montre pas le hash en entier, seulement quelques caractères pour reconnaître
    }
    return res.status(401).json({ success: false, message: debugInfo });
  }

  // Succès
  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  return res.status(200).json({ success: true, token });
}
