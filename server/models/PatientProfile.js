const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Basic Info
  basicInfo: {
    fullName: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    gender: {type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true},
    bloodGroup: {type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']},
    phoneNumber: {type: String, required: true},
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
  },
  // Emergency Contact
  emergencyContact: {
    name: {type: String, required: true},
    relationship: {type: String, required: true},
    phoneNumber: {type: String, required: true},
  },
  // Medical History
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    pastSurgeries: [String],
    smokingStatus: {type: String, enum: ['Never', 'Former', 'Current']},
    alcoholConsumption: {type: String, enum: ['None', 'Occasional', 'Regular']},
  },
  // Vitals
  vitals: {
    heightCm: Number,
    weightKg: Number,
    normalBodyTemp: Number,
    normalBPRange: String, // e.g. "120/80"
  },
  // Lifestyle
  lifestyle: {
    activityLevel: {type: String, enum: ['Low', 'Moderate', 'High']},
    dietPreference: {type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Mixed']},
    sleepHoursAvg: Number,
    occupationType: {type: String, enum: ['Sedentary', 'Active', 'Heavy']},
  },
  // Consent
  consent: {
    dataSharing: {type: Boolean, default: false},
    notificationPreference: {type: String, enum: ['Email', 'SMS', 'In-App'], default: 'In-App'},
    preferredLanguage: {type: String, default: 'English'},
    caregiverAccess: {type: Boolean, default: false},
  },
}, {timestamps: true});

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
