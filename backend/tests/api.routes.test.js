const request = require('supertest');
const express = require('express');
const apiRoutes = require('../routes/api');
const { authenticateFirebaseToken } = require('../middlewares/auth');

// Mock du middleware d'authentification
jest.mock('../middlewares/auth', () => ({
  authenticateFirebaseToken: jest.fn((req, res, next) => {
    // Simuler un utilisateur authentifié pour les tests
    req.user = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User'
    };
    next();
  })
}));

// Mock des contrôleurs
jest.mock('../controllers/userController', () => ({
  getUserProfile: jest.fn((req, res) => {
    res.status(200).json({
      success: true,
      data: {
        _id: 'mock-user-id',
        firebaseUid: req.user.uid,
        email: req.user.email,
        displayName: req.user.name,
        emailVerified: req.user.emailVerified
      }
    });
  }),
  updateUserProfile: jest.fn((req, res) => {
    res.status(200).json({
      success: true,
      data: {
        _id: 'mock-user-id',
        firebaseUid: req.user.uid,
        email: req.user.email,
        displayName: req.body.displayName || req.user.name,
        emailVerified: req.user.emailVerified
      }
    });
  })
}));

jest.mock('../controllers/sportController', () => ({
  getSportProgram: jest.fn((req, res) => {
    res.status(200).json({
      success: true,
      data: {
        _id: 'mock-sport-program-id',
        title: 'Programme sportif de test',
        description: 'Description du programme de test',
        exercises: []
      }
    });
  }),
  trackWorkout: jest.fn((req, res) => {
    res.status(201).json({
      success: true,
      message: 'Entraînement enregistré avec succès',
      data: {
        _id: 'mock-track-id',
        exerciseId: req.body.exerciseId,
        date: new Date()
      }
    });
  })
}));

jest.mock('../controllers/nutritionController', () => ({
  getNutritionProgram: jest.fn((req, res) => {
    res.status(200).json({
      success: true,
      data: {
        _id: 'mock-nutrition-program-id',
        title: 'Programme nutritionnel de test',
        description: 'Description du programme nutritionnel de test',
        meals: []
      }
    });
  }),
  trackMeal: jest.fn((req, res) => {
    res.status(201).json({
      success: true,
      message: 'Repas enregistré avec succès',
      data: {
        _id: 'mock-meal-track-id',
        mealTypeId: req.body.mealTypeId,
        date: new Date()
      }
    });
  })
}));

describe('Routes API', () => {
  let app;
  
  beforeAll(() => {
    // Créer une application Express pour les tests
    app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);
  });
  
  describe('Route de santé', () => {
    it('GET /api/health devrait retourner le statut ok', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
  
  describe('Routes utilisateur', () => {
    it('GET /api/profile devrait retourner le profil utilisateur', async () => {
      const response = await request(app).get('/api/profile');
      
      expect(authenticateFirebaseToken).toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('firebaseUid', 'test-uid');
    });
    
    it('PUT /api/profile devrait mettre à jour le profil utilisateur', async () => {
      const updatedName = 'Nouveau Nom';
      const response = await request(app)
        .put('/api/profile')
        .send({ displayName: updatedName });
      
      expect(authenticateFirebaseToken).toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('displayName', updatedName);
    });
  });
  
  describe('Routes programme sportif', () => {
    it('GET /api/programs/sport devrait retourner le programme sportif', async () => {
      const response = await request(app).get('/api/programs/sport');
      
      expect(authenticateFirebaseToken).toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('title', 'Programme sportif de test');
    });
    
    it('POST /api/programs/sport/track devrait enregistrer un entraînement', async () => {
      const response = await request(app)
        .post('/api/programs/sport/track')
        .send({ exerciseId: 'mock-exercise-id' });
      
      expect(authenticateFirebaseToken).toHaveBeenCalled();
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Entraînement enregistré avec succès');
    });
  });
  
  describe('Routes programme nutritionnel', () => {
    it('GET /api/programs/nutrition devrait retourner le programme nutritionnel', async () => {
      const response = await request(app).get('/api/programs/nutrition');
      
      expect(authenticateFirebaseToken).toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('title', 'Programme nutritionnel de test');
    });
    
    it('POST /api/programs/nutrition/track devrait enregistrer un repas', async () => {
      const response = await request(app)
        .post('/api/programs/nutrition/track')
        .send({ mealTypeId: 'mock-meal-type-id' });
      
      expect(authenticateFirebaseToken).toHaveBeenCalled();
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Repas enregistré avec succès');
    });
  });
});
