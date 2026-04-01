const router = require('express').Router();
const { proteger } = require('../middleware/auth');
const {
  listerUtilisateurs,
  obtenirUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
} = require('../controllers/utilisateurController');

router.get('/', listerUtilisateurs);
router.get('/:id', obtenirUtilisateur);
router.put('/:id', proteger, modifierUtilisateur);
router.delete('/:id', proteger, supprimerUtilisateur);

module.exports = router;
