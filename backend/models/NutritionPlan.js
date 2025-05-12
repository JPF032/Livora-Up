const mongoose = require('mongoose');

const NutritionPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  dailyCalorieTarget: { type: Number, required: true },
  dietType: { type: String },
  notes: { type: String },
  // entries: [{ type: mongoose.Schema.Types.Mixed }] // For future extension
}, { timestamps: true });

NutritionPlanSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('NutritionPlan', NutritionPlanSchema);
