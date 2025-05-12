/**
 * Point d'entrée principal du backend Livora UP
 * Ce fichier charge l'application depuis la nouvelle structure dans src/app.js
 */

// Afficher un message informatif sur la migration vers la nouvelle structure
console.log('===============================================================');
console.log('🚀 Démarrage du backend Livora UP avec PostgreSQL et Clarifai');
console.log('Le code principal a été migré vers src/app.js');
console.log('===============================================================');

// Importer l'application depuis la nouvelle structure
try {
  const app = require('./src/app');
  
  // Le serveur est démarré dans app.js, donc ce fichier sert uniquement de redirecteur
  // pour maintenir la compatibilité avec les scripts existants
  module.exports = app;
  
} catch (error) {
  console.error('❌ Erreur lors du chargement de l\'application:', error);
  console.error('\nVérifiez que toutes les dépendances sont installées:');
  console.error('1. npm install');
  console.error('\nEt que PostgreSQL est configuré correctement:');
  console.error('1. Créez un fichier .env basé sur .env.example');
  console.error('2. Définissez DATABASE_URL avec les informations de connexion à votre base PostgreSQL');
  console.error('3. Définissez CLARIFAI_PAT, CLARIFAI_LLM_MODEL_ID, CLARIFAI_USER_ID et CLARIFAI_APP_ID');
  console.error('\nPour initialiser la base de données:');
  console.error('1. npx prisma generate');
  console.error('2. npx prisma migrate dev --name init');
  console.error('\nPour plus d\'informations, consultez la documentation.');
  
  // Sortir avec un code d'erreur pour indiquer un problème
  process.exit(1);
}// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.originalUrl}`
  });
});

// Fonction pour démarrer le serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré en mode ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API accessible à: http://localhost:${PORT}`);
      console.log(`🛡️ Authentification Firebase: ${process.env.FIREBASE_PROJECT_ID ? 'Configurée' : 'Non configurée (mode dev)'}`);
      console.log(`📚 API routes disponibles: /api/health, /api/profile, /api/programs/*`);
    });
  } catch (error) {
    console.error(`❌ Erreur lors du démarrage du serveur: ${error.message}`);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
