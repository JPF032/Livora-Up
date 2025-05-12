/**
 * Client Prisma pour accéder à la base de données PostgreSQL
 * Ce singleton doit être importé dans tous les services qui ont besoin d'accéder à la DB
 */
const { PrismaClient } = require('@prisma/client');

// Options de configuration Prisma
const options = {
  log: ['query', 'info', 'warn', 'error'],
};

// En production, on peut désactiver les logs de requêtes pour des raisons de performances
if (process.env.NODE_ENV === 'production') {
  options.log = ['warn', 'error'];
}

// Création du client Prisma avec gestion d'erreur
const prisma = new PrismaClient(options);

prisma.$connect()
  .then(() => {
    console.log('✅ Connexion à PostgreSQL établie avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à PostgreSQL:', error);
    process.exit(1);
  });

// Middleware de logging pour le débogage en dev
if (process.env.NODE_ENV !== 'production') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`[Prisma Query] ${params.model}.${params.action} - ${after - before}ms`);
    return result;
  });
}

module.exports = prisma;
