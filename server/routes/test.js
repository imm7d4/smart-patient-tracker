const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TreatmentPlan = require('../models/TreatmentPlan');
const DailyCheckIn = require('../models/DailyCheckIn');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Alert = require('../models/Alert');
const _bcrypt = require('bcryptjs');

// Only allow in TEST or DEV mode?
// Middleware to block in production could be good, but for now we assume non-prod.

// @route   POST /api/test/seed
// @desc    Clear DB and Seed Users/Plans
router.post('/seed', async (req, res) => {
  try {
    // 1. Clear Database
    await User.deleteMany({});
    await TreatmentPlan.deleteMany({});
    await DailyCheckIn.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await Alert.deleteMany({});

    // 2. Create Standard Users
    // NOTE: Password hashing happens in User model pre-save unless we insertMany without hooks.
    // Using create() triggers hooks.

    const patientRaw = {name: 'Test Patient', email: 'patient@test.com', password: 'Password@123', role: 'PATIENT'};
    const doctorRaw = {name: 'Test Doctor', email: 'doctor@test.com', password: 'Password@123', role: 'DOCTOR'};
    const adminRaw = {name: 'Test Admin', email: 'admin@test.com', password: 'Password@123', role: 'ADMIN'};

    const patient = await User.create(patientRaw);
    const doctor = await User.create(doctorRaw);
    const _admin = await User.create(adminRaw);

    // 3. Optional: Create Active Plan if requested
    let plan = null;
    if (req.body.createPlan) {
      plan = await TreatmentPlan.create({
        patientId: patient._id,
        doctorId: doctor._id,
        diagnosis: 'Chronic Back Pain',
        startDate: new Date(),
        expectedDays: 30,
        medications: [{name: 'Ibuprofen', dosage: '400mg', frequency: '2x Daily'}],
        symptomChecklist: ['Numbness', 'Sharp Pain'],
        status: 'ACTIVE',
        // Feature: Configurable Risk Rules (Defaults applied by schema)
      });
    }

    res.json({
      success: true,
      data: {
        patientId: patient._id,
        doctorId: doctor._id,
        planId: plan ? plan._id : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: error.message});
  }
});

// @route POST /api/test/trigger-cron
// @desc Force run cron logic with simulated date
router.post('/trigger-cron', async (req, res) => {
  try {
    const {simulatedDate} = req.body;
    const cronService = require('../services/cron.service');

    // We need to modify cronService to accept a date Override if we want to be pure.
    // Or for this POC, we just run it and assume it uses process time?
    // Wait, if we can't mock server time, this is hard.
    // Quick Hack: Temporarily mock Date field? Dangerous.
    // Better: Update CheckMissedCheckins to take an optional 'now' argument.

    await cronService.checkMissedCheckins(new Date(simulatedDate));

    res.json({success: true, message: 'Cron triggered'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
});

module.exports = router;
