const mongoose = require('mongoose');

const MealSuggestionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  proteins: {
    type: Number, // en grammes
    min: 0
  },
  carbs: {
    type: Number, // en grammes
    min: 0
  },
  fats: {
    type: Number, // en grammes
    min: 0
  },
  calories: {
    type: Number,
    min: 0
  },
  preparationTime: {
    type: Number, // en minutes
    min: 0
  },
  recipe: {
    type: String
  },
  imageUrl: {
    type: String
  }
});

const MealTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  timeOfDay: {
    type: String,
    enum: ['matin', 'midi', 'soir', 'collation'],
    required: true
  },
  suggestions: [MealSuggestionSchema]
});

const MealTrackSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  mealTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  mealSuggestionId: {
    type: mongoose.Schema.Types.ObjectId
  },
  customMeal: {
    type: String
  },
  satisfied: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const NutritionProgramSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firebaseUid: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  dailyCalorieTarget: {
    type: Number,
    min: 0
  },
  macrosRatio: {
    proteins: {
      type: Number, // en pourcentage
      min: 0,
      max: 100
    },
    carbs: {
      type: Number, // en pourcentage
      min: 0,
      max: 100
    },
    fats: {
      type: Number, // en pourcentage
      min: 0,
      max: 100
    }
  },
  meals: [MealTypeSchema],
  mealTracks: [MealTrackSchema],
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ['system', 'nutritionist', 'user'],
    default: 'system'
  },
  dietType: {
    type: String,
    enum: ['equilibre', 'vegetarien', 'vegan', 'paleo', 'cetogene', 'autres'],
    default: 'equilibre'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NutritionProgram', NutritionProgramSchema);
