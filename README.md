# Smart Patient Tracker 🏥

A comprehensive healthcare management system for post-operative patient monitoring and recovery tracking with end-to-end encryption.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Smart Patient Tracker is a full-stack healthcare application designed to facilitate seamless communication and data exchange between patients, doctors, and administrators. The system features comprehensive patient monitoring, treatment plan management, and real-time alerts with a strong focus on data security through end-to-end encryption.

**Key Highlights:**
- 🔐 End-to-end AES encryption for all data
- 👥 Role-based access control (RBAC)
- 📊 Real-time patient monitoring and risk assessment
- 💬 Real-time encrypted chat system for patient-doctor communication
- 📈 Analytics dashboard for administrators
- 🔔 Automated alert system for high-risk patients

## ✨ Features

### For Patients
- **Daily Health Check-ins:** Track vital signs (pain level, temperature, medication adherence)
- **Treatment Plan Viewing:** Access assigned treatment plans and schedules
- **Real-time Chat:** Secure, encrypted messaging with assigned doctors
  - Send and receive messages instantly
  - View conversation history
  - End-to-end encryption for all messages
  - Chat with multiple doctors if assigned
- **Profile Management:** Update personal information and preferences
- **Consent Management:** Control data monitoring permissions

### For Doctors
- **Patient Dashboard:** Overview of all patients with risk-based sorting
- **Treatment Plan Management:** Create and manage comprehensive treatment plans
- **Real-time Chat:** Secure communication with patients
  - Respond to patient inquiries instantly
  - Access complete chat history
  - Encrypted messaging for HIPAA compliance
  - Manage conversations with multiple patients
- **Alert System:** Real-time notifications for high-risk patients
- **Patient Details:** Access complete patient history and check-in data
- **Risk Assessment:** Automatic calculation and tracking of patient risk scores

### For Administrators
- **System Dashboard:** Analytics and usage statistics
- **User Management:** CRUD operations for all user roles
- **Audit Logs:** Complete system activity tracking
- **Data Visualization:** Charts and graphs for key metrics

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Hooks
- Material-UI (MUI) for components
- React Router for navigation
- Recharts for data visualization
- Axios for API calls
- CryptoJS for encryption

**Backend:**
- Node.js & Express
- **Architecture:** Controller-Service-Repository (CSR) Pattern
  - **Controllers:** Handle HTTP requests/responses with basic validation
  - **Services:** Contain business logic and orchestrate repositories
  - **Repositories:** Manage all database interactions
  - **Utils:** Reusable helper functions (JWT, validation, date operations)
- MongoDB with Mongoose
- JWT for authentication
- CryptoJS for encryption
- Node-cron for scheduled tasks

**Security:**
- AES encryption for API & storage
- JWT-based authentication
- Role-based access control
- Secure password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-patient-tracker.git
cd smart-patient-tracker
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/smart-patient-tracker
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

Create `.env` file in the `client` directory:
```env
VITE_API_KEY=smart-patient-tracker-api-secret-2025
VITE_STORAGE_KEY=smart-patient-tracker-secure-key-2025
```

5. **Start the application**

Terminal 1 - Start the server:
```bash
cd server
npm start
```

Terminal 2 - Start the client:
```bash
cd client
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Test Users

```javascript
// Patient
Email: patient@test.com
Password: password123

// Doctor
Email: doctor@test.com
Password: password123

