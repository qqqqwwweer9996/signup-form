import { describe, expect, it } from 'vitest';
import {
  getFirstInvalidField,
  getPasswordStrength,
  isFormSubmittable,
  validateEmail,
  validateNickname,
  validatePassword,
  PASSWORD_MIN_LENGTH,
} from './validation';
import type { SignupValues } from '@/types/signup';

const validValues: SignupValues = {
  email: 'tester@example.com',
  password: 'StrongPw1!',
  nickname: '테스터',
  agreeService: true,
  agreePrivacy: true,
  agreeMarketing: false,
};

describe('validateEmail (RFC 5322 기반)', () => {
  it.each([
    'simple@example.com',
    'very.common@example.com',
    'x@example.com',
    'user.name+tag@sub.example.co.kr',
    "disposable.style.email.with+symbol@example.com",
    'other.email-with-hyphen@example.com',
    "user_name@example.io",
  ])('accepts valid address: %s', (email) => {
    expect(validateEmail(email).isValid).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['no @', 'plainaddress'],
    ['no domain', 'user@'],
    ['no local part', '@example.com'],
    ['double dot domain', 'user@example..com'],
    ['space inside', 'user name@example.com'],
    ['no TLD', 'user@example'],
    ['trailing dot label', 'user@example.com.'],
  ])('rejects %s', (_label, email) => {
    expect(validateEmail(email).isValid).toBe(false);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateEmail('  tester@example.com  ').isValid).toBe(true);
  });

  it('returns a helpful message for an invalid address', () => {
    const result = validateEmail('nope');
    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/이메일/);
  });
});

describe('validatePassword (최소 8자)', () => {
  it('rejects an empty password', () => {
    expect(validatePassword('').isValid).toBe(false);
  });

  it(`rejects a password shorter than ${PASSWORD_MIN_LENGTH} chars`, () => {
    expect(validatePassword('a'.repeat(PASSWORD_MIN_LENGTH - 1)).isValid).toBe(false);
  });

  it(`accepts a password of exactly ${PASSWORD_MIN_LENGTH} chars`, () => {
    expect(validatePassword('a'.repeat(PASSWORD_MIN_LENGTH)).isValid).toBe(true);
  });

  it('rejects a password longer than the max length', () => {
    expect(validatePassword('a'.repeat(65)).isValid).toBe(false);
  });
});

describe('validateNickname', () => {
  it('rejects empty and too-short values', () => {
    expect(validateNickname('').isValid).toBe(false);
    expect(validateNickname('a').isValid).toBe(false);
  });

  it('accepts Korean, latin, digits and underscore', () => {
    expect(validateNickname('테스터').isValid).toBe(true);
    expect(validateNickname('user_01').isValid).toBe(true);
  });

  it('rejects values with spaces or special characters', () => {
    expect(validateNickname('bad name').isValid).toBe(false);
    expect(validateNickname('nick!').isValid).toBe(false);
  });

  it('rejects values longer than 20 chars', () => {
    expect(validateNickname('a'.repeat(21)).isValid).toBe(false);
  });
});

describe('getPasswordStrength', () => {
  it('reports empty for no input', () => {
    expect(getPasswordStrength('').level).toBe('empty');
  });

  it('reports weak for a short password', () => {
    expect(getPasswordStrength('abc').level).toBe('weak');
  });

  it('scores a long mixed password as strong', () => {
    const result = getPasswordStrength('Str0ng!Passw0rd');
    expect(result.score).toBe(4);
    expect(result.level).toBe('strong');
  });
});

describe('getFirstInvalidField / isFormSubmittable', () => {
  it('returns null and submittable when everything is valid', () => {
    expect(getFirstInvalidField(validValues)).toBeNull();
    expect(isFormSubmittable(validValues)).toBe(true);
  });

  it('reports fields in tab order', () => {
    expect(getFirstInvalidField({ ...validValues, email: 'bad' })).toBe('email');
    expect(getFirstInvalidField({ ...validValues, password: 'short' })).toBe(
      'password',
    );
    expect(getFirstInvalidField({ ...validValues, nickname: '' })).toBe('nickname');
    expect(getFirstInvalidField({ ...validValues, agreeService: false })).toBe(
      'agreeService',
    );
    expect(getFirstInvalidField({ ...validValues, agreePrivacy: false })).toBe(
      'agreePrivacy',
    );
  });

  it('ignores the optional marketing checkbox', () => {
    expect(isFormSubmittable({ ...validValues, agreeMarketing: false })).toBe(true);
  });
});
