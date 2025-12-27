// Central export for all repositories
const UserRepository = require('./UserRepository');
const TreatmentPlanRepository = require('./TreatmentPlanRepository');
const DailyCheckInRepository = require('./DailyCheckInRepository');
const AlertRepository = require('./AlertRepository');
const ConversationRepository = require('./ConversationRepository');
const MessageRepository = require('./MessageRepository');
const PatientProfileRepository = require('./PatientProfileRepository');
const AuditLogRepository = require('./AuditLogRepository');

module.exports = {
  UserRepository,
  TreatmentPlanRepository,
  DailyCheckInRepository,
  AlertRepository,
  ConversationRepository,
  MessageRepository,
  PatientProfileRepository,
  AuditLogRepository,
};
