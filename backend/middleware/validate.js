const { ZodError } = require('zod');

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On validation failure, responds with 400 and structured error messages.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Replace with sanitized data
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    next(err);
  }
};

module.exports = { validate };

