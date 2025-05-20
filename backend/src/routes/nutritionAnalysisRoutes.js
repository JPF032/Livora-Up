const express = require('express');
const router = express.Router();
const { verifyCsrfToken } = require('../middlewares/csrfMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');
const { analyzeFoodImage } = require('../../services/clarifaiService');

/**
 * @route POST /api/nutrition-analysis/analyze-image
 * @desc Analyser une image de nourriture pour obtenir les informations nutritionnelles
 * @access Privé
 */
router.post('/analyze-image', verifyToken, verifyCsrfToken, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image requise' 
      });
    }
    
    // Supprimer le préfixe data:image/jpeg;base64, si présent
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Analyser l'image avec le service amélioré
    const nutritionData = await analyzeFoodImage(base64Data);
    
    return res.status(200).json({
      success: true,
      data: nutritionData
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'analyse de l\'image'
    });
  }
});

module.exports = router;
