import { validateCredentials } from '../validation';

describe('validateCredentials', () => {
  const validRegistration = {
    username: 'secret.user',
    email: 'person@example.com',
    password: 'passcode',
    confirmPassword: 'passcode',
    register: true,
  };

  it('accepts valid registration details', () => {
    expect(validateCredentials(validRegistration)).toBe('');
  });

  it('rejects invalid usernames before submission', () => {
    expect(validateCredentials({ ...validRegistration, username: 'not allowed' })).toMatch(/may use/i);
    expect(validateCredentials({ ...validRegistration, username: 'a'.repeat(31) })).toMatch(/30 characters/i);
  });

  it('keeps login validation focused on credentials being present', () => {
    expect(validateCredentials({ username: 'person', password: 'x', register: false })).toBe('');
  });
});
