import { getGUID, getFloatInRange, getIntInRange } from './randomGenerator';

describe('misc.ts', () => {
  test('createGUID', () => {
    expect(getGUID()).toHaveLength(32);
  });

  test('randomFloatInRange', () => {
    expect(getFloatInRange(5, 7)).toBeGreaterThanOrEqual(5);
    expect(getFloatInRange(5, 7)).toBeLessThanOrEqual(8);
  });

  test('randomInt', () => {
    expect(getIntInRange(5, 7)).toBeGreaterThanOrEqual(5);
    expect(getIntInRange(5, 7)).toBeLessThanOrEqual(7);
  });
});
