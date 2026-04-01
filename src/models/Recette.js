const mongoose = require('mongoose');

const commentaireSchema = new mongoose.Schema(
  {
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    contenu: {
      type: String,
      required: [true, 'Le contenu du commentaire est obligatoire'],
      trim: true,
    },
  },
  { timestamps: true }
);

const recetteSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [String],
      required: [true, 'Les ingrédients sont obligatoires'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Au moins un ingrédient est requis',
      },
    },
    etapes: {
      type: [String],
      required: [true, 'Les étapes sont obligatoires'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Au moins une étape est requise',
      },
    },
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    categorie: {
      type: String,
      trim: true,
    },
    tempsPreparation: {
      type: Number, // en minutes
      min: [0, 'Le temps de préparation doit être positif'],
    },
    nbPersonnes: {
      type: Number,
      min: [1, 'Le nombre de personnes doit être au moins 1'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
      },
    ],
    commentaires: [commentaireSchema],
  },
  { timestamps: true }
);

// Champ virtuel pour le nombre de likes
recetteSchema.virtual('nbLikes').get(function () {
  return this.likes.length;
});

recetteSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Recette', recetteSchema);
