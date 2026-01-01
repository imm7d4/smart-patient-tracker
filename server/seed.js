require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const TreatmentPlan = require('./models/TreatmentPlan');
const DailyCheckIn = require('./models/DailyCheckIn');
const Alert = require('./models/Alert');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Helper to hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Helper to get date offset
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const seedDatabase = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await TreatmentPlan.deleteMany({});
        await DailyCheckIn.deleteMany({});
        await Alert.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});

        // Create Users
        console.log('Creating users...');
        const hashedPassword = await hashPassword('password123');

        // Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@hospital.com',
            password: hashedPassword,
            role: 'ADMIN',
        });

        // Doctors
        const doctors = await User.insertMany([
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@hospital.com',
                password: hashedPassword,
                role: 'DOCTOR',
            },
            {
                name: 'Dr. Michael Chen',
                email: 'michael.chen@hospital.com',
                password: hashedPassword,
                role: 'DOCTOR',
            },
            {
                name: 'Dr. Emily Rodriguez',
                email: 'emily.rodriguez@hospital.com',
                password: hashedPassword,
                role: 'DOCTOR',
            },
        ]);

        // Patients
        const patients = await User.insertMany([
            { name: 'John Smith', email: 'john.smith@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Emma Wilson', email: 'emma.wilson@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Robert Brown', email: 'robert.brown@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Lisa Anderson', email: 'lisa.anderson@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'David Martinez', email: 'david.martinez@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Sarah Thompson', email: 'sarah.thompson@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Michael Garcia', email: 'michael.garcia@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Jennifer Lee', email: 'jennifer.lee@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'William Davis', email: 'william.davis@email.com', password: hashedPassword, role: 'PATIENT' },
            { name: 'Patricia Moore', email: 'patricia.moore@email.com', password: hashedPassword, role: 'PATIENT' },
        ]);

        console.log(`Created ${doctors.length} doctors and ${patients.length} patients`);

        // Create Treatment Plans
        console.log('Creating treatment plans...');
        const treatmentPlans = [];

        // Plan 1: High-risk patient (John Smith)
        const plan1 = await TreatmentPlan.create({
            patientId: patients[0]._id,
            doctorId: doctors[0]._id,
            diagnosis: 'Post-operative knee replacement recovery',
            startDate: daysAgo(15),
            expectedDays: 45,
            medications: [
                { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily' },
                { name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed' },
            ],
            symptomChecklist: ['Swelling', 'Pain', 'Redness', 'Limited mobility'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(15) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 7, medicationPenalty: 10 },
            checkInFrequency: 'DAILY',
            milestones: [{ type: 'MEDICATION_STREAK', achievedAt: daysAgo(5), metaData: { days: 7 } }],
        });
        treatmentPlans.push(plan1);

        // Plan 2: Improving patient (Emma Wilson)
        const plan2 = await TreatmentPlan.create({
            patientId: patients[1]._id,
            doctorId: doctors[1]._id,
            diagnosis: 'Chronic back pain management',
            startDate: daysAgo(30),
            expectedDays: 60,
            medications: [
                { name: 'Naproxen', dosage: '250mg', frequency: 'Twice daily' },
                { name: 'Muscle relaxant', dosage: '10mg', frequency: 'Before bed' },
            ],
            symptomChecklist: ['Back pain', 'Muscle stiffness', 'Headache'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(30) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 6, medicationPenalty: 15 },
            checkInFrequency: 'DAILY',
            milestones: [
                { type: 'PAIN_TARGET_MET', achievedAt: daysAgo(10), metaData: { improvement: 35 } },
                { type: 'MEDICATION_STREAK', achievedAt: daysAgo(3), metaData: { days: 14 } },
            ],
        });
        treatmentPlans.push(plan2);

        // Plan 3: Missed check-ins (Robert Brown)
        const plan3 = await TreatmentPlan.create({
            patientId: patients[2]._id,
            doctorId: doctors[0]._id,
            diagnosis: 'Post-surgical appendectomy recovery',
            startDate: daysAgo(10),
            expectedDays: 21,
            medications: [
                { name: 'Antibiotics', dosage: '500mg', frequency: 'Three times daily' },
                { name: 'Pain reliever', dosage: '200mg', frequency: 'As needed' },
            ],
            symptomChecklist: ['Abdominal pain', 'Fever', 'Nausea'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(10) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 7, medicationPenalty: 10 },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan3);

        // Plan 4: Normal progress (Lisa Anderson)
        const plan4 = await TreatmentPlan.create({
            patientId: patients[3]._id,
            doctorId: doctors[2]._id,
            diagnosis: 'Sprained ankle recovery',
            startDate: daysAgo(7),
            expectedDays: 14,
            medications: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily' }],
            symptomChecklist: ['Swelling', 'Pain', 'Bruising'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(7) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 6, medicationPenalty: 10 },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan4);

        // Plan 5: Completed treatment (David Martinez)
        const plan5 = await TreatmentPlan.create({
            patientId: patients[4]._id,
            doctorId: doctors[1]._id,
            diagnosis: 'Minor fracture recovery',
            startDate: daysAgo(45),
            expectedDays: 30,
            medications: [{ name: 'Calcium supplement', dosage: '500mg', frequency: 'Daily' }],
            symptomChecklist: ['Pain', 'Swelling'],
            status: 'COMPLETED',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(45) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 5, medicationPenalty: 10 },
            checkInFrequency: 'ALTERNATE',
            milestones: [
                { type: 'PAIN_TARGET_MET', achievedAt: daysAgo(20), metaData: { improvement: 50 } },
                { type: 'MEDICATION_STREAK', achievedAt: daysAgo(15), metaData: { days: 21 } },
            ],
        });
        treatmentPlans.push(plan5);

        // Plan 6: No consent signed (Sarah Thompson)
        const plan6 = await TreatmentPlan.create({
            patientId: patients[5]._id,
            doctorId: doctors[0]._id,
            diagnosis: 'Migraine management',
            startDate: daysAgo(3),
            expectedDays: 30,
            medications: [
                { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed' },
                { name: 'Preventive medication', dosage: '25mg', frequency: 'Daily' },
            ],
            symptomChecklist: ['Headache', 'Nausea', 'Light sensitivity', 'Dizziness'],
            status: 'ACTIVE',
            consent: { monitoring: false, messaging: false, signedAt: null },
            riskConfig: { feverThreshold: 100.4, painThreshold: 8, medicationPenalty: 15 },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan6);

        // Plan 7: Critical multi-factor risk (Michael Garcia)
        const plan7 = await TreatmentPlan.create({
            patientId: patients[6]._id,
            doctorId: doctors[1]._id,
            diagnosis: 'Post-operative cardiac surgery recovery',
            startDate: daysAgo(20),
            expectedDays: 90,
            medications: [
                { name: 'Beta blocker', dosage: '25mg', frequency: 'Twice daily' },
                { name: 'Blood thinner', dosage: '5mg', frequency: 'Daily' },
                { name: 'Statin', dosage: '40mg', frequency: 'Before bed' },
                { name: 'ACE inhibitor', dosage: '10mg', frequency: 'Daily' },
                { name: 'Aspirin', dosage: '81mg', frequency: 'Daily' },
            ],
            symptomChecklist: ['Chest pain', 'Shortness of breath', 'Irregular heartbeat', 'Swelling', 'Fatigue', 'Dizziness', 'Nausea', 'Excessive bleeding'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(20) },
            riskConfig: { feverThreshold: 99.5, painThreshold: 5, medicationPenalty: 20 },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan7);

        // Plan 8: Medication non-compliance (Jennifer Lee)
        const plan8 = await TreatmentPlan.create({
            patientId: patients[7]._id,
            doctorId: doctors[2]._id,
            diagnosis: 'Diabetes management',
            startDate: daysAgo(25),
            expectedDays: 60,
            medications: [
                { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
                { name: 'Insulin', dosage: '10 units', frequency: 'Before meals' },
            ],
            symptomChecklist: ['Fatigue', 'Increased thirst', 'Frequent urination', 'Blurred vision'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(25) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 7, medicationPenalty: 25 },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan8);

        // Plan 9: Near completion, alternate-day (William Davis)
        const plan9 = await TreatmentPlan.create({
            patientId: patients[8]._id,
            doctorId: doctors[0]._id,
            diagnosis: 'Physical therapy for shoulder injury',
            startDate: daysAgo(26),
            expectedDays: 28,
            medications: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' }],
            symptomChecklist: ['Shoulder pain', 'Limited range of motion', 'Stiffness'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(26) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 6, medicationPenalty: 10 },
            checkInFrequency: 'ALTERNATE',
            milestones: [{ type: 'PAIN_TARGET_MET', achievedAt: daysAgo(8), metaData: { improvement: 40 } }],
        });
        treatmentPlans.push(plan9);

        // Plan 10: Weekly check-in (Patricia Moore)
        const plan10 = await TreatmentPlan.create({
            patientId: patients[9]._id,
            doctorId: doctors[1]._id,
            diagnosis: 'Chronic arthritis management',
            startDate: daysAgo(35),
            expectedDays: 90,
            medications: [
                { name: 'Methotrexate', dosage: '15mg', frequency: 'Weekly' },
                { name: 'Folic acid', dosage: '1mg', frequency: 'Daily' },
                { name: 'Naproxen', dosage: '500mg', frequency: 'Twice daily' },
            ],
            symptomChecklist: ['Joint pain', 'Stiffness', 'Swelling', 'Fatigue'],
            status: 'ACTIVE',
            consent: { monitoring: true, messaging: true, signedAt: daysAgo(35) },
            riskConfig: { feverThreshold: 100.4, painThreshold: 7, medicationPenalty: 15 },
            checkInFrequency: 'WEEKLY',
            milestones: [{ type: 'MEDICATION_STREAK', achievedAt: daysAgo(14), metaData: { days: 21 } }],
        });
        treatmentPlans.push(plan10);

        console.log(`Created ${treatmentPlans.length} treatment plans`);

        // Create Daily Check-ins
        console.log('Creating daily check-ins...');
        const checkIns = [];

        // John Smith (High-risk) - 15 days
        for (let i = 15; i >= 1; i--) {
            const painLevel = i > 10 ? 8 : i > 5 ? 6 : 4;
            const temp = i === 3 ? 101.2 : 98.6;
            const medsTaken = i !== 7;
            const riskScore = painLevel * 5 + (temp > 100.4 ? 20 : 0) + (!medsTaken ? 10 : 0);
            checkIns.push({
                patientId: patients[0]._id,
                date: daysAgo(i),
                painLevel,
                temperature: temp,
                medicationsTaken: medsTaken,
                symptoms: painLevel > 7 ? ['Swelling', 'Pain'] : painLevel > 5 ? ['Pain'] : [],
                notes: i === 3 ? 'Experiencing increased pain and slight fever' : '',
                riskScore,
                riskLevel: riskScore > 50 ? 'CRITICAL' : riskScore > 30 ? 'WARNING' : 'NORMAL',
                riskReasons: [...(painLevel > 7 ? ['High pain level'] : []), ...(temp > 100.4 ? ['Fever detected'] : []), ...(!medsTaken ? ['Missed medication'] : [])],
            });
        }

        // Emma Wilson (Improving) - 30 days
        for (let i = 30; i >= 1; i--) {
            const painLevel = Math.max(2, Math.floor(8 - (i / 5)));
            checkIns.push({
                patientId: patients[1]._id,
                date: daysAgo(i),
                painLevel,
                temperature: 98.6,
                medicationsTaken: true,
                symptoms: painLevel > 5 ? ['Back pain', 'Muscle stiffness'] : painLevel > 3 ? ['Back pain'] : [],
                notes: i === 10 ? 'Feeling much better, pain decreasing' : '',
                riskScore: painLevel * 5,
                riskLevel: painLevel * 5 > 30 ? 'WARNING' : 'NORMAL',
                riskReasons: painLevel > 6 ? ['Moderate pain level'] : [],
            });
        }

        // Robert Brown (Missed check-ins) - Only 5 in 10 days
        [10, 8, 6, 3, 1].forEach((i) => {
            checkIns.push({
                patientId: patients[2]._id,
                date: daysAgo(i),
                painLevel: 5,
                temperature: 98.6,
                medicationsTaken: true,
                symptoms: ['Abdominal pain'],
                notes: '',
                riskScore: 25,
                riskLevel: 'NORMAL',
                riskReasons: [],
            });
        });

        // Lisa Anderson (Normal) - 7 days
        for (let i = 7; i >= 1; i--) {
            const painLevel = Math.max(2, 6 - i);
            checkIns.push({
                patientId: patients[3]._id,
                date: daysAgo(i),
                painLevel,
                temperature: 98.6,
                medicationsTaken: true,
                symptoms: painLevel > 4 ? ['Swelling', 'Pain'] : ['Swelling'],
                notes: '',
                riskScore: painLevel * 5,
                riskLevel: 'NORMAL',
                riskReasons: [],
            });
        }

        // Sarah Thompson (No consent) - 3 days
        for (let i = 3; i >= 1; i--) {
            checkIns.push({
                patientId: patients[5]._id,
                date: daysAgo(i),
                painLevel: 7,
                temperature: 98.6,
                medicationsTaken: true,
                symptoms: ['Headache', 'Nausea'],
                notes: '',
                riskScore: 35,
                riskLevel: 'WARNING',
                riskReasons: ['Moderate pain level'],
            });
        }

        // Michael Garcia (Critical) - 20 days with escalating issues
        for (let i = 20; i >= 1; i--) {
            const painLevel = i < 5 ? 8 : i < 10 ? 6 : 4;
            const temp = i < 5 ? 100.8 : 98.6;
            const medsTaken = i !== 12 && i !== 8;
            const symptoms = [];
            if (painLevel > 6) symptoms.push('Chest pain');
            if (i < 7) symptoms.push('Shortness of breath');
            if (!medsTaken) symptoms.push('Irregular heartbeat');

            const riskScore = painLevel * 5 + (temp > 99.5 ? 25 : 0) + (!medsTaken ? 20 : 0) + (symptoms.length > 2 ? 15 : 0);
            checkIns.push({
                patientId: patients[6]._id,
                date: daysAgo(i),
                painLevel,
                temperature: temp,
                medicationsTaken: medsTaken,
                symptoms,
                notes: i === 3 ? 'Experiencing chest discomfort and breathing difficulty' : '',
                riskScore,
                riskLevel: riskScore > 60 ? 'CRITICAL' : riskScore > 40 ? 'WARNING' : 'NORMAL',
                riskReasons: [...(painLevel > 6 ? ['High pain level'] : []), ...(temp > 99.5 ? ['Fever detected'] : []), ...(!medsTaken ? ['Missed medication'] : []), ...(symptoms.length > 2 ? ['Multiple severe symptoms'] : [])],
            });
        }

        // Jennifer Lee (Non-compliance) - 25 days with pattern
        for (let i = 25; i >= 1; i--) {
            const medsTaken = i % 3 !== 0; // Misses every 3rd day
            const painLevel = medsTaken ? 4 : 6;
            checkIns.push({
                patientId: patients[7]._id,
                date: daysAgo(i),
                painLevel,
                temperature: 98.6,
                medicationsTaken: medsTaken,
                symptoms: !medsTaken ? ['Fatigue', 'Increased thirst'] : ['Fatigue'],
                notes: '',
                riskScore: painLevel * 5 + (!medsTaken ? 25 : 0),
                riskLevel: !medsTaken ? 'WARNING' : 'NORMAL',
                riskReasons: !medsTaken ? ['Missed medication'] : [],
            });
        }

        // William Davis (Alternate-day, near completion) - 13 check-ins in 26 days
        for (let i = 26; i >= 1; i -= 2) {
            const painLevel = Math.max(2, 7 - Math.floor(i / 4));
            checkIns.push({
                patientId: patients[8]._id,
                date: daysAgo(i),
                painLevel,
                temperature: 98.6,
                medicationsTaken: true,
                symptoms: painLevel > 4 ? ['Shoulder pain', 'Stiffness'] : ['Stiffness'],
                notes: i === 2 ? 'Almost fully recovered!' : '',
                riskScore: painLevel * 5,
                riskLevel: 'NORMAL',
                riskReasons: [],
            });
        }

        // Patricia Moore (Weekly) - 5 check-ins in 35 days
        [35, 28, 21, 14, 7].forEach((i) => {
            checkIns.push({
                patientId: patients[9]._id,
                date: daysAgo(i),
                painLevel: 5,
                temperature: 98.6,
                medicationsTaken: true,
                symptoms: ['Joint pain', 'Stiffness'],
                notes: '',
                riskScore: 25,
                riskLevel: 'NORMAL',
                riskReasons: [],
            });
        });

        await DailyCheckIn.insertMany(checkIns);
        console.log(`Created ${checkIns.length} daily check-ins`);

        // Create Alerts
        console.log('Creating alerts...');
        const alerts = [];

        // High-risk alert for John Smith
        alerts.push({
            patientId: patients[0]._id,
            doctorId: doctors[0]._id,
            type: 'RISK_HIGH',
            message: 'Patient John Smith has high risk score (61) - High pain level, Fever detected',
            isRead: false,
            riskScore: 61,
            status: 'ACTIVE',
            createdAt: daysAgo(3),
        });

        // Missed check-in alert for Robert Brown
        alerts.push({
            patientId: patients[2]._id,
            doctorId: doctors[0]._id,
            type: 'MISSED_CHECKIN',
            message: 'Patient Robert Brown has missed daily check-in for 2 consecutive days',
            isRead: false,
            status: 'ACTIVE',
            createdAt: daysAgo(1),
        });

        // Critical alert for Michael Garcia
        alerts.push({
            patientId: patients[6]._id,
            doctorId: doctors[1]._id,
            type: 'RISK_HIGH',
            message: 'CRITICAL: Patient Michael Garcia has very high risk score (85) - Chest pain, Fever, Multiple severe symptoms',
            isRead: false,
            riskScore: 85,
            status: 'ACTIVE',
            createdAt: daysAgo(2),
        });

        // Medication non-compliance alert for Jennifer Lee
        alerts.push({
            patientId: patients[7]._id,
            doctorId: doctors[2]._id,
            type: 'RISK_HIGH',
            message: 'Patient Jennifer Lee showing medication non-compliance pattern - Missed 8 doses in last 25 days',
            isRead: false,
            riskScore: 55,
            status: 'ACTIVE',
            createdAt: daysAgo(1),
        });

        // Resolved alert for John Smith
        alerts.push({
            patientId: patients[0]._id,
            doctorId: doctors[0]._id,
            type: 'RISK_HIGH',
            message: 'Patient John Smith had high risk score (55) - High pain level, Missed medication',
            isRead: true,
            riskScore: 55,
            status: 'RESOLVED',
            createdAt: daysAgo(7),
        });

        await Alert.insertMany(alerts);
        console.log(`Created ${alerts.length} alerts`);

        // Create Conversations and Messages
        console.log('Creating conversations and messages...');

        // Conversation 1: John Smith & Dr. Sarah Johnson
        const conv1 = await Conversation.create({
            participants: [patients[0]._id, doctors[0]._id],
            treatmentPlanId: plan1._id,
            isActive: true,
            lastMessageAt: daysAgo(1),
            lastMessageContent: 'Thank you doctor, I will follow your advice.',
            lastMessageSender: patients[0]._id,
            lastMessageType: 'USER',
        });

        await Message.insertMany([
            { conversationId: conv1._id, sender: null, content: 'Secure chat initialized for this treatment plan.', type: 'SYSTEM', createdAt: daysAgo(15) },
            { conversationId: conv1._id, sender: doctors[0]._id, content: 'Hello John, how are you feeling today? I see your pain levels have been high.', type: 'USER', createdAt: daysAgo(3) },
            { conversationId: conv1._id, sender: patients[0]._id, content: 'Hi Dr. Johnson, I\'m experiencing more pain than usual and had a slight fever yesterday.', type: 'USER', createdAt: daysAgo(3) },
            { conversationId: conv1._id, sender: doctors[0]._id, content: 'I understand. Let\'s monitor this closely. Make sure you\'re taking your medications on time and rest as much as possible. If the fever persists, please contact me immediately.', type: 'USER', createdAt: daysAgo(2) },
            { conversationId: conv1._id, sender: patients[0]._id, content: 'Thank you doctor, I will follow your advice.', type: 'USER', createdAt: daysAgo(1) },
        ]);

        // Conversation 2: Emma Wilson & Dr. Michael Chen
        const conv2 = await Conversation.create({
            participants: [patients[1]._id, doctors[1]._id],
            treatmentPlanId: plan2._id,
            isActive: true,
            lastMessageAt: daysAgo(2),
            lastMessageContent: 'Great progress! Keep up the good work.',
            lastMessageSender: doctors[1]._id,
            lastMessageType: 'USER',
        });

        await Message.insertMany([
            { conversationId: conv2._id, sender: null, content: 'Secure chat initialized for this treatment plan.', type: 'SYSTEM', createdAt: daysAgo(30) },
            { conversationId: conv2._id, sender: null, content: 'Milestone achieved: Pain improvement target met (35% improvement)', type: 'MILESTONE', createdAt: daysAgo(10) },
            { conversationId: conv2._id, sender: patients[1]._id, content: 'Dr. Chen, I\'m feeling much better! My back pain has reduced significantly.', type: 'USER', createdAt: daysAgo(5) },
            { conversationId: conv2._id, sender: doctors[1]._id, content: 'That\'s wonderful news Emma! Your consistent medication adherence is paying off.', type: 'USER', createdAt: daysAgo(4) },
            { conversationId: conv2._id, sender: null, content: 'Milestone achieved: 14-day medication streak', type: 'MILESTONE', createdAt: daysAgo(3) },
            { conversationId: conv2._id, sender: doctors[1]._id, content: 'Great progress! Keep up the good work.', type: 'USER', createdAt: daysAgo(2) },
        ]);

        // Conversation 3: Michael Garcia & Dr. Michael Chen (Critical patient)
        const conv3 = await Conversation.create({
            participants: [patients[6]._id, doctors[1]._id],
            treatmentPlanId: plan7._id,
            isActive: true,
            lastMessageAt: daysAgo(1),
            lastMessageContent: 'Please come to the clinic immediately if symptoms worsen.',
            lastMessageSender: doctors[1]._id,
            lastMessageType: 'USER',
        });

        await Message.insertMany([
            { conversationId: conv3._id, sender: null, content: 'Secure chat initialized for this treatment plan.', type: 'SYSTEM', createdAt: daysAgo(20) },
            { conversationId: conv3._id, sender: null, content: 'ALERT: High risk score detected - Chest pain, Fever, Multiple severe symptoms', type: 'ALERT', createdAt: daysAgo(2) },
            { conversationId: conv3._id, sender: patients[6]._id, content: 'Doctor, I\'m having chest discomfort and finding it hard to breathe.', type: 'USER', createdAt: daysAgo(2) },
            { conversationId: conv3._id, sender: doctors[1]._id, content: 'Michael, this is concerning. Are you taking all your medications as prescribed? Any swelling in your legs?', type: 'USER', createdAt: daysAgo(2) },
            { conversationId: conv3._id, sender: patients[6]._id, content: 'Yes, taking all meds. Some swelling in ankles.', type: 'USER', createdAt: daysAgo(1) },
            { conversationId: conv3._id, sender: doctors[1]._id, content: 'Please come to the clinic immediately if symptoms worsen.', type: 'USER', createdAt: daysAgo(1) },
        ]);

        console.log('Created conversations and messages');

        console.log('\n=== Database Seeding Complete! ===\n');
        console.log('Login Credentials (All passwords: password123)\n');
        console.log('ADMIN:');
        console.log('  admin@hospital.com\n');
        console.log('DOCTORS:');
        console.log('  sarah.johnson@hospital.com');
        console.log('  michael.chen@hospital.com');
        console.log('  emily.rodriguez@hospital.com\n');
        console.log('PATIENTS:');
        console.log('  john.smith@email.com - High-risk with fever');
        console.log('  emma.wilson@email.com - Improving with milestones');
        console.log('  robert.brown@email.com - Missed check-ins');
        console.log('  lisa.anderson@email.com - Normal progress');
        console.log('  david.martinez@email.com - Completed treatment');
        console.log('  sarah.thompson@email.com - No consent signed');
        console.log('  michael.garcia@email.com - CRITICAL cardiac patient');
        console.log('  jennifer.lee@email.com - Medication non-compliance');
        console.log('  william.davis@email.com - Near completion (alternate-day)');
        console.log('  patricia.moore@email.com - Weekly check-ins\n');
        console.log('STATISTICS:');
        console.log(`  ${patients.length} patients`);
        console.log(`  ${treatmentPlans.length} treatment plans`);
        console.log(`  ${checkIns.length} daily check-ins`);
        console.log(`  ${alerts.length} alerts`);
        console.log('  3 active conversations\n');
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed
connectDB().then(() => seedDatabase());
