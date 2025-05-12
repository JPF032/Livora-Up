const User = require('../models/User');

/**
 * @desc    Récupérer le profil de l'utilisateur courant
 * @route   GET /api/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    // Chercher l'utilisateur dans la base de données
    let user = await User.findOne({ firebaseUid });
    
    // Si l'utilisateur n'existe pas, créer un nouveau profil
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: req.user.email || 'email@example.com',
        displayName: req.user.name || 'Utilisateur Livora',
        emailVerified: req.user.emailVerified || false,
        photoURL: req.user.picture || '',
      });
    }
    
    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour le profil de l'utilisateur courant
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { displayName, metadata } = req.body;
    
    // Chercher l'utilisateur dans la base de données
    let user = await User.findOne({ firebaseUid });
    
    // Si l'utilisateur n'existe pas, retourner une erreur
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour les champs modifiables
    if (displayName) {
      user.displayName = displayName;
    }
    
    // Mettre à jour les métadonnées si fournies
    if (metadata) {
      user.metadata = { ...user.metadata, ...metadata };
    }
    
    // Sauvegarder les modifications
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
