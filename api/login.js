import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const { username, password } = req.body;

  // Vérification du nom d'utilisateur (depuis variable d'env)
  const validUsername = process.env.ADMIN_USERNAME;
  if (!username || username !== validUsername) {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  }

  // Vérification du mot de passe (haché)
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) {
    return res.status(500).json({ success: false, message: 'Configuration serveur manquante' });
  }

  const match = await bcrypt.compare(password, passwordHash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  }

  // Génération du token JWT
  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({ success: true, token });
}
