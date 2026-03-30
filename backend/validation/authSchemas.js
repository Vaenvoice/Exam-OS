const { z } = require('zod');

const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters'),
  role: z
    .enum(['student', 'teacher'], {
      errorMap: () => ({ message: 'Role must be either student or teacher' })
    })
    .default('student')
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

const examSubmitSchema = z.object({
  answers: z
    .record(z.string(), z.string())
    .refine(val => Object.keys(val).length > 0, {
      message: 'At least one answer must be provided'
    }),
  proctoringData: z.object({
    tabSwitches: z.number().optional(),
    logs: z.array(z.object({
      type: z.string(),
      time: z.string(),
      message: z.string().optional()
    })).optional()
  }).optional()
});

const autosaveSchema = z.object({
  answers: z.record(z.string(), z.string())
});

module.exports = {
  registerSchema,
  loginSchema,
  examSubmitSchema,
  autosaveSchema
};
