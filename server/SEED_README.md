# Database Seeding Script - Enhanced Edition

## Overview
This comprehensive script populates the database with realistic sample data covering **all features and edge cases** of the Smart Patient Tracker application.

## What Gets Created

### Users
- **1 Admin**: admin@hospital.com
- **3 Doctors**:
  - Dr. Sarah Johnson (sarah.johnson@hospital.com)
  - Dr. Michael Chen (michael.chen@hospital.com)
  - Dr. Emily Rodriguez (emily.rodriguez@hospital.com)
- **10 Patients** with diverse scenarios (see below)

**All passwords**: `password123`

### Patient Scenarios (10 Total)

#### 1. **John Smith** - High-Risk Patient
- **Email**: john.smith@email.com
- **Condition**: Post-operative knee replacement
- **Scenario**: High pain levels, fever incident, active alerts
- **Check-ins**: 15 daily check-ins with varying risk levels
- **Status**: ACTIVE, 15/45 days complete
- **Milestones**: 1 achieved (7-day medication streak)

#### 2. **Emma Wilson** - Improving Patient
- **Email**: emma.wilson@email.com
- **Condition**: Chronic back pain management
- **Scenario**: Steady improvement, multiple milestones achieved
- **Check-ins**: 30 daily check-ins showing decreasing pain trend
- **Status**: ACTIVE, 30/60 days complete
- **Milestones**: 2 achieved (pain target + 14-day streak)

#### 3. **Robert Brown** - Missed Check-Ins
- **Email**: robert.brown@email.com
- **Condition**: Post-surgical appendectomy
- **Scenario**: Only 5 check-ins in 10 days, missed check-in alert
- **Check-ins**: 5 sporadic check-ins
- **Status**: ACTIVE, 10/21 days complete
- **Alerts**: Active missed check-in alert

#### 4. **Lisa Anderson** - Normal Progress
- **Email**: lisa.anderson@email.com
- **Condition**: Sprained ankle recovery
- **Scenario**: Consistent daily check-ins, steady improvement
- **Check-ins**: 7 daily check-ins
- **Status**: ACTIVE, 7/14 days complete

#### 5. **David Martinez** - Completed Treatment
- **Email**: david.martinez@email.com
- **Condition**: Minor fracture recovery
- **Scenario**: Successfully completed treatment with milestones
- **Check-ins**: Historical data (alternate-day frequency)
- **Status**: COMPLETED
- **Milestones**: 2 achieved

#### 6. **Sarah Thompson** - No Consent Signed ⚠️
- **Email**: sarah.thompson@email.com
- **Condition**: Migraine management
- **Scenario**: Treatment plan created but consent not signed
- **Check-ins**: 3 check-ins (limited functionality)
- **Status**: ACTIVE, 3/30 days complete
- **Consent**: NOT SIGNED

#### 7. **Michael Garcia** - CRITICAL Multi-Factor Risk 🚨
- **Email**: michael.garcia@email.com
- **Condition**: Post-operative cardiac surgery
- **Scenario**: Complex medication regimen (5 meds), multiple risk factors, critical alerts
- **Check-ins**: 20 check-ins with escalating symptoms
- **Status**: ACTIVE, 20/90 days complete
- **Alerts**: Active CRITICAL alert (risk score 85)
- **Medications**: 5 different medications

#### 8. **Jennifer Lee** - Medication Non-Compliance
- **Email**: jennifer.lee@email.com
- **Condition**: Diabetes management
- **Scenario**: Pattern of missing medications every 3rd day
- **Check-ins**: 25 check-ins showing non-compliance pattern
- **Status**: ACTIVE, 25/60 days complete
- **Alerts**: Active medication non-compliance alert

#### 9. **William Davis** - Near Completion (Alternate-Day)
- **Email**: william.davis@email.com
- **Condition**: Physical therapy for shoulder injury
- **Scenario**: Almost finished, alternate-day check-in frequency
- **Check-ins**: 13 check-ins (every other day)
- **Status**: ACTIVE, 26/28 days complete
- **Frequency**: ALTERNATE (every other day)
- **Milestones**: 1 achieved

#### 10. **Patricia Moore** - Weekly Check-Ins
- **Email**: patricia.moore@email.com
- **Condition**: Chronic arthritis management
- **Scenario**: Long-term treatment with weekly check-ins
- **Check-ins**: 5 weekly check-ins
- **Status**: ACTIVE, 35/90 days complete
- **Frequency**: WEEKLY
- **Medications**: 3 medications including weekly injection

### Treatment Plans (10)
- **5 ACTIVE** plans with various scenarios
- **1 COMPLETED** plan
- **Check-in frequencies**: DAILY (7), ALTERNATE (2), WEEKLY (1)
- **Consent statuses**: 9 signed, 1 unsigned
- **Medication counts**: 1-5 medications per plan
- **Symptom checklists**: 3-8 symptoms per plan

### Daily Check-ins (100+)
Comprehensive check-in data including:
- **High-risk patterns**: Fever, high pain, multiple symptoms
- **Improvement trends**: Decreasing pain over time
- **Compliance patterns**: Perfect adherence vs. non-compliance
- **Risk levels**: NORMAL, WARNING, CRITICAL
- **Various frequencies**: Daily, alternate-day, weekly

