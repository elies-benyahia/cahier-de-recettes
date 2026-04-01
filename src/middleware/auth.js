const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Vérifie le token JWT et attache l'utilisateur à la requête
const proteger = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = await Utilisateur.findById(decoded.id);

    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = { proteger };
