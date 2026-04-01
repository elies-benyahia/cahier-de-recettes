require('dotenv').config();
const express = require('express');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const utilisateurRoutes = require('./src/routes/utilisateurs');
const recetteRoutes = require('./src/routes/recettes');

const app = express();

// Connexion MongoDB
connectDB();

// Middlewares
app.use(express.json());

// Documentation Swagger
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use('/auth', authRoutes);
app.use('/utilisateurs', utilisateurRoutes);
app.use('/recettes', recetteRoutes);

// Gestion des routes inexistantes
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation Swagger : http://localhost:${PORT}/api-docs`);
});
