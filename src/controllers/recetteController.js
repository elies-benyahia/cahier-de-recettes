const Recette = require('../models/Recette');

// GET /recettes  — filtrage, tri, pagination
const listerRecettes = async (req, res) => {
  try {
    const { ingredient, auteur, categorie, tri } = req.query;
    const filtre = {};

    if (ingredient) {
      filtre.ingredients = { $regex: ingredient, $options: 'i' };
    }
    if (auteur) {
      filtre.auteur = auteur;
    }
    if (categorie) {
      filtre.categorie = { $regex: categorie, $options: 'i' };
    }

    // Tri : date (défaut), popularite
    const options = {};
    if (tri === 'popularite') {
      // Tri par nombre de likes (descendant)
      options.sort = { 'likes.length': -1 };
    } else {
      options.sort = { createdAt: -1 };
    }

    const recettes = await Recette.find(filtre, null, options)
      .populate('auteur', 'nom email')
      .select('-__v');

    // Tri par popularité en mémoire (tableau likes)
    if (tri === 'popularite') {
      recettes.sort((a, b) => b.likes.length - a.likes.length);
    }

    res.json(recettes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /recettes/:id
const obtenirRecette = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id)
      .populate('auteur', 'nom email')
      .populate('commentaires.auteur', 'nom')
      .select('-__v');

    if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });
    res.json(recette);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /recettes  (protégé)
const creerRecette = async (req, res) => {
  try {
    const { titre, description, ingredients, etapes, categorie, tempsPreparation, nbPersonnes } =
      req.body;

    const recette = await Recette.create({
      titre,
      description,
      ingredients,
      etapes,
      categorie,
      tempsPreparation,
      nbPersonnes,
      auteur: req.utilisateur._id,
    });

    await recette.populate('auteur', 'nom email');
    res.status(201).json(recette);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /recettes/:id  (protégé — auteur uniquement)
const modifierRecette = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });

    if (recette.auteur.toString() !== req.utilisateur._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const champs = ['titre', 'description', 'ingredients', 'etapes', 'categorie', 'tempsPreparation', 'nbPersonnes'];
    champs.forEach((c) => {
      if (req.body[c] !== undefined) recette[c] = req.body[c];
    });

    await recette.save();
    await recette.populate('auteur', 'nom email');
    res.json(recette);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /recettes/:id  (protégé — auteur uniquement)
const supprimerRecette = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });

    if (recette.auteur.toString() !== req.utilisateur._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    await recette.deleteOne();
    res.json({ message: 'Recette supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /recettes/:id/commentaires  (protégé)
const ajouterCommentaire = async (req, res) => {
  try {
    const { contenu } = req.body;
    if (!contenu) return res.status(400).json({ message: 'Le contenu est obligatoire.' });

    const recette = await Recette.findById(req.params.id);
    if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });

    recette.commentaires.push({ auteur: req.utilisateur._id, contenu });
    await recette.save();
    await recette.populate('commentaires.auteur', 'nom');

    res.status(201).json(recette.commentaires[recette.commentaires.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /recettes/:id/commentaires/:commentaireId  (protégé — auteur du commentaire)
const supprimerCommentaire = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });

    const commentaire = recette.commentaires.id(req.params.commentaireId);
    if (!commentaire) return res.status(404).json({ message: 'Commentaire introuvable.' });

    if (commentaire.auteur.toString() !== req.utilisateur._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    commentaire.deleteOne();
    await recette.save();
    res.json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /recettes/:id/likes  (protégé — toggle like)
const toggleLike = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });

    const userId = req.utilisateur._id.toString();
    const index = recette.likes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      recette.likes.push(req.utilisateur._id);
    } else {
      recette.likes.splice(index, 1);
    }

    await recette.save();
    res.json({ nbLikes: recette.likes.length, liked: index === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  listerRecettes,
  obtenirRecette,
  creerRecette,
  modifierRecette,
  supprimerRecette,
  ajouterCommentaire,
  supprimerCommentaire,
  toggleLike,
};
