const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const genererToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /auth/inscription
const inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    const existant = await Utilisateur.findOne({ email });
    if (existant) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const utilisateur = await Utilisateur.create({ nom, email, motDePasse });
    const token = genererToken(utilisateur._id);

    res.status(201).json({ token, utilisateur: { id: utilisateur._id, nom, email } });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /auth/connexion
const connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
    if (!utilisateur || !(await utilisateur.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = genererToken(utilisateur._id);
    res.json({ token, utilisateur: { id: utilisateur._id, nom: utilisateur.nom, email } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { inscription, connexion };
