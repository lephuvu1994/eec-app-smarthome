import { getFieldError } from './form-utils';

describe('getFieldError', () => {
  it('should return undefined when field is not touched', () => {
    const field = {
      state: {
        meta: {
          isTouched: false,
          errors: ['Some error'],
        },
      },
    };
    expect(getFieldError(field)).toBeUndefined();
  });

  it('should return undefined when there are no errors', () => {
    const field = {
      state: {
        meta: {
          isTouched: true,
          errors: [],
        },
      },
    };
    expect(getFieldError(field)).toBeUndefined();
  });

  it('should return undefined when not touched and no errors', () => {
    const field = {
      state: {
        meta: {
          isTouched: false,
          errors: [],
        },
      },
    };
    expect(getFieldError(field)).toBeUndefined();
  });

  it('should return string error directly', () => {
    const field = {
      state: {
        meta: {
          isTouched: true,
          errors: ['Email is required'],
        },
      },
    };
    expect(getFieldError(field)).toBe('Email is required');
  });

  it('should return first error when multiple string errors exist', () => {
    const field = {
      state: {
        meta: {
          isTouched: true,
          errors: ['First error', 'Second error'],
        },
      },
    };
    expect(getFieldError(field)).toBe('First error');
  });

  it('should extract message from Zod-style object error', () => {
    const field = {
      state: {
        meta: {
          isTouched: true,
          errors: [{ message: 'Invalid email format' }],
        },
      },
    };
    expect(getFieldError(field)).toBe('Invalid email format');
  });

  it('should convert non-string non-object error to string as fallback', () => {
    const field = {
      state: {
        meta: {
          isTouched: true,
          errors: [42],
        },
      },
    };
    expect(getFieldError(field)).toBe('42');
  });

  it('should handle object error with numeric message', () => {
    const field = {
      state: {
        meta: {
          isTouched: true,
          errors: [{ message: 123 }],
        },
      },
    };
    expect(getFieldError(field)).toBe('123');
  });
});
