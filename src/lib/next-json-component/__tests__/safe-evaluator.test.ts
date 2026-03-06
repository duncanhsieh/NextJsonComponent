/**
 * safe-evaluator.test.ts
 *
 * Tests for the lightweight sandboxed expression evaluator.
 */

import { describe, it, expect } from 'vitest';
import { safeEval, SafeEvalError } from '../safe-evaluator';

// Base context for most tests
const ctx = {
  state: { count: 5, user: 'Alice', show: true, items: [1, 2, 3] },
  props: { id: 42, label: 'Submit' },
};

describe('safeEval — literals', () => {
  it('evaluates number literals', () => {
    expect(safeEval('42', {})).toBe(42);
    expect(safeEval('3.14', {})).toBe(3.14);
  });

  it('evaluates string literals (single quotes)', () => {
    expect(safeEval("'hello'", {})).toBe('hello');
  });

  it('evaluates string literals (double quotes)', () => {
    expect(safeEval('"world"', {})).toBe('world');
  });

  it('evaluates boolean literals', () => {
    expect(safeEval('true', {})).toBe(true);
    expect(safeEval('false', {})).toBe(false);
  });

  it('evaluates null and undefined', () => {
    expect(safeEval('null', {})).toBe(null);
    expect(safeEval('undefined', {})).toBe(undefined);
  });
});

describe('safeEval — identifiers & member access', () => {
  it('resolves top-level identifiers from context', () => {
    expect(safeEval('state', ctx)).toBe(ctx.state);
  });

  it('resolves nested member access', () => {
    expect(safeEval('state.count', ctx)).toBe(5);
    expect(safeEval('state.user', ctx)).toBe('Alice');
  });

  it('resolves dynamic bracket access', () => {
    expect(safeEval("state['count']", ctx)).toBe(5);
  });

  it('resolves props', () => {
    expect(safeEval('props.id', ctx)).toBe(42);
    expect(safeEval('props.label', ctx)).toBe('Submit');
  });
});

describe('safeEval — arithmetic & string concatenation', () => {
  it('adds numbers', () => {
    expect(safeEval('state.count + 1', ctx)).toBe(6);
  });

  it('subtracts numbers', () => {
    expect(safeEval('state.count - 2', ctx)).toBe(3);
  });

  it('multiplies numbers', () => {
    expect(safeEval('state.count * 3', ctx)).toBe(15);
  });

  it('concatenates strings', () => {
    // In our evaluator + with strings coerces via number addition
    // so we keep string concat as JS natural + behavior
    expect(safeEval("'Hello, ' + state.user", ctx)).toBe('Hello, Alice');
  });
});

describe('safeEval — comparisons', () => {
  it('evaluates strict equality', () => {
    expect(safeEval('state.count === 5', ctx)).toBe(true);
    expect(safeEval('state.count === 6', ctx)).toBe(false);
  });

  it('evaluates inequality', () => {
    expect(safeEval('state.count !== 5', ctx)).toBe(false);
    expect(safeEval('state.count !== 6', ctx)).toBe(true);
  });

  it('evaluates greater/less than', () => {
    expect(safeEval('state.count > 3', ctx)).toBe(true);
    expect(safeEval('state.count < 3', ctx)).toBe(false);
  });
});

describe('safeEval — logical operators', () => {
  it('evaluates &&', () => {
    expect(safeEval('state.show && state.count > 0', ctx)).toBeTruthy();
    expect(safeEval('false && state.count > 0', ctx)).toBeFalsy();
  });

  it('evaluates ||', () => {
    expect(safeEval('false || state.count > 0', ctx)).toBeTruthy();
  });

  it('evaluates !', () => {
    expect(safeEval('!state.show', ctx)).toBe(false);
    expect(safeEval('!false', ctx)).toBe(true);
  });
});

describe('safeEval — ternary operator', () => {
  it('returns consequent when condition is truthy', () => {
    expect(safeEval("state.show ? 'visible' : 'hidden'", ctx)).toBe('visible');
  });

  it('returns alternate when condition is falsy', () => {
    expect(safeEval("false ? 'yes' : 'no'", ctx)).toBe('no');
  });

  it('supports nested ternary', () => {
    expect(safeEval('state.count > 10 ? 1 : state.count > 3 ? 2 : 3', ctx)).toBe(2);
  });
});

describe('safeEval — security: blocked identifiers', () => {
  it('blocks window access', () => {
    expect(() => safeEval('window', {})).toThrow(SafeEvalError);
  });

  it('blocks document access', () => {
    expect(() => safeEval('document', {})).toThrow(SafeEvalError);
  });

  it('blocks globalThis access', () => {
    expect(() => safeEval('globalThis', {})).toThrow(SafeEvalError);
  });

  it('blocks eval access', () => {
    expect(() => safeEval('eval', {})).toThrow(SafeEvalError);
  });

  it('blocks Function access', () => {
    expect(() => safeEval('Function', {})).toThrow(SafeEvalError);
  });

  it('blocks constructor access', () => {
    expect(() => safeEval('state.constructor', ctx)).toThrow(SafeEvalError);
  });

  it('blocks __proto__ access', () => {
    expect(() => safeEval('state.__proto__', ctx)).toThrow(SafeEvalError);
  });

  it('blocks prototype access', () => {
    expect(() => safeEval('state.prototype', ctx)).toThrow(SafeEvalError);
  });

  it('blocks localStorage access', () => {
    expect(() => safeEval('localStorage', {})).toThrow(SafeEvalError);
  });

  it('blocks fetch access', () => {
    expect(() => safeEval('fetch', {})).toThrow(SafeEvalError);
  });
});

describe('safeEval — grouping', () => {
  it('respects parentheses for grouping', () => {
    expect(safeEval('(state.count + 2) * 3', ctx)).toBe(21);
  });
});
