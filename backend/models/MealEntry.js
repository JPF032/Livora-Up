const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MealEntry', mealEntrySchema);
