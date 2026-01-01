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
            {
                name: 'John Smith',
                email: 'john.smith@email.com',
                password: hashedPassword,
                role: 'PATIENT',
            },
            {
                name: 'Emma Wilson',
                email: 'emma.wilson@email.com',
                password: hashedPassword,
                role: 'PATIENT',
            },
            {
                name: 'Robert Brown',
                email: 'robert.brown@email.com',
                password: hashedPassword,
                role: 'PATIENT',
            },
            {
                name: 'Lisa Anderson',
                email: 'lisa.anderson@email.com',
                password: hashedPassword,
                role: 'PATIENT',
            },
            {
                name: 'David Martinez',
                email: 'david.martinez@email.com',
                password: hashedPassword,
                role: 'PATIENT',
            },
        ]);

        console.log(`Created ${doctors.length} doctors and ${patients.length} patients`);

        // Create Treatment Plans
        console.log('Creating treatment plans...');
        const treatmentPlans = [];

        // Plan 1: Active plan with high-risk patient (John Smith - Dr. Sarah Johnson)
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
            consent: {
                monitoring: true,
                messaging: true,
                signedAt: daysAgo(15),
            },
            riskConfig: {
                feverThreshold: 100.4,
                painThreshold: 7,
                medicationPenalty: 10,
            },
            checkInFrequency: 'DAILY',
            milestoneConfig: {
                painImprovementTarget: 30,
                medicationStreakDays: 7,
            },
            milestones: [
                {
                    type: 'MEDICATION_STREAK',
                    achievedAt: daysAgo(5),
                    metaData: { days: 7 },
                },
            ],
        });
        treatmentPlans.push(plan1);

        // Plan 2: Active plan with improving patient (Emma Wilson - Dr. Michael Chen)
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
            consent: {
                monitoring: true,
                messaging: true,
                signedAt: daysAgo(30),
            },
            riskConfig: {
                feverThreshold: 100.4,
                painThreshold: 6,
                medicationPenalty: 15,
            },
            checkInFrequency: 'DAILY',
            milestones: [
                {
                    type: 'PAIN_TARGET_MET',
                    achievedAt: daysAgo(10),
                    metaData: { improvement: 35 },
                },
                {
                    type: 'MEDICATION_STREAK',
                    achievedAt: daysAgo(3),
                    metaData: { days: 14 },
                },
            ],
        });
        treatmentPlans.push(plan2);

        // Plan 3: Active plan with missed check-ins (Robert Brown - Dr. Sarah Johnson)
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
            consent: {
                monitoring: true,
                messaging: true,
                signedAt: daysAgo(10),
            },
            riskConfig: {
                feverThreshold: 100.4,
                painThreshold: 7,
                medicationPenalty: 10,
            },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan3);

        // Plan 4: Active plan with normal progress (Lisa Anderson - Dr. Emily Rodriguez)
        const plan4 = await TreatmentPlan.create({
            patientId: patients[3]._id,
            doctorId: doctors[2]._id,
            diagnosis: 'Sprained ankle recovery',
            startDate: daysAgo(7),
            expectedDays: 14,
            medications: [
                { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily' },
            ],
            symptomChecklist: ['Swelling', 'Pain', 'Bruising'],
            status: 'ACTIVE',
            consent: {
                monitoring: true,
                messaging: true,
                signedAt: daysAgo(7),
            },
            riskConfig: {
                feverThreshold: 100.4,
                painThreshold: 6,
                medicationPenalty: 10,
            },
            checkInFrequency: 'DAILY',
        });
        treatmentPlans.push(plan4);

        // Plan 5: Completed plan (David Martinez - Dr. Michael Chen)
        const plan5 = await TreatmentPlan.create({
            patientId: patients[4]._id,
            doctorId: doctors[1]._id,
            diagnosis: 'Minor fracture recovery',
            startDate: daysAgo(45),
            expectedDays: 30,
            medications: [
                { name: 'Calcium supplement', dosage: '500mg', frequency: 'Daily' },
            ],
            symptomChecklist: ['Pain', 'Swelling'],
            status: 'COMPLETED',
            consent: {
                monitoring: true,
                messaging: true,
                signedAt: daysAgo(45),
            },
            riskConfig: {
                feverThreshold: 100.4,
                painThreshold: 5,
                medicationPenalty: 10,
            },
            checkInFrequency: 'ALTERNATE',
            milestones: [
                {
                    type: 'PAIN_TARGET_MET',
                    achievedAt: daysAgo(20),
                    metaData: { improvement: 50 },
                },
                {
                    type: 'MEDICATION_STREAK',
                    achievedAt: daysAgo(15),
                    metaData: { days: 21 },
                },
            ],
        });
        treatmentPlans.push(plan5);

        console.log(`Created ${treatmentPlans.length} treatment plans`);

        // Create Daily Check-ins
        console.log('Creating daily check-ins...');
        const checkIns = [];

        // John Smith (High-risk patient) - Last 15 days
        for (let i = 15; i >= 1; i--) {
            const painLevel = i > 10 ? 8 : i > 5 ? 6 : 4;
            const temp = i === 3 ? 101.2 : 98.6;
            const medsTaken = i !== 7;
            const riskScore = painLevel * 5 + (temp > 100.4 ? 20 : 0) + (!medsTaken ? 10 : 0);
            const riskLevel = riskScore > 50 ? 'CRITICAL' : riskScore > 30 ? 'WARNING' : 'NORMAL';

            checkIns.push({
                patientId: patients[0]._id,
                date: daysAgo(i),
                painLevel,
                temperature: temp,
                medicationsTaken: medsTaken,
                symptoms: painLevel > 7 ? ['Swelling', 'Pain'] : painLevel > 5 ? ['Pain'] : [],
                notes: i === 3 ? 'Experiencing increased pain and slight fever' : '',
                riskScore,
                riskLevel,
                riskReasons: [
                    ...(painLevel > 7 ? ['High pain level'] : []),
                    ...(temp > 100.4 ? ['Fever detected'] : []),
                    ...(!medsTaken ? ['Missed medication'] : []),
                ],
            });
        }

        // Emma Wilson (Improving patient) - Last 30 days
        for (let i = 30; i >= 1; i--) {
            const painLevel = Math.max(2, Math.floor(8 - (i / 5)));
            const temp = 98.6;
            const medsTaken = true;
            const riskScore = painLevel * 5;
            const riskLevel = riskScore > 30 ? 'WARNING' : 'NORMAL';

            checkIns.push({
                patientId: patients[1]._id,
                date: daysAgo(i),
                painLevel,
                temperature: temp,
                medicationsTaken: medsTaken,
                symptoms: painLevel > 5 ? ['Back pain', 'Muscle stiffness'] : painLevel > 3 ? ['Back pain'] : [],
                notes: i === 10 ? 'Feeling much better, pain decreasing' : '',
                riskScore,
                riskLevel,
                riskReasons: painLevel > 6 ? ['Moderate pain level'] : [],
            });
        }

        // Robert Brown (Missed check-ins) - Only 5 check-ins in last 10 days
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

        // Lisa Anderson (Normal progress) - Last 7 days
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

        // Resolved high-risk alert for John Smith
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
            {
                conversationId: conv1._id,
                sender: null,
                content: 'Secure chat initialized for this treatment plan.',
                type: 'SYSTEM',
                createdAt: daysAgo(15),
            },
            {
                conversationId: conv1._id,
                sender: doctors[0]._id,
                content: 'Hello John, how are you feeling today? I see your pain levels have been high.',
                type: 'USER',
                createdAt: daysAgo(3),
            },
            {
                conversationId: conv1._id,
                sender: patients[0]._id,
                content: 'Hi Dr. Johnson, I\'m experiencing more pain than usual and had a slight fever yesterday.',
                type: 'USER',
                createdAt: daysAgo(3),
            },
            {
                conversationId: conv1._id,
                sender: doctors[0]._id,
                content: 'I understand. Let\'s monitor this closely. Make sure you\'re taking your medications on time and rest as much as possible. If the fever persists, please contact me immediately.',
                type: 'USER',
                createdAt: daysAgo(2),
            },
            {
                conversationId: conv1._id,
                sender: patients[0]._id,
                content: 'Thank you doctor, I will follow your advice.',
                type: 'USER',
                createdAt: daysAgo(1),
            },
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
            {
                conversationId: conv2._id,
                sender: null,
                content: 'Secure chat initialized for this treatment plan.',
                type: 'SYSTEM',
                createdAt: daysAgo(30),
            },
            {
                conversationId: conv2._id,
                sender: null,
                content: 'Milestone achieved: Pain improvement target met (35% improvement)',
                type: 'MILESTONE',
                createdAt: daysAgo(10),
            },
            {
                conversationId: conv2._id,
                sender: patients[1]._id,
                content: 'Dr. Chen, I\'m feeling much better! My back pain has reduced significantly.',
                type: 'USER',
                createdAt: daysAgo(5),
            },
            {
                conversationId: conv2._id,
                sender: doctors[1]._id,
                content: 'That\'s wonderful news Emma! Your consistent medication adherence is paying off.',
                type: 'USER',
                createdAt: daysAgo(4),
            },
            {
                conversationId: conv2._id,
                sender: null,
                content: 'Milestone achieved: 14-day medication streak',
                type: 'MILESTONE',
                createdAt: daysAgo(3),
            },
            {
                conversationId: conv2._id,
                sender: doctors[1]._id,
                content: 'Great progress! Keep up the good work.',
                type: 'USER',
                createdAt: daysAgo(2),
            },
        ]);

        // Conversation 3: Lisa Anderson & Dr. Emily Rodriguez
        const conv3 = await Conversation.create({
            participants: [patients[3]._id, doctors[2]._id],
            treatmentPlanId: plan4._id,
            isActive: true,
            lastMessageAt: daysAgo(1),
            lastMessageContent: 'The swelling should continue to decrease. Keep icing it regularly.',
            lastMessageSender: doctors[2]._id,
            lastMessageType: 'USER',
        });

        await Message.insertMany([
            {
                conversationId: conv3._id,
                sender: null,
                content: 'Secure chat initialized for this treatment plan.',
                type: 'SYSTEM',
                createdAt: daysAgo(7),
            },
            {
                conversationId: conv3._id,
                sender: patients[3]._id,
                content: 'Hello Dr. Rodriguez, when can I start walking normally again?',
                type: 'USER',
                createdAt: daysAgo(2),
            },
            {
                conversationId: conv3._id,
                sender: doctors[2]._id,
                content: 'Hi Lisa, you should start with gentle weight-bearing exercises. The swelling should continue to decrease. Keep icing it regularly.',
                type: 'USER',
                createdAt: daysAgo(1),
            },
        ]);

        console.log('Created conversations and messages');

        console.log('\\n=== Database Seeding Complete! ===\\n');
        console.log('Login Credentials:');
        console.log('\\nAdmin:');
        console.log('  Email: admin@hospital.com');
        console.log('  Password: password123');
        console.log('\\nDoctors:');
        console.log('  Email: sarah.johnson@hospital.com | Password: password123');
        console.log('  Email: michael.chen@hospital.com | Password: password123');
        console.log('  Email: emily.rodriguez@hospital.com | Password: password123');
        console.log('\\nPatients:');
        console.log('  Email: john.smith@email.com | Password: password123 (High-risk)');
        console.log('  Email: emma.wilson@email.com | Password: password123 (Improving)');
        console.log('  Email: robert.brown@email.com | Password: password123 (Missed check-ins)');
        console.log('  Email: lisa.anderson@email.com | Password: password123 (Normal)');
        console.log('  Email: david.martinez@email.com | Password: password123 (Completed treatment)');
        console.log('\\n=================================\\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed
connectDB().then(() => seedDatabase());
