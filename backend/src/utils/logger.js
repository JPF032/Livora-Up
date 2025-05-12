/**
 * Système de journalisation avancé avec Winston
 * Centralise tous les logs de l'application avec différents niveaux de détail
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Créer le répertoire des logs s'il n'existe pas
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    // Format de base du message
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Ajouter la stack trace si disponible
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    // Ajouter les métadonnées si présentes
    if (Object.keys(meta).length > 0) {
      logMessage += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Configuration des niveaux de log avec couleurs
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Couleurs pour les différents niveaux de log en console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'white',
};

// Ajouter les couleurs à Winston
winston.addColors(colors);

// Déterminer le niveau de log en fonction de l'environnement
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Options pour les transports
const consoleOptions = {
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    logFormat
  ),
};

const fileOptions = {
  format: logFormat,
  maxsize: 5242880, // 5MB
  maxFiles: 5,
};

// Création du logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    // Logs d'erreur dans un fichier séparé
    new winston.transports.File({
      ...fileOptions,
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    
    // Logs combinés dans un fichier
    new winston.transports.File({
      ...fileOptions,
      filename: path.join(logDir, 'combined.log'),
    }),
    
    // Logs en console (uniquement en développement)
    new winston.transports.Console(consoleOptions),
  ],
  exceptionHandlers: [
    // Log des exceptions non gérées
    new winston.transports.File({
      ...fileOptions,
      filename: path.join(logDir, 'exceptions.log'),
    }),
    new winston.transports.Console(consoleOptions),
  ],
  rejectionHandlers: [
    // Log des promesses rejetées non gérées
    new winston.transports.File({
      ...fileOptions,
      filename: path.join(logDir, 'rejections.log'),
    }),
    new winston.transports.Console(consoleOptions),
  ],
  exitOnError: false, // Ne pas quitter en cas d'erreur
});

// Fonction utilitaire pour logger les requêtes HTTP
const logHttpRequest = (req, res, next) => {
  const { method, url, body, query, headers, ip } = req;
  const userAgent = headers['user-agent'];
  const userId = req.user?.firebaseUid || 'anonymous';
  
  logger.http(`${method} ${url}`, {
    method,
    url,
    body: method !== 'GET' ? sanitizeBody(body) : undefined,
    query,
    userAgent,
    ip,
    userId,
  });
  
  next();
};

// Fonction pour nettoyer les données sensibles avant journalisation
const sanitizeBody = (body) => {
  if (!body) return {};
  
  // Créer une copie pour ne pas modifier l'original
  const sanitized = JSON.parse(JSON.stringify(body));
  
  // Liste des champs à masquer
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  
  // Fonction récursive pour masquer les champs sensibles
  const maskSensitiveData = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        maskSensitiveData(obj[key]);
      }
    });
  };
  
  maskSensitiveData(sanitized);
  return sanitized;
};

// Fonction pour logger les erreurs avec contexte
const logError = (err, req = null, extra = {}) => {
  const errorContext = {
    ...extra,
    requestInfo: req ? {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.firebaseUid || 'anonymous',
    } : undefined,
  };
  
  logger.error(`${err.message || 'Erreur non spécifiée'}`, {
    ...errorContext,
    stack: err.stack,
  });
};

module.exports = {
  logger,
  logHttpRequest,
  logError,
};
