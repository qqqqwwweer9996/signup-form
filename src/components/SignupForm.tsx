import { useRef, useState } from 'react';
import { useSignupForm } from '@/hooks/useSignupForm';
import { validateEmail, validateNickname, validatePassword } from '@/utils/validation';
import type { FocusableField, SignupValues } from '@/types/signup';
import { TextField } from './TextField';
import { PasswordField } from './PasswordField';
import { TermsAgreement } from './TermsAgreement';
import { AlertCircleIcon, CheckCircleIcon } from './icons';

/** Mimics a network request so the submit/loading/error flow is observable. */
function fakeSignupRequest(values: SignupValues): Promise<void> {
  return new Promise((resolve) => {
    console.info('[signup] submitting', { ...values, password: '***' });
    setTimeout(resolve, 900);
  });
}

export function SignupForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Refs for every focusable field, so a failed submit can move focus to the
  // first blocking field (a11y: keeps keyboard users oriented). The inputs are
  // always mounted, so their refs are already attached — focus synchronously.
  const fieldRefs = useRef<Partial<Record<FocusableField, HTMLElement | null>>>({});
  const focusField = (name: FocusableField) => {
    fieldRefs.current[name]?.focus();
  };

  const form = useSignupForm({
    onValidSubmit: async (values) => {
      await fakeSignupRequest(values);
      setSubmittedEmail(values.email);
    },
    onInvalidSubmit: focusField,
  });

  const {
    values,
    errors,
    touched,
    isSubmittable,
    isSubmitting,
    submitSucceeded,
    submitError,
    handleTextChange,
    handleTextBlur,
    handleTermsChange,
    toggleAllTerms,
    handleSubmit,
    reset,
  } = form;

  // Field-level "valid" flags drive the success check icon.
  const emailValid = validateEmail(values.email).isValid;
  const passwordValid = validatePassword(values.password).isValid;
  const nicknameValid = validateNickname(values.nickname).isValid;

  const requiredTermsMissing = Boolean(
    (touched.agreeService || touched.agreePrivacy) &&
      !(values.agreeService && values.agreePrivacy),
  );

  if (submitSucceeded && submittedEmail) {
    return (
      <div
        className="animate-scale-in rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-100 sm:p-10"
        role="status"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircleIcon className="h-9 w-9 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">회원가입 완료</h2>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{submittedEmail}</span> 으로
          <br />
          가입이 정상적으로 처리되었습니다.
        </p>
        <button
          type="button"
          onClick={() => {
            // 임베드된 앱에선 이전 페이지로 복귀. 단독 데모처럼 히스토리가
            // 없으면 갈 곳이 없으므로 폼을 초기화해 빈 화면에 갇히지 않게 한다.
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setSubmittedEmail(null);
              reset();
            }
          }}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="animate-scale-in rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">회원가입</h1>
        <p className="mt-1 text-sm text-slate-500">
          몇 가지 정보만 입력하면 바로 시작할 수 있어요.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          ref={(el) => {
            fieldRefs.current.email = el;
          }}
          label="이메일"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          required
          value={values.email}
          error={errors.email}
          isValid={emailValid}
          onChange={(e) => handleTextChange('email', e.target.value)}
          onBlur={() => handleTextBlur('email')}
        />

        <PasswordField
          ref={(el) => {
            fieldRefs.current.password = el;
          }}
          value={values.password}
          error={errors.password}
          isValid={passwordValid}
          onChange={(v) => handleTextChange('password', v)}
          onBlur={() => handleTextBlur('password')}
        />

        <TextField
          ref={(el) => {
            fieldRefs.current.nickname = el;
          }}
          label="닉네임"
          type="text"
          name="nickname"
          autoComplete="nickname"
          placeholder="2~20자, 한글/영문/숫자"
          maxLength={20}
          required
          value={values.nickname}
          error={errors.nickname}
          isValid={nicknameValid}
          onChange={(e) => handleTextChange('nickname', e.target.value)}
          onBlur={() => handleTextBlur('nickname')}
        />

        <TermsAgreement
          values={values}
          showRequiredError={requiredTermsMissing}
          onChange={handleTermsChange}
          onToggleAll={toggleAllTerms}
          registerRequiredRef={(name, el) => {
            fieldRefs.current[name] = el;
          }}
        />

        {submitError ? (
          <div
            role="alert"
            className="flex animate-fade-in items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <span>{submitError}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={!isSubmittable || isSubmitting}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isSubmittable && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-400'
              : 'cursor-not-allowed bg-slate-300 focus-visible:ring-slate-300',
          ].join(' ')}
        >
          {isSubmitting ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              처리 중...
            </>
          ) : (
            '가입하기'
          )}
        </button>

        <p className="text-center text-sm text-slate-400">
          이미 계정이 있으신가요?{' '}
          <a
            href="#login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            로그인
          </a>
        </p>
      </form>
    </div>
  );
}
