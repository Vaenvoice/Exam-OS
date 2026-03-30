const { AuditLog } = require('../models');

/**
 * Log a sensitive action to the AuditLog
 * @param {Object} req - Express request object
 * @param {String} action - Action name (e.g., 'EXAM_CREATED')
 * @param {String} entityType - Type of entity (e.g., 'Exam')
 * @param {String} entityId - ID of the entity
 * @param {Object} details - Additional details
 */
exports.logAction = async (req, action, entityType = null, entityId = null, details = {}) => {
  try {
    await AuditLog.create({
      userId: req.user ? req.user.id : null,
      username: req.user ? req.user.username : 'anonymous',
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (err) {
    console.error('Failed to create audit log:', err.message);
  }
};
