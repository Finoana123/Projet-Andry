import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const { username, password } = req.body;

  // Étape 1 : Vérification du username
  const validUsername = process.env.ADMIN_USERNAME;
  if (!username || username !== validUsername) {
    return res.status(401).json({
      success: false,
      message: `Échec nom d'utilisateur. Reçu : "${username}", Attendu : "${validUsername}"`
    });
  }

  // Étape 2 : Vérifier que le hash est défini
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) {
    return res.status(500).json({
      success: false,
      message: 'Variable ADMIN_PASSWORD_HASH non définie sur Vercel'
    });
  }

  // Étape 3 : Comparaison bcrypt
  const match = await bcrypt.compare(password, passwordHash);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'Mot de passe incorrect (la comparaison bcrypt a échoué)'
    });
  }

  // Succès
  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  return res.status(200).json({ success: true, token });
}
