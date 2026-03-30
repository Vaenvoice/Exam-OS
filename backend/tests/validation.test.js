const { registerSchema, loginSchema, examSubmitSchema, autosaveSchema } = require('../validation/authSchemas');

describe('Zod Validation Schemas', () => {

  describe('registerSchema', () => {
    it('should validate a correct registration payload', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.email).toBe('test@example.com');
    });

    it('should reject a short username', () => {
      const data = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      // Zod v4 uses issues, check that a too_small error exists
      const usernameIssue = result.error.issues.find(i => i.path.includes('username'));
      expect(usernameIssue).toBeDefined();
    });

    it('should reject an invalid email', () => {
      const data = {
        username: 'testuser',
        email: 'not-an-email',
        password: 'password123',
        role: 'student'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject a short password', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        role: 'student'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      const pwIssue = result.error.issues.find(i => i.path.includes('password'));
      expect(pwIssue).toBeDefined();
    });

    it('should reject admin role registration', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should default role to student when not provided', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.role).toBe('student');
    });

    it('should trim and lowercase email', () => {
      const data = {
        username: 'testuser',
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
        role: 'student'
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.email).toBe('test@example.com');
    });
  });

  describe('loginSchema', () => {
    it('should validate a correct login payload', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const data = { password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const data = { email: 'test@example.com' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'not-valid',
        password: 'password123'
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('examSubmitSchema', () => {
    it('should validate a correct exam submission', () => {
      const data = {
        answers: { 'q1': 'A', 'q2': 'B' }
      };
      const result = examSubmitSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty answers', () => {
      const data = {
        answers: {}
      };
      const result = examSubmitSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept submission with proctoring data', () => {
      const data = {
        answers: { 'q1': 'A' },
        proctoringData: {
          tabSwitches: 2,
          logs: [
            { type: 'TAB_SWITCH', time: '2026-01-01T00:00:00Z', message: 'test' }
          ]
        }
      };
      const result = examSubmitSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('autosaveSchema', () => {
    it('should validate correct autosave payload', () => {
      const data = { answers: { 'q1': 'C' } };
      const result = autosaveSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty answers object', () => {
      const data = { answers: {} };
      const result = autosaveSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

});

describe('Validate Middleware', () => {
  const { validate } = require('../middleware/validate');

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should call next() on valid data', () => {
    const req = { body: { email: 'test@example.com', password: 'password123' } };
    const res = mockRes();
    const next = jest.fn();

    validate(loginSchema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 on invalid data', () => {
    const req = { body: { email: 'not-valid' } };
    const res = mockRes();
    const next = jest.fn();

    validate(loginSchema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      })
    );
  });

  it('should sanitize req.body with parsed data', () => {
    const req = { body: { email: '  USER@TEST.COM  ', password: 'pass123' } };
    const res = mockRes();
    const next = jest.fn();

    validate(loginSchema)(req, res, next);
    expect(req.body.email).toBe('user@test.com');
  });
});
