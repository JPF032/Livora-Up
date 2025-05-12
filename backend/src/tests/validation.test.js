/**
 * Tests unitaires pour les schémas de validation Joi
 */
const { schemas } = require('../utils/validationSchemas');

describe('Validation Schemas', () => {
  describe('userProfileSchema', () => {
    test('Should validate a correct user profile', () => {
      const validProfile = {
        age: 30,
        sex: 'Homme',
        currentLevel: 'Débutant',
        objective: 'Perdre du poids',
        constraints: ['Douleur au genou', 'Horaires limités'],
        availability: '3 fois par semaine',
        weight: 75,
        height: 180,
        equipmentAvailable: ['Haltères', 'Tapis de yoga']
      };

      const { error, value } = schemas.userProfile.validate(validProfile);
      expect(error).toBeUndefined();
      expect(value).toEqual(validProfile);
    });

    test('Should reject an invalid user profile', () => {
      const invalidProfile = {
        age: 10, // Trop jeune
        sex: 'Inconnu', // Valeur non autorisée
        currentLevel: 'Expert', // Valeur non autorisée
        objective: 'a' // Trop court
      };

      const { error } = schemas.userProfile.validate(invalidProfile);
      expect(error).toBeDefined();
      // Vérifier que des erreurs sont présentes pour chaque champ invalide
      expect(error.details.some(e => e.path.includes('age'))).toBeTruthy();
      expect(error.details.some(e => e.path.includes('sex'))).toBeTruthy();
      expect(error.details.some(e => e.path.includes('currentLevel'))).toBeTruthy();
      expect(error.details.some(e => e.path.includes('objective'))).toBeTruthy();
    });

    test('Should use default values when possible', () => {
      const partialProfile = {
        age: 25,
        sex: 'Femme'
        // currentLevel est manquant
      };

      const { error, value } = schemas.userProfile.validate(partialProfile);
      expect(error).toBeUndefined();
      // Vérifier que le niveau par défaut est appliqué
      expect(value.currentLevel).toBe('Débutant');
    });
  });

  describe('sportProgramRequestSchema', () => {
    test('Should validate a correct request', () => {
      const validRequest = {
        userProfile: {
          age: 30,
          sex: 'Homme',
          currentLevel: 'Débutant'
        }
      };

      const { error } = schemas.sportProgramRequest.validate(validRequest);
      expect(error).toBeUndefined();
    });

    test('Should reject a request without userProfile', () => {
      const invalidRequest = {
        // Pas de userProfile
        someOtherField: 'value'
      };

      const { error } = schemas.sportProgramRequest.validate(invalidRequest);
      expect(error).toBeDefined();
    });
  });

  describe('listProgramsQuerySchema', () => {
    test('Should validate and normalize parameters', () => {
      const validQuery = {
        onlyActive: 'true', // Chaîne à convertir en booléen
        limit: '20', // Chaîne à convertir en nombre
        offset: '10' // Chaîne à convertir en nombre
      };

      const { error, value } = schemas.listProgramsQuery.validate(validQuery);
      expect(error).toBeUndefined();
      // Vérifier la conversion des types
      expect(value.onlyActive).toBe(true);
      expect(value.limit).toBe(20);
      expect(value.offset).toBe(10);
    });

    test('Should apply default values', () => {
      const emptyQuery = {};

      const { error, value } = schemas.listProgramsQuery.validate(emptyQuery);
      expect(error).toBeUndefined();
      // Vérifier les valeurs par défaut
      expect(value.onlyActive).toBe(false);
      expect(value.limit).toBe(10);
      expect(value.offset).toBe(0);
    });

    test('Should reject invalid limits', () => {
      const invalidQuery = {
        limit: 100, // Supérieur à la limite max (50)
        offset: -5 // Négatif
      };

      const { error } = schemas.listProgramsQuery.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error.details.some(e => e.path.includes('limit'))).toBeTruthy();
      expect(error.details.some(e => e.path.includes('offset'))).toBeTruthy();
    });
  });
});
