import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useSignupForm, type UseSignupFormOptions } from './useSignupForm';

afterEach(cleanup);

/** Minimal stand-in for a real form submit event. */
const submitEvent = {
  preventDefault: () => {},
} as unknown as React.FormEvent<HTMLFormElement>;

function setup(options: UseSignupFormOptions = {}) {
  return renderHook(() => useSignupForm(options));
}

/** Drives the hook into a fully valid, submittable state. */
function fillValid(result: ReturnType<typeof setup>['result']) {
  act(() => {
    result.current.handleTextChange('email', 'tester@example.com');
    result.current.handleTextChange('password', 'StrongPw1!');
    result.current.handleTextChange('nickname', '테스터');
  });
  act(() => {
    result.current.handleTermsChange('agreeService', true);
    result.current.handleTermsChange('agreePrivacy', true);
  });
}

describe('useSignupForm — real-time validation gating', () => {
  it('does not surface an error until the field is blurred', () => {
    const { result } = setup();

    act(() => result.current.handleTextChange('email', 'invalid'));
    expect(result.current.errors.email).toBeUndefined();

    act(() => result.current.handleTextBlur('email'));
    expect(result.current.errors.email).toMatch(/이메일/);
  });

  it('clears the error in real time once the value becomes valid', () => {
    const { result } = setup();

    act(() => {
      result.current.handleTextChange('email', 'invalid');
      result.current.handleTextBlur('email');
    });
    expect(result.current.errors.email).toBeDefined();

    act(() => result.current.handleTextChange('email', 'tester@example.com'));
    expect(result.current.errors.email).toBeUndefined();
  });
});

describe('useSignupForm — submittability', () => {
  it('is not submittable until required terms are checked', () => {
    const { result } = setup();

    act(() => {
      result.current.handleTextChange('email', 'tester@example.com');
      result.current.handleTextChange('password', 'StrongPw1!');
      result.current.handleTextChange('nickname', '테스터');
    });
    expect(result.current.isSubmittable).toBe(false);

    act(() => {
      result.current.handleTermsChange('agreeService', true);
      result.current.handleTermsChange('agreePrivacy', true);
    });
    expect(result.current.isSubmittable).toBe(true);
  });

  it('toggleAllTerms flips every checkbox at once', () => {
    const { result } = setup();
    act(() => result.current.toggleAllTerms(true));
    expect(result.current.values.agreeService).toBe(true);
    expect(result.current.values.agreePrivacy).toBe(true);
    expect(result.current.values.agreeMarketing).toBe(true);
  });
});

describe('useSignupForm — submit lifecycle', () => {
  it('calls onValidSubmit and marks success on a valid submit', async () => {
    const onValidSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = setup({ onValidSubmit });
    fillValid(result);

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(onValidSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.submitSucceeded).toBe(true);
    expect(result.current.submitError).toBeNull();
  });

  it('surfaces submitError when onValidSubmit rejects', async () => {
    const onValidSubmit = vi.fn().mockRejectedValue(new Error('서버 점검 중입니다.'));
    const { result } = setup({ onValidSubmit });
    fillValid(result);

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.submitSucceeded).toBe(false);
    expect(result.current.submitError).toBe('서버 점검 중입니다.');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('reports the first invalid field on an invalid submit', async () => {
    const onInvalidSubmit = vi.fn();
    const onValidSubmit = vi.fn();
    const { result } = setup({ onValidSubmit, onInvalidSubmit });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(onValidSubmit).not.toHaveBeenCalled();
    expect(onInvalidSubmit).toHaveBeenCalledWith('email');
  });
});
