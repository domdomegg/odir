import { describe, test, expect } from 'vitest';
import * as format from './format';

describe('boolean', () => {
  test.each([
    [true, 'Yes'],
    [false, 'No'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.boolean(value)).toEqual(expected);
  });
});

describe('date', () => {
  test.each([
    [0, '01/01/1970'],
    [1632959999, '29/09/2021'],
    [1632960000, '30/09/2021'],
    [-86400, '31/12/1969'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.date(value)).toEqual(expected);
  });
});

describe('percent', () => {
  test.each([
    [0, '0%'],
    [50, '50%'],
    [100, '100%'],
    [200, '200%'],
    [123, '123%'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.percent(value)).toEqual(expected);
  });
});

describe('timestamp', () => {
  test.each([
    [0, '01/01/1970, 00:00:00'],
    [123456, '02/01/1970, 10:17:36'],
    [1632959999, '29/09/2021, 23:59:59'],
    [1632960000, '30/09/2021, 00:00:00'],
    [-86400, '31/12/1969, 00:00:00'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.timestamp(value)).toEqual(expected);
  });
});

describe('json', () => {
  test.each([
    [0, '0'],
    ['hello', '"hello"'],
    [true, 'true'],
    [{ p: 'v' }, '{"p":"v"}'],
    [undefined, 'undefined'],
    [null, 'null'],
  ])('%s → %s', (value, expected) => {
    expect(format.json(value)).toEqual(expected);
  });
});
