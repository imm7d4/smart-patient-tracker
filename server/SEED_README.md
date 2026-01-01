# Database Seeding Script

## Overview
This script populates the database with realistic sample data to demonstrate all features and scenarios of the Smart Patient Tracker application.

## What Gets Created

### Users
- **1 Admin**: admin@hospital.com
- **3 Doctors**:
  - Dr. Sarah Johnson (sarah.johnson@hospital.com)
  - Dr. Michael Chen (michael.chen@hospital.com)
  - Dr. Emily Rodriguez (emily.rodriguez@hospital.com)
- **5 Patients**:
  - John Smith (john.smith@email.com) - High-risk patient
  - Emma Wilson (emma.wilson@email.com) - Improving patient with milestones
  - Robert Brown (robert.brown@email.com) - Patient with missed check-ins
  - Lisa Anderson (lisa.anderson@email.com) - Normal progress
  - David Martinez (david.martinez@email.com) - Completed treatment

**All passwords**: `password123`

### Treatment Plans (5)
1. **Active - High Risk**: John Smith with Dr. Sarah Johnson
   - Post-operative knee replacement
   - 15 days into 45-day plan
   - High pain levels, fever incident
   - 1 milestone achieved

2. **Active - Improving**: Emma Wilson with Dr. Michael Chen
   - Chronic back pain management
   - 30 days into 60-day plan
   - Decreasing pain levels
   - 2 milestones achieved

3. **Active - Missed Check-ins**: Robert Brown with Dr. Sarah Johnson
   - Post-surgical appendectomy
   - 10 days into 21-day plan
   - Only 5 check-ins submitted

4. **Active - Normal**: Lisa Anderson with Dr. Emily Rodriguez
   - Sprained ankle recovery
   - 7 days into 14-day plan
   - Steady improvement

5. **Completed**: David Martinez with Dr. Michael Chen
   - Minor fracture recovery
   - Completed 30-day plan
   - 2 milestones achieved

### Daily Check-ins (60+)
- John Smith: 15 check-ins with varying risk levels
- Emma Wilson: 30 check-ins showing improvement trend
- Robert Brown: 5 check-ins (demonstrating missed check-ins)
- Lisa Anderson: 7 check-ins with normal progress

### Alerts (3)
- Active high-risk alert for John Smith (fever + high pain)
- Active missed check-in alert for Robert Brown
- Resolved high-risk alert for John Smith (historical)

### Conversations & Messages
- John Smith ↔ Dr. Sarah Johnson: Discussion about high pain and fever
- Emma Wilson ↔ Dr. Michael Chen: Celebrating milestones and progress
- Lisa Anderson ↔ Dr. Emily Rodriguez: Recovery guidance

## How to Run

### Prerequisites
- MongoDB must be running
- `.env` file must be configured with `MONGO_URI`

### Steps

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Run the seed script**:
   ```bash
   node seed.js
   ```

3. **Verify success**: You should see output showing:
   - Number of users created
   - Number of treatment plans created
   - Number of check-ins created
   - Number of alerts created
   - Login credentials for all users

## Testing Scenarios

### As Admin (admin@hospital.com)
- View system-wide statistics
- Monitor all doctors and patients
- Access admin dashboard

### As Doctor (e.g., sarah.johnson@hospital.com)
- View assigned patients
- Check alerts (high-risk and missed check-ins)
- Review patient check-in history
- Chat with patients
- Create new treatment plans
- Monitor risk scores

### As Patient (e.g., john.smith@email.com)
- Submit daily check-ins
- View treatment plan details
- Chat with doctor
- See milestones achieved
- Review check-in history

## Key Features Demonstrated

1. **Risk Engine**: John Smith shows high-risk scenarios
2. **Milestones**: Emma Wilson and David Martinez have achieved milestones
3. **Missed Check-ins**: Robert Brown demonstrates alert system
4. **Chat System**: Multiple conversations with different message types
5. **Treatment Progress**: Various stages from active to completed
6. **Consent Management**: All active plans have signed consent
7. **Medication Tracking**: Adherence and missed medication scenarios

## Resetting Data

To clear all data and reseed:
```bash
node seed.js
```

The script automatically clears existing data before seeding.

## Notes

- All timestamps are relative to current date
- Risk scores are calculated based on pain levels, temperature, and medication adherence
- Check-in patterns vary by patient to demonstrate different scenarios
- Conversations include system messages, user messages, and milestone notifications
