import { describe, it, expect } from 'vitest';
import { amountInWords } from './amount-in-words';

describe('amountInWords (Indian numbering)', () => {
  it('handles zero', () => {
    expect(amountInWords(0)).toBe('Rupees Zero Only');
  });

  it('handles small amounts', () => {
    expect(amountInWords(5)).toBe('Rupees Five Only');
    expect(amountInWords(19)).toBe('Rupees Nineteen Only');
    expect(amountInWords(20)).toBe('Rupees Twenty Only');
    expect(amountInWords(99)).toBe('Rupees Ninety Nine Only');
  });

  it('handles hundreds and thousands', () => {
    expect(amountInWords(100)).toBe('Rupees One Hundred Only');
    expect(amountInWords(1234)).toBe('Rupees One Thousand Two Hundred Thirty Four Only');
  });

  it('uses lakh and crore', () => {
    expect(amountInWords(123456)).toBe(
      'Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six Only',
    );
    expect(amountInWords(10000000)).toBe('Rupees One Crore Only');
  });

  it('includes paise', () => {
    expect(amountInWords(47412.5)).toBe(
      'Rupees Forty Seven Thousand Four Hundred Twelve and Fifty Paise Only',
    );
    expect(amountInWords(0.99)).toBe('Rupees Zero and Ninety Nine Paise Only');
  });

  it('rounds to 2 decimals', () => {
    expect(amountInWords(1.005)).toBe('Rupees One and One Paise Only');
  });
});