### Alerts (5)
- **3 ACTIVE alerts**:
  - High-risk for John Smith (fever + pain)
  - Missed check-in for Robert Brown
  - CRITICAL for Michael Garcia (cardiac symptoms)
  - Medication non-compliance for Jennifer Lee
- **1 RESOLVED alert**: Historical high-risk for John Smith

### Conversations & Messages (3)
- **John Smith ↔ Dr. Sarah Johnson**: High-risk patient discussion
- **Emma Wilson ↔ Dr. Michael Chen**: Milestone celebrations
- **Michael Garcia ↔ Dr. Michael Chen**: Critical patient urgent care

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

3. **Verify success**: You should see detailed output showing all created data

## Testing Scenarios

### As Admin (admin@hospital.com)
- View system-wide statistics across all doctors and patients
- Monitor all active alerts
- Access admin dashboard with comprehensive metrics

### As Doctor
**Dr. Sarah Johnson** (sarah.johnson@hospital.com):
- 4 patients: John (high-risk), Robert (missed check-ins), Sarah (no consent), William (near completion)
- 2 active alerts
- Mix of daily and alternate-day check-ins

**Dr. Michael Chen** (michael.chen@hospital.com):
- 4 patients: Emma (improving), David (completed), Michael (CRITICAL), Patricia (weekly)
- 1 CRITICAL alert
- All check-in frequencies represented

**Dr. Emily Rodriguez** (emily.rodriguez@hospital.com):
- 2 patients: Lisa (normal), Jennifer (non-compliance)
- 1 active alert
- Medication adherence issues

### As Patient
Test different scenarios:
- **High-risk**: john.smith@email.com
- **Improving**: emma.wilson@email.com
- **Non-compliance**: jennifer.lee@email.com
- **No consent**: sarah.thompson@email.com
- **CRITICAL**: michael.garcia@email.com

## Key Features Demonstrated

### 1. Risk Engine
- **Multi-factor risk calculation**: Pain + fever + medications + symptoms
- **Risk levels**: NORMAL, WARNING, CRITICAL
- **Configurable thresholds**: Different per treatment plan
- **Alert generation**: Automatic alerts for high-risk scores

### 2. Consent Management
- **Signed consent**: 9 patients with full access
- **Unsigned consent**: 1 patient (Sarah Thompson) with limited functionality
- **Consent tracking**: Timestamp and status

### 3. Check-In Frequencies
- **DAILY**: 7 patients with daily monitoring
- **ALTERNATE**: 2 patients with every-other-day check-ins
- **WEEKLY**: 1 patient with weekly check-ins

### 4. Milestones
- **Pain improvement targets**: Achieved by Emma and William
- **Medication streaks**: 7-day, 14-day, 21-day streaks
- **Automatic notifications**: Milestone messages in chat

### 5. Alert System
- **High-risk alerts**: Triggered by risk score thresholds
- **Missed check-in alerts**: Automatic detection
- **Alert statuses**: ACTIVE and RESOLVED
- **Doctor notifications**: Assigned to specific doctors

### 6. Chat System
- **System messages**: Treatment plan initialization
- **User messages**: Doctor-patient communication
- **Alert messages**: Automatic risk notifications
- **Milestone messages**: Achievement celebrations

### 7. Medication Management
- **Simple regimens**: 1-2 medications
- **Complex regimens**: 5 medications (cardiac patient)
- **Adherence tracking**: Medication taken/missed
- **Compliance patterns**: Perfect vs. non-compliant

### 8. Treatment Status
- **ACTIVE**: 9 ongoing treatments
- **COMPLETED**: 1 finished treatment
- **Various durations**: 14 days to 90 days

## Edge Cases Covered

✅ Patient with no consent signed  
✅ Critical patient with multiple risk factors  
✅ Medication non-compliance pattern  
✅ Missed check-ins detection  
✅ Alternate-day check-in frequency  
✅ Weekly check-in frequency  
✅ Near treatment completion  
✅ Completed treatment with milestones  
✅ Complex medication regimens (5+ meds)  
✅ Multiple symptoms (8+ symptoms)  
✅ Escalating health issues  
✅ Improving health trends  
✅ Perfect medication adherence  
✅ Multiple active alerts for same patient  

## Data Statistics

- **Users**: 14 total (1 admin, 3 doctors, 10 patients)
- **Treatment Plans**: 10 (9 active, 1 completed)
- **Daily Check-Ins**: 100+ entries
- **Alerts**: 5 (4 active, 1 resolved)
- **Conversations**: 3 active
- **Messages**: 15+ messages across conversations

## Resetting Data

To clear all data and reseed:
```bash
node seed.js
```

The script automatically clears existing data before seeding.

## Notes

- All timestamps are relative to current date
- Risk scores are calculated based on pain, temperature, medication adherence, and symptoms
- Check-in patterns vary by patient to demonstrate different scenarios
- Conversations include system messages, user messages, alert notifications, and milestone celebrations
- Patient scenarios cover the full spectrum from perfect adherence to critical risk
