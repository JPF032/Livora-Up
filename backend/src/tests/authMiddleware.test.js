/**
 * Tests unitaires pour les middlewares d'authentification
 * Utilise des mocks pour simuler Firebase Admin
 */
const { verifyFirebaseToken, requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Mock de Firebase Admin
jest.mock('firebase-admin', () => {
  return {
    auth: () => ({
      verifyIdToken: jest.fn().mockImplementation((token) => {
        if (token === 'valid-token') {
          return Promise.resolve({ uid: 'test-uid', role: 'user' });
        } else if (token === 'admin-token') {
          return Promise.resolve({ uid: 'admin-uid', role: 'admin' });
        } else {
          return Promise.reject(new Error('Invalid token'));
        }
      })
    })
  };
});

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.firebaseUid === 'test-uid') {
          return Promise.resolve({ id: 1, firebaseUid: 'test-uid', role: 'user' });
        } else if (where.firebaseUid === 'admin-uid') {
          return Promise.resolve({ id: 2, firebaseUid: 'admin-uid', role: 'admin' });
        } else {
          return Promise.resolve(null);
        }
      })
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Authentication Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Réinitialiser les mocks entre les tests
    req = {
      headers: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  describe('verifyFirebaseToken', () => {
    test('Should pass with valid token in Authorization header', async () => {
      req.headers.authorization = 'Bearer valid-token';
      
      await verifyFirebaseToken(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.firebaseUid).toBe('test-uid');
    });
    
    test('Should reject with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      await verifyFirebaseToken(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
    });
    
    test('Should reject without token', async () => {
      await verifyFirebaseToken(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
  
  describe('requireAuth', () => {
    test('Should pass when user is authenticated', () => {
      req.user = { id: 1, firebaseUid: 'test-uid' };
      
      requireAuth(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    test('Should reject when user is not authenticated', () => {
      requireAuth(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
  
  describe('requireRole', () => {
    test('Should pass when user has required role', () => {
      req.user = { id: 2, firebaseUid: 'admin-uid', role: 'admin' };
      
      const middleware = requireRole(['admin']);
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    test('Should reject when user lacks required role', () => {
      req.user = { id: 1, firebaseUid: 'test-uid', role: 'user' };
      
      const middleware = requireRole(['admin']);
      middleware(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
    
    test('Should allow if user has one of multiple roles', () => {
      req.user = { id: 1, firebaseUid: 'test-uid', role: 'user' };
      
      const middleware = requireRole(['admin', 'user']);
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
