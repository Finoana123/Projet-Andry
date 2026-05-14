import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Jeton invalide ou expiré' });
  }
}
