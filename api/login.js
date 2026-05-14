export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  // ---- DEBUG TEMPORAIRE ----
  // Renvoie les longueurs et les premiers/derniers caractères (sans exposer les secrets complets)
  const debugInfo = {
    receivedUsername: username,
    receivedUsernameLength: username?.length,
    receivedPasswordLength: password?.length,
    receivedPasswordFirst3: password?.substring(0, 3),
    receivedPasswordLast3: password?.slice(-3),
    validUsernameLength: validUsername?.length,
    validUsernameFirst3: validUsername?.substring(0, 3),
    validUsernameLast3: validUsername?.slice(-3),
    validPasswordLength: validPassword?.length,
    validPasswordFirst3: validPassword?.substring(0, 3),
    validPasswordLast3: validPassword?.slice(-3),
  };
  // --------------------------

  // Comparaison normale
  if (username === validUsername && password === validPassword) {
    return res.status(200).json({ success: true, debug: debugInfo });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Identifiants incorrects',
      debug: debugInfo
    });
  }
}
