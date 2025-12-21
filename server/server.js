const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev')); // Logger

// Encryption Middleware (Global)
const encryptionMiddleware = require('./middleware/encryptionMiddleware');
app.use('/api', encryptionMiddleware); // Apply only to /api routes

app.use(require('./middleware/auditMiddleware'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-patient-tracker')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Initialize Cron Service
require('./services/cron.service').initCron();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/test', require('./routes/test'));


app.get('/', (req, res) => {
    res.json({ message: 'Smart Patient Tracker API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Encryption Disabled: ${process.env.DISABLE_ENCRYPTION}`);
});
