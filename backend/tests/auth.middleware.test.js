const { authenticateFirebaseToken } = require('../middlewares/auth');

// Mock de l'admin Firebase
jest.mock('../config/firebase', () => ({
  admin: {
    auth: () => ({
      verifyIdToken: jest.fn()
    })
  }
}));

// Importer le module admin après le mock
const { admin } = require('../config/firebase');

describe('Middleware d\'authentification Firebase', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('devrait renvoyer 401 si le header Authorization est manquant', async () => {
    await authenticateFirebaseToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Token manquant')
    }));
    expect(next).not.toHaveBeenCalled();
  });
  
  it('devrait renvoyer 401 si le format du header Authorization est invalide', async () => {
    req.headers.authorization = 'Invalid format';
    
    await authenticateFirebaseToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Token manquant')
    }));
    expect(next).not.toHaveBeenCalled();
  });
  
  it('devrait appeler next() en mode développement avec un token spécial', async () => {
    // Sauvegarder et modifier NODE_ENV pour ce test
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    req.headers.authorization = 'Bearer dev-mock-token-for-testing';
    
    await authenticateFirebaseToken(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      uid: 'dev-user-uid',
      email: 'dev@example.com'
    });
    
    // Restaurer NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
  
  it('devrait vérifier le token et appeler next() si le token est valide', async () => {
    req.headers.authorization = 'Bearer valid-token';
    
    // Mock de la vérification réussie du token
    admin.auth().verifyIdToken.mockResolvedValueOnce({
      uid: 'test-uid',
      email: 'test@example.com',
      email_verified: true,
      name: 'Test User'
    });
    
    await authenticateFirebaseToken(req, res, next);
    
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual({
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      picture: ''
    });
    expect(next).toHaveBeenCalled();
  });
  
  it('devrait renvoyer 401 si la vérification du token échoue', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    
    // Mock de l'échec de vérification du token
    admin.auth().verifyIdToken.mockRejectedValueOnce(new Error('Token invalide'));
    
    await authenticateFirebaseToken(req, res, next);
    
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('invalid-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Token invalide')
    }));
    expect(next).not.toHaveBeenCalled();
  });
  
  it('devrait renvoyer 401 avec un message spécifique si le token est expiré', async () => {
    req.headers.authorization = 'Bearer expired-token';
    
    // Mock de l'échec de vérification avec un code spécifique pour token expiré
    const error = new Error('Token expiré');
    error.code = 'auth/id-token-expired';
    admin.auth().verifyIdToken.mockRejectedValueOnce(error);
    
    await authenticateFirebaseToken(req, res, next);
    
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('expired-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Token expiré')
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
