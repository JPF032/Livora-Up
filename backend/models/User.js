const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  metadata: {
    height: {
      type: Number
    },
    weight: {
      type: Number
    },
    goals: {
      type: String,
      enum: ['perte_poids', 'prise_muscle', 'fitness', 'bien_etre', 'autre'],
    },
    activityLevel: {
      type: String,
      enum: ['sedentaire', 'leger', 'modere', 'actif', 'tres_actif'],
    },
    birthDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Middleware pre-save pour mettre à jour updatedAt à chaque modification
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);
