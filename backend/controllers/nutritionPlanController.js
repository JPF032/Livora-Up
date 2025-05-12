const NutritionPlan = require('../models/NutritionPlan');

// GET /api/programme/nutrition
exports.getNutritionPlan = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const plan = await NutritionPlan.findOne({ userId });
    if (!plan) {
      return res.status(404).json({ message: 'Aucun plan nutritionnel trouvé.' });
    }
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// POST /api/programme/nutrition (upsert)
exports.upsertNutritionPlan = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { dailyCalorieTarget, dietType, notes } = req.body;
    if (!dailyCalorieTarget || dailyCalorieTarget < 1000 || dailyCalorieTarget > 10000) {
      return res.status(400).json({ message: 'Objectif calorique invalide (1000-10000 kcal requis).' });
    }
    const plan = await NutritionPlan.findOneAndUpdate(
      { userId },
      { $set: { dailyCalorieTarget, dietType, notes } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// (Optional) PUT /api/programme/nutrition
exports.updateNutritionPlan = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { dailyCalorieTarget, dietType, notes } = req.body;
    if (!dailyCalorieTarget || dailyCalorieTarget < 1000 || dailyCalorieTarget > 10000) {
      return res.status(400).json({ message: 'Objectif calorique invalide (1000-10000 kcal requis).' });
    }
    const plan = await NutritionPlan.findOneAndUpdate(
      { userId },
      { $set: { dailyCalorieTarget, dietType, notes } },
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Aucun plan nutritionnel trouvé.' });
    }
    res.json(plan);
  } catch (err) {
    next(err);
  }
};
