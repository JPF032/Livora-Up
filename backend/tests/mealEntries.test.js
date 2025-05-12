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

describe('API Routes - Entrées de repas', () => {
  let testProgramId;
  let testMealTypeId;

  // Avant chaque test, créer l'utilisateur et un programme nutritionnel de test
  beforeEach(async () => {
    await User.deleteMany({});
    await NutritionProgram.deleteMany({});

    // Créer l'utilisateur de test
    await User.create(testUser);

    // Créer un programme nutritionnel avec un type de repas
    const testProgram = new NutritionProgram({
      userId: testUser._id,
      firebaseUid: testUser.firebaseUid,
      title: 'Programme de test',
      dailyCalorieTarget: 2000,
      meals: [{
        name: 'Déjeuner',
        description: 'Repas du midi',
        timeOfDay: 'midi',
        suggestions: []
      }],
      active: true
    });

    await testProgram.save();
    testProgramId = testProgram._id;
    testMealTypeId = testProgram.meals[0]._id;
  });

  // Après tous les tests, fermer la connexion MongoDB
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test pour l'ajout d'une entrée de repas
  describe('POST /api/programs/nutrition/entries', () => {
    it('devrait ajouter une nouvelle entrée de repas', async () => {
      const mealEntry = {
        foodName: 'Test Food',
        calories: 123,
        mealTypeId: testMealTypeId.toString()
      };

      const response = await request(app)
        .post('/api/programs/nutrition/entries')
        .set('Authorization', `Bearer ${validToken}`)
        .send(mealEntry);

      // Vérifications
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('foodName', 'Test Food');
      expect(response.body.data).toHaveProperty('calories', 123);

      // Vérifier que l'entrée a bien été ajoutée au programme
      const updatedProgram = await NutritionProgram.findOne({ firebaseUid: testUser.firebaseUid });
      expect(updatedProgram.mealTracks).toHaveLength(1);
      expect(updatedProgram.mealTracks[0]).toHaveProperty('mealTypeId', testMealTypeId);
    });

    it('devrait échouer si le type de repas n\'est pas spécifié', async () => {
      const mealEntry = {
        foodName: 'Test Food',
        calories: 123
        // mealTypeId manquant
      };

      const response = await request(app)
        .post('/api/programs/nutrition/entries')
        .set('Authorization', `Bearer ${validToken}`)
        .send(mealEntry);

      // Vérifications
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait échouer si l\'utilisateur n\'a pas de programme actif', async () => {
      // Supprimer le programme de l'utilisateur
      await NutritionProgram.deleteMany({ firebaseUid: testUser.firebaseUid });

      const mealEntry = {
        foodName: 'Test Food',
        calories: 123,
        mealTypeId: testMealTypeId.toString()
      };

      const response = await request(app)
        .post('/api/programs/nutrition/entries')
        .set('Authorization', `Bearer ${validToken}`)
        .send(mealEntry);

      // Vérifications
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // Test pour la récupération des entrées de repas
  describe('GET /api/programs/nutrition/entries', () => {
    it('devrait récupérer toutes les entrées de repas de l\'utilisateur', async () => {
      // D'abord, ajouter quelques entrées de repas
      const program = await NutritionProgram.findOne({ firebaseUid: testUser.firebaseUid });
      
      program.mealTracks.push({
        date: new Date(),
        mealTypeId: testMealTypeId,
        customMeal: 'Salade César',
        calories: 350
      });
      
      program.mealTracks.push({
        date: new Date(),
        mealTypeId: testMealTypeId,
        customMeal: 'Poulet grillé',
        calories: 450
      });
      
      await program.save();

      // Récupérer les entrées
      const response = await request(app)
        .get('/api/programs/nutrition/entries')
        .set('Authorization', `Bearer ${validToken}`);

      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('customMeal');
      expect(response.body.data[1]).toHaveProperty('calories');
    });

    it('devrait filtrer les entrées par date', async () => {
      // Préparer des dates de test
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // D'abord, ajouter des entrées de repas avec des dates différentes
      const program = await NutritionProgram.findOne({ firebaseUid: testUser.firebaseUid });
      
      program.mealTracks.push({
        date: today,
        mealTypeId: testMealTypeId,
        customMeal: 'Repas d\'aujourd\'hui',
        calories: 350
      });
      
      program.mealTracks.push({
        date: yesterday,
        mealTypeId: testMealTypeId,
        customMeal: 'Repas d\'hier',
        calories: 450
      });
      
      await program.save();

      // Formater la date d'aujourd'hui pour le filtre
      const dateFilter = today.toISOString().split('T')[0];

      // Récupérer les entrées avec filtre de date
      const response = await request(app)
        .get(`/api/programs/nutrition/entries?date=${dateFilter}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Vérifications
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('customMeal', 'Repas d\'aujourd\'hui');
    });
  });

  // Test pour l'analyse d'une photo (avec mock)
  describe('POST /api/programs/nutrition/analyze (avec mock)', () => {
    it('devrait analyser une image et retourner une estimation de calories', async () => {
      // Ce test supposerait normalement l'utilisation d'un mock pour Clarifai
      // Nous simulons ici la réponse du contrôleur directement
      
      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==';
      
      const expectedResponse = {
        foodName: 'banana',
        calories: 105
      };
      
      // Note: Dans un vrai test, nous utiliserions jest.mock() pour simuler le service Clarifai
      // Pour ce template, nous supposons simplement que le endpoint existe et renvoie les données attendues
      
      const response = await request(app)
        .post('/api/programs/nutrition/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ image: mockImageData });
      
      // Vérifications basées sur le comportement attendu du endpoint
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('foodName');
      expect(response.body.data).toHaveProperty('calories');
      
      // Remarque: Les valeurs exactes dépendraient de l'implémentation réelle
    });
  });
});
