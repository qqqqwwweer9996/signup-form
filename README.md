# 회원가입 폼 (React 18 + TypeScript)

실시간 유효성 검증, 비밀번호 시인성 토글, 약관 동의 분리를 갖춘 접근성(a11y) 친화적 회원가입 폼 컴포넌트입니다. **Vite + React 18 + TypeScript + Tailwind CSS**로 구현했습니다.

---

## 요구사항

> React 18 + TypeScript 기반 회원가입 폼 컴포넌트 개발. 필수 입력 필드: 이메일, 비밀번호, 닉네임. 실시간 유효성 검증(이메일 형식 RFC 5322, 비밀번호 최소 8자 이상), 비밀번호 시인성 토글, 필수/선택 약관 동의 체크박스 분리. Tailwind CSS 반응형 모던 UI. 접근성(a11y) 고려 필수.

| 요구사항 | 구현 |
| --- | --- |
| React 18 + TypeScript 기반 | Vite + React 18.3 + TypeScript strict |
| 이메일 · 비밀번호 · 닉네임 입력 |  3개 필수 필드 |
| 실시간 유효성 검증 (이메일 형식, 비밀번호 최소 8자) | 입력 즉시 검증 · RFC 5322 이메일 · 비밀번호 8자 이상 |
| 비밀번호 표시/숨기기 토글 |  `aria-pressed` 토글 버튼 |
| 약관 동의 체크박스 (필수/선택 분리) | 전체 동의 + 필수 2 / 선택 1 |
| Tailwind CSS 모던 디자인 |  모바일 우선 반응형, 그라데이션 배경 |
| 접근성 (a11y) | 라벨 연결, `aria-invalid`, live region, 오류 필드 자동 포커스 |

> 보너스: 비밀번호 강도 미터, 약관 펼쳐보기 패널, 제출 실패 배너, Vitest 단위 테스트 38개.

---

##  기술 스택

- **React 18.3** — `createRoot`, `StrictMode`
- **TypeScript 5.6** — `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- **Vite 5** — 개발 서버 & 번들링
- **Tailwind CSS 3.4** — 유틸리티 우선 스타일링
- **Vitest 2 + Testing Library** — 검증 로직·폼 훅 단위 테스트
- **ESLint 9** (flat config) — typescript-eslint + react-hooks

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 단위 테스트 (38개)
npm test

# 린트 / 타입 체크
npm run lint
npm run typecheck
```

---

## 프로젝트 구조

```
src/
├── main.tsx                  # 엔트리 (createRoot + StrictMode)
├── App.tsx                   # 레이아웃 + 배경
├── index.css                 # Tailwind 디렉티브 + base 스타일
├── types/
│   └── signup.ts             # 폼 값/에러/약관 도메인 타입
├── utils/
│   ├── validation.ts         # RFC5322 이메일·비밀번호·닉네임 검증, 강도 계산
│   └── validation.test.ts    # 검증 로직 단위 테스트
├── hooks/
│   ├── useSignupForm.ts       # 폼 상태 + 실시간 검증 + 제출 라이프사이클
│   └── useSignupForm.test.ts  # 훅 단위 테스트 (게이팅/제출/실패)
└── components/
    ├── SignupForm.tsx        # 폼 조립 + 제출/실패/성공 + 오류 포커스
    ├── TextField.tsx         # 접근성 라벨 입력 (forwardRef, 재사용)
    ├── PasswordField.tsx     # 비밀번호 입력 + 토글 + 강도 미터
    ├── PasswordStrengthMeter.tsx
    ├── TermsAgreement.tsx    # 약관 동의 (전체/필수/선택 + 펼쳐보기)
    ├── Checkbox.tsx          # 접근성 커스텀 체크박스
    ├── FieldError.tsx        # aria-live 에러 메시지
    └── icons.tsx             # 인라인 SVG 아이콘
```

---

##  구현 포인트

### 1. 실시간 유효성 검증
- `useSignupForm` 훅이 **모든 키 입력마다** 값을 검증합니다.
- 에러 메시지는 해당 필드를 한 번 **벗어난(blur)** 뒤부터 노출되어, 첫 입력 중 불필요한 경고를 피합니다.
- 제출 시도 시 모든 미입력/오류 필드의 메시지를 즉시 노출합니다.

### 2. RFC 5322 이메일 검증
- `utils/validation.ts`의 `EMAIL_RFC5322` 정규식이 local-part의 특수문자(`! # $ % & ' * + / = ? ^ _ \` { | } ~`)와 도메인 라벨/TLD를 검증합니다.
- 전체 길이는 RFC 5321 상한(254자)으로 제한합니다.

### 3. TypeScript 타입 안정성
- 필드 이름(`FieldName`), 값(`SignupValues`), 에러(`SignupErrors`)를 단일 소스로 정의해 컴포넌트·훅·검증기 전반의 정합성을 보장합니다.
- `tsconfig`에 `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`를 적용했습니다.

### 4. 접근성 (a11y)
- 모든 입력은 `<label>`로 연결되고, 오류 시 `aria-invalid`와 `aria-describedby`로 에러 메시지를 가리킵니다.
- 에러는 `role="alert"` + `aria-live="polite"` 영역에 렌더링됩니다.
- 비밀번호 토글은 `aria-pressed`와 동적 `aria-label`을 가진 실제 `<button>`입니다.
- 약관 펼쳐보기는 `aria-expanded` / `aria-controls`로 패널과 연결됩니다.
- **유효성 실패로 제출이 막히면 첫 오류 필드로 포커스를 자동 이동**시켜 키보드 사용자가 길을 잃지 않게 합니다.
- 키보드 포커스 링은 `focus-visible`로만 노출됩니다.

### 5. 에러 처리 & 사용자 피드백
- **필드 레벨**: 인라인 오류 메시지 + 유효 시 성공 체크 아이콘.
- **폼 레벨**: 제출이 실패/거부되면 `try/catch`로 잡아 상단 오류 배너(`role="alert"`)에 메시지를 노출합니다.
- **상태 피드백**: 제출 중 로딩 스피너 + 버튼 비활성화, 성공 시 전용 완료 화면.