// Admin
Email: admin@test.com
Password: password123
```

## 👥 User Roles

### Patient
- **Routes:** `/patient/*`, `/chat`
- **Permissions:** Personal data access, check-ins, real-time chat with doctors
- **Chat Access:** Can initiate and view conversations with assigned doctors only
- **Restrictions:** Cannot access doctor or admin routes

### Doctor
- **Routes:** `/doctor/*`, `/chat`
- **Permissions:** Patient management, treatment plans, alerts, chat with patients
- **Chat Access:** Can view and respond to all patient messages
- **Restrictions:** Cannot access admin routes

### Admin
- **Routes:** `/admin/*`
- **Permissions:** System administration, user management, audit logs
- **Restrictions:** Cannot access patient/doctor specific routes

## 🔐 Security

### Encryption
- **API Encryption:** All requests/responses encrypted with AES
- **Storage Encryption:** LocalStorage data encrypted
- **Encryption Keys:** Configurable via environment variables

### Authentication
- JWT-based token authentication
- Secure password hashing with bcrypt
- Token stored encrypted in localStorage

### Access Control
- Frontend route protection via `ProtectedRoute` component
- Role-based access control (RBAC)
- Automatic redirection for unauthorized access

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - Register new user
POST /api/auth/login    - User login
```

### Patient Endpoints
```
GET  /api/patients      - List all patients (Doctor/Admin)
GET  /api/patients/:id  - Get patient details
```

### Check-in Endpoints
```
POST /api/checkins      - Submit daily check-in
GET  /api/checkins      - Get check-in history
```

### Treatment Endpoints
```
POST /api/treatments              - Create treatment plan
GET  /api/treatments              - Get treatment plans
GET  /api/treatments/:id          - Get specific plan
PUT  /api/treatments/:id/consent  - Update consent
```

### Chat Endpoints
```
GET  /api/chat/conversations     - Get all conversations for user
GET  /api/chat/messages/:userId  - Get messages with specific user
POST /api/chat/messages          - Send a new message
```

### Admin Endpoints
```
GET /api/admin/stats       - System statistics
GET /api/admin/users       - User management
GET /api/admin/audit-logs  - Audit logs
```

## 📁 Project Structure

```
smart-patient-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios configuration
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Route components
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── doctor/    # Doctor pages
│   │   │   ├── patient/   # Patient pages
│   │   │   └── common/    # Shared pages
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── package.json
│
└── server/                # Node.js backend (CSR Pattern)
    ├── controllers/       # HTTP request handlers (thin layer)
    │   ├── AuthController.js
    │   ├── TreatmentController.js
    │   ├── CheckInController.js
    │   ├── AlertController.js
    │   ├── ChatController.js
    │   ├── AdminController.js
    │   ├── ProfileController.js
    │   └── UserController.js
    │
    ├── services/          # Business logic layer
    │   ├── AuthService.js
    │   ├── TreatmentService.js
    │   ├── CheckInService.js
    │   ├── AlertService.js
    │   ├── chatService.js
    │   ├── AdminService.js
    │   ├── ProfileService.js
    │   ├── UserService.js
    │   ├── riskEngine.service.js
    │   └── cron.service.js
    │
    ├── repositories/      # Database interaction layer
    │   ├── UserRepository.js
    │   ├── TreatmentPlanRepository.js
    │   ├── DailyCheckInRepository.js
    │   ├── AlertRepository.js
    │   ├── ConversationRepository.js
    │   ├── MessageRepository.js
    │   ├── PatientProfileRepository.js
    │   ├── AuditLogRepository.js
    │   └── index.js
    │
    ├── utils/             # Helper functions
    │   ├── jwt.util.js           # JWT token operations
    │   ├── date.util.js          # Date utilities
    │   └── validation.util.js    # Input validation
    │
    ├── middleware/        # Custom middleware
    │   ├── auth.js
    │   ├── authorizeRole.js
    │   ├── chatMiddleware.js
    │   ├── encryptionMiddleware.js
    │   └── auditMiddleware.js
    │
    ├── models/           # MongoDB schemas
    │   ├── User.js
    │   ├── TreatmentPlan.js
    │   ├── DailyCheckIn.js
    │   ├── Alert.js
    │   ├── Conversation.js
    │   ├── Message.js
    │   ├── PatientProfile.js
    │   └── AuditLog.js
    │
    ├── routes/           # API route definitions
    │   ├── auth.js
    │   ├── treatments.js
    │   ├── checkins.js
    │   ├── alerts.js
    │   ├── chat.js
    │   ├── admin.js
    │   ├── profile.js
    │   └── users.js
    │
    └── server.js         # Entry point

### Backend Architecture Principles

**Controller-Service-Repository (CSR) Pattern:**

1. **Controllers** (Thin Layer - < 100 lines each)
   - Handle HTTP requests and responses
   - Perform basic shape validation (required fields, types)
   - Delegate to services for business logic
   - **Never** call repositories directly
   - **Never** contain business validation

2. **Services** (Business Logic - < 300 lines each)
   - Contain all business logic and validation
   - Orchestrate multiple repositories when needed
   - Handle authorization checks
   - Enforce business rules
   - Use utility functions for common operations

3. **Repositories** (Data Layer - < 200 lines each)
   - Handle all database interactions (CRUD)
   - Encapsulate Mongoose queries
   - **Never** call other repositories
   - Return plain data (no business logic)

4. **Utils** (Helpers - < 100 lines each)
   - Reusable helper functions
   - JWT operations, date formatting, validation
   - Keep services clean and DRY

**Architecture Rules:**
- ❌ Controllers MUST NOT call repositories directly
- ❌ Repositories MUST NOT call other repositories
- ❌ Business validation belongs in services, not controllers
- ✅ Services orchestrate repositories
- ✅ Controllers only perform basic shape validation

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Patient check-in submission
- [ ] Treatment plan creation
- [ ] Alert system functionality
- [ ] Encryption verification
- [ ] Session management

## 🚧 Known Limitations

- No automated tests (manual testing required)
- Frontend-only RBAC (server-side validation recommended)
- No mobile app (web-only)
- No offline mode
- English language only

## 📈 Future Enhancements

- [ ] Automated testing suite
- [ ] Server-side RBAC validation
- [ ] Mobile application
- [ ] Video consultation feature
- [ ] Document/image upload
- [ ] Multi-language support
- [ ] Two-factor authentication
- [ ] Export functionality for reports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- Dharmesh Menaria - Initial work

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB for the database
- React team for the amazing framework

## 📞 Support

For support, email dharmeshmenaria02@gmail.com or open an issue in the repository.

---

**Production Readiness:** 70% | **Security Score:** 75% | **Feature Completeness:** 85%

Made with ❤️ for better healthcare management
