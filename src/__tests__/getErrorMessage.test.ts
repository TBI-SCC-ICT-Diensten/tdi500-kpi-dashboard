import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../utils/getErrorMessage';

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

describe('getErrorMessage', () => {
  it('returns the message of an Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the message of a custom Error subclass', () => {
    expect(getErrorMessage(new CustomError('custom boom'))).toBe('custom boom');
  });

  it('returns the message of a plain ApiError-shaped object (regression guard for the original bug)', () => {
    const apiError = { message: 'Hupie proxy not configured on server', statusCode: 500 };
    expect(getErrorMessage(apiError)).toBe('Hupie proxy not configured on server');
  });

  it('falls back for a plain object without a message — never "[object Object]"', () => {
    const result = getErrorMessage({ statusCode: 500 });
    expect(result).toBe('Onbekende fout');
    expect(result).not.toBe('[object Object]');
  });

  it('returns a string error unchanged', () => {
    expect(getErrorMessage('plain string error')).toBe('plain string error');
  });

  it('falls back for null and undefined', () => {
    expect(getErrorMessage(null)).toBe('Onbekende fout');
    expect(getErrorMessage(undefined)).toBe('Onbekende fout');
  });
});
