const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance'],
    default: 'intermediaire'
  },
  muscleGroups: [{
    type: String,
    enum: ['jambes', 'bras', 'poitrine', 'dos', 'epaules', 'abdominaux', 'cardio', 'full_body']
  }],
  durationMinutes: {
    type: Number,
    min: 0
  },
  restSeconds: {
    type: Number,
    min: 0
  },
  videoUrl: {
    type: String
  },
  day: {
    type: Number,
    min: 1,
    max: 7,
    default: 1,
    description: "Jour de la semaine pour cet exercice (1-7)"
  },
  completed: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0,
    description: "Ordre d'exécution des exercices dans une journée"
  }
});

const WorkoutTrackSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  actualSets: {
    type: Number
  },
  actualReps: {
    type: Number
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const SportProgramSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firebaseUid: {
    type: String,
    required: true,
    index: true  // Indexé pour des recherches plus rapides
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
  level: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance'],
    default: 'debutant'
  },
  goal: {
    type: String,
    enum: ['perte_poids', 'prise_muscle', 'forme_physique', 'endurance', 'force', 'flexibilite', 'general'],
    default: 'general'
  },
  daysPerWeek: {
    type: Number,
    min: 1,
    max: 7,
    default: 3
  },
  exercises: [ExerciseSchema],
  workoutTracks: [WorkoutTrackSchema],
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ['system', 'coach', 'user', 'ai'],
    default: 'system'
  },
  lastGenerated: {
    type: Date,
    default: Date.now
  },
  isCustomized: {
    type: Boolean,
    default: false,
    description: "Indique si l'utilisateur a personnalisé son programme après la génération automatique"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SportProgram', SportProgramSchema);
