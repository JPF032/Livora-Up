const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const NutritionProgram = require('../models/NutritionProgram');
const User = require('../models/User');
const { generateToken } = require('../utils/auth');

// Données de test
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  firebaseUid: 'test-user-id-123',
  email: 'test@example.com',
  displayName: 'Test User'
};

// Token valide pour les tests
const validToken = generateToken(testUser);

describe('API Routes - Programme de Nutrition', () => {
  // Avant chaque test, créer l'utilisateur de test et nettoyer les programmes précédents
  beforeEach(async () => {
    await User.deleteMany({});
    await NutritionProgram.deleteMany({});

    // Créer l'utilisateur de test
    await User.create(testUser);
  });

  // Après tous les tests, fermer la connexion MongoDB
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Scénario 1: Création d'un programme nutritionnel avec un objectif quotidien
  describe('POST /api/programs/nutrition', () => {
    it('devrait créer un programme nutritionnel avec l\'objectif calorique spécifié', async () => {
      const response = await request(app)
        .post('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          dailyCalorieTarget: 2000
        });

      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dailyCalorieTarget', 2000);
      expect(response.body.data).toHaveProperty('firebaseUid', testUser.firebaseUid);
      
      // Vérifier que le programme a bien été enregistré dans la base de données
      const savedProgram = await NutritionProgram.findOne({ firebaseUid: testUser.firebaseUid });
      expect(savedProgram).toBeTruthy();
      expect(savedProgram.dailyCalorieTarget).toBe(2000);
    });

    it('devrait échouer si l\'utilisateur n\'est pas authentifié', async () => {
      const response = await request(app)
        .post('/api/programs/nutrition')
        .send({
          dailyCalorieTarget: 2000
        });

      // Vérifications
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // Scénario 2: Récupération du programme nutritionnel
  describe('GET /api/programs/nutrition', () => {
    it('devrait récupérer le programme nutritionnel existant de l\'utilisateur', async () => {
      // Créer d'abord un programme
      const testProgram = {
        userId: testUser._id,
        firebaseUid: testUser.firebaseUid,
        title: 'Test Program',
        dailyCalorieTarget: 2000,
        active: true
      };
      
      await NutritionProgram.create(testProgram);

      // Récupérer le programme
      const response = await request(app)
        .get('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`);

      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dailyCalorieTarget', 2000);
      expect(response.body.data).toHaveProperty('firebaseUid', testUser.firebaseUid);
    });

    it('devrait créer un programme par défaut si aucun n\'existe pour l\'utilisateur', async () => {
      // Aucun programme créé au préalable

      // Récupérer le programme
      const response = await request(app)
        .get('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`);

      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dailyCalorieTarget');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('meals');
      expect(response.body.data.meals.length).toBeGreaterThan(0);
    });
  });

  // Scénario 3: Mise à jour du programme nutritionnel existant
  describe('PUT /api/programs/nutrition', () => {
    it('devrait mettre à jour l\'objectif calorique d\'un programme existant', async () => {
      // Créer d'abord un programme
      const testProgram = {
        userId: testUser._id,
        firebaseUid: testUser.firebaseUid,
        title: 'Test Program',
        dailyCalorieTarget: 2000,
        active: true
      };
      
      await NutritionProgram.create(testProgram);

      // Mettre à jour le programme
      const response = await request(app)
        .put('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          dailyCalorieTarget: 2500
        });

      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dailyCalorieTarget', 2500);
      
      // Vérifier la mise à jour dans la base de données
      const updatedProgram = await NutritionProgram.findOne({ firebaseUid: testUser.firebaseUid });
      expect(updatedProgram.dailyCalorieTarget).toBe(2500);
    });

    it('devrait retourner une erreur 404 si aucun programme n\'existe', async () => {
      // Aucun programme créé au préalable

      // Tenter de mettre à jour
      const response = await request(app)
        .put('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          dailyCalorieTarget: 2500
        });

      // Vérifications
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // Scénario 4: Test d'idempotence
  describe('Idempotence des opérations POST et PUT', () => {
    it('devrait mettre à jour correctement lors des appels POST consécutifs', async () => {
      // Premier appel
      await request(app)
        .post('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ dailyCalorieTarget: 2000 });

      // Deuxième appel avec une valeur différente
      const response = await request(app)
        .post('/api/programs/nutrition')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ dailyCalorieTarget: 2500 });

      // Vérifications que la nouvelle valeur est prise en compte
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('dailyCalorieTarget', 2500);
      
      // Vérifier la base de données
      const program = await NutritionProgram.findOne({ firebaseUid: testUser.firebaseUid });
      expect(program.dailyCalorieTarget).toBe(2500);
    });
  });
});
