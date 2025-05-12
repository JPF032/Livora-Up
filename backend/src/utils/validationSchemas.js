/**
 * Schémas de validation Joi pour les données d'entrée
 * Permet de valider les requêtes avant traitement
 */
const Joi = require('joi');

// Schéma pour le profil utilisateur
const userProfileSchema = Joi.object({
  age: Joi.number().integer().min(16).max(100).optional(),
  sex: Joi.string().valid('Homme', 'Femme', 'Autre').optional(),
  currentLevel: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé').optional().default('Débutant'),
  objective: Joi.string().min(3).max(200).optional(),
  constraints: Joi.array().items(Joi.string().min(3).max(100)).optional(),
  availability: Joi.string().min(3).max(100).optional(),
  weight: Joi.number().min(30).max(250).optional(),
  height: Joi.number().min(100).max(250).optional(),
  equipmentAvailable: Joi.array().items(Joi.string()).optional(),
  userId: Joi.string().optional() // Sera remplacé par le middleware d'authentification
});

// Schéma pour la génération de programme sportif
const sportProgramRequestSchema = Joi.object({
  userProfile: userProfileSchema.required()
});

// Schéma pour les paramètres de query de liste de programmes
const listProgramsQuerySchema = Joi.object({
  onlyActive: Joi.boolean().optional().default(false),
  limit: Joi.number().integer().min(1).max(50).optional().default(10),
  offset: Joi.number().integer().min(0).optional().default(0)
});

// Schéma pour l'assignation de rôle utilisateur
const assignRoleSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('user', 'admin', 'coach').required()
});

/**
 * Middleware de validation Joi
 * @param {Joi.Schema} schema - Schéma de validation
 * @param {string} property - Propriété de la requête à valider ('body', 'query', 'params')
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true // Supprime les propriétés non définies dans le schéma
    });

    if (error) {
      // Formater les erreurs de validation
      const errorDetails = error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Données invalides dans la requête',
        errors: errorDetails
      });
    }

    // Remplacer les données validées et normalisées
    req[property] = value;
    next();
  };
};

module.exports = {
  validateRequest,
  schemas: {
    sportProgramRequest: sportProgramRequestSchema,
    listProgramsQuery: listProgramsQuerySchema,
    userProfile: userProfileSchema,
    assignRole: assignRoleSchema
  }
};
