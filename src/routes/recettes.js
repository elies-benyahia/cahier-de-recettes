const router = require('express').Router();
const { proteger } = require('../middleware/auth');
const {
  listerRecettes,
  obtenirRecette,
  creerRecette,
  modifierRecette,
  supprimerRecette,
  ajouterCommentaire,
  supprimerCommentaire,
  toggleLike,
} = require('../controllers/recetteController');

router.get('/', listerRecettes);
router.get('/:id', obtenirRecette);
router.post('/', proteger, creerRecette);
router.put('/:id', proteger, modifierRecette);
router.delete('/:id', proteger, supprimerRecette);

router.post('/:id/commentaires', proteger, ajouterCommentaire);
router.delete('/:id/commentaires/:commentaireId', proteger, supprimerCommentaire);

router.post('/:id/likes', proteger, toggleLike);

module.exports = router;
