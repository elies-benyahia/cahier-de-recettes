const Utilisateur = require('../models/Utilisateur');

// GET /utilisateurs
const listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find().select('-__v');
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /utilisateurs/:id
const obtenirUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id).select('-__v');
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /utilisateurs/:id  (réservé à l'utilisateur connecté)
const modifierUtilisateur = async (req, res) => {
  try {
    if (req.utilisateur._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const { nom, email } = req.body;
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      { nom, email },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(utilisateur);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /utilisateurs/:id (réservé à l'utilisateur connecté)
const supprimerUtilisateur = async (req, res) => {
  try {
    if (req.utilisateur._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: 'Compte supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { listerUtilisateurs, obtenirUtilisateur, modifierUtilisateur, supprimerUtilisateur };
