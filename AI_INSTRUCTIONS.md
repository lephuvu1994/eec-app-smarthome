# AI_INSTRUCTIONS — Smart Home Expo React Native App

> **Mục đích:** File này mô tả kiến trúc, conventions, và design patterns **THỰC TẾ** đang được sử dụng trong source code. Khi code tính năng mới, AI **PHẢI** tuân theo các quy tắc dưới đây.

---

## 1. Project Overview

| Mục | Giá trị |
|---|---|
| Framework | Expo SDK 54 + React Native |
| Package Manager | Yarn 4.9 (Berry) |
| Router | `expo-router` (file-based routing) |
| State Management | Zustand + MMKV (persisted) |
| Data Fetching | TanStack React Query + Axios |
| Forms | TanStack React Form + Zod validation |
| Styling | NativeWind / UniWind (Tailwind for RN) |
| i18n | `i18next` + `react-i18next` (vi, en) |
| UI Notifications | `react-native-flash-message` |
| Animations | `react-native-reanimated` |
| Bottom Sheet | `@gorhom/bottom-sheet` |
| BLE | `react-native-ble-manager` |
| Icons | `@expo/vector-icons` |

---

## 2. Directory Structure

```
src/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx               # Root layout (Providers wrapper)
│   ├── (app)/                    # Authenticated routes group
│   │   ├── _layout.tsx           # Tab/Drawer layout
│   │   └── ...screens
│   ├── (welcome)/                # Unauthenticated routes group
│   │   └── ...login, signup
│   └── onboarding.tsx
├── components/
│   ├── base/                     # Shared layout primitives
│   ├── layout/                   # Page-level layouts
│   └── ui/                       # Design system components (Button, Input, Modal, etc.)
│       └── index.tsx             # Barrel export (tất cả UI import từ đây)
├── features/                     # Domain-specific feature modules
│   ├── auth/                     # Auth flow
│   │   ├── components/           # Form components (login-form, signup-form...)
│   │   ├── hooks/                # Custom hooks (use-sign-up, use-forgot-password)
│   │   ├── types/                # Types & enums
│   │   ├── utils/                # Constants, regex
│   │   ├── user-store.tsx        # Zustand auth store
│   │   ├── signin-screen.tsx     # Screen component
│   │   └── signup-screen.tsx
│   ├── home-screen/
│   ├── add-device-screen/
│   ├── settings-screen/
│   └── ...
├── hooks/                        # Shared custom hooks
├── lib/
│   ├── api/                      # API layer
│   │   ├── common/               # Axios client, APIProvider, utils
│   │   │   ├── client.tsx        # Axios singleton + JWT interceptor
│   │   │   ├── api-provider.tsx  # React Query Provider
│   │   │   └── utils.tsx         # API utility functions
│   │   ├── auth/auth.service.ts  # Auth API methods
│   │   ├── devices/              # Device API methods
│   │   ├── homes/                # Home API methods
│   │   └── scenes/               # Scene API methods
│   ├── ble.ts                    # BLE service wrapper
│   ├── crypto.ts                 # Encryption utilities
│   ├── i18n/                     # i18next config + utils
│   ├── storage.tsx               # MMKV storage adapter
│   └── utils.ts                  # Common utilities (cn, createSelectors)
├── stores/                       # Global Zustand stores
│   ├── config/                   # App config store
│   └── home/                     # Home selection store
├── translations/                 # i18n JSON files (vi.json, en.json)
├── types/                        # Global TypeScript types
└── global.css                    # NativeWind/Tailwind global styles
```

---

## 3. Coding Conventions

### 3.1 Naming

| Loại | Convention | Ví dụ |
|---|---|---|
| File | `kebab-case` | `signup-form.tsx`, `use-sign-up.ts`, `user-store.tsx` |
| Component | `PascalCase` | `SignUpForm`, `ForgotPasswordForm` |
| Hook | `camelCase` với prefix `use` | `useSignUp`, `useForgotPassword` |
| Store | `camelCase` với prefix `use` | `useUserManager`, `useHomeStore` |
| Type/Interface | `PascalCase` với prefix `T` hoặc `E` | `TUser`, `TAuthResponse`, `EAuthStatus` |
| Enum | `PascalCase` với prefix `E` | `EAuthStatus`, `EAddDeviceStep` |
| Constant | `camelCase` hoặc `UPPER_SNAKE` | `emailRegex`, `API_VERSION` |
| API service | `camelCase` object | `authService.login()`, `deviceService.getDevices()` |

### 3.2 TypeScript

- Sử dụng TypeScript strict mode
- Dùng `type` cho data shapes, `enum` cho fixed values
- Import types với `import type { ... }` khi chỉ dùng type

### 3.3 Import Order

```typescript
// 1. Type imports
import type { TDeviceResult } from '../types';

import { useMutation } from '@tanstack/react-query';
// 2. External library imports
import { useCallback, useEffect, useState } from 'react';

// 3. Internal imports (@ alias = src/)
import { Button, showErrorMessage } from '@/components/ui';
import { authService } from '@/lib/api/auth/auth.service';
import { translate } from '@/lib/i18n';

// 4. Relative imports
import { useSignUp } from '../hooks/use-sign-up';
import { emailRegex } from '../utils/constants';
```

---

## 4. Component Pattern

### Screen Component (đặt trong `features/{name}/`)
```tsx
// features/auth/signin-screen.tsx
export function SignInScreen() {
  return (
    <View className="flex-1">
      <ImageBackground source={bgImage} className="flex-1">
        <LoginForm />
      </ImageBackground>
    </View>
  );
}
```

### Form Component (đặt trong `features/{name}/components/`)
```tsx
// features/auth/components/signup-form.tsx
export function SignUpForm() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Hook cho mutation logic
  const { submitSignUp, isSigningUp, isChecking, handleCheckAndProceed } = useSignUp();

  // Form setup
  const form = useForm({
    defaultValues: { identifier: '', password: '', repeatPassword: '' },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      await submitSignUp({ identifier: value.identifier, password: value.password! });
    },
  });

  return (
    <KeyboardAvoidingView behavior={IS_IOS ? 'padding' : 'height'}>
      {/* Step-based form UI */}
    </KeyboardAvoidingView>
  );
}
```

### **Quan trọng: Tách mutation logic ra custom hook**
- Form component chỉ chứa UI + form state
- Mutation logic (API calls, error handling, side effects) đặt trong custom hook
- Hook return handlers + loading states

---

## 5. Custom Hook Pattern

```typescript
// features/auth/hooks/use-sign-up.ts
export function useSignUp() {
  const signIn = useUserManager(s => s.signIn);

  const { mutateAsync: submitSignUp, isPending: isSigningUp } = useMutation({
    mutationFn: async (variables: { identifier: string; password: string }) => {
      return authService.signup({ identifier: variables.identifier, password: variables.password });
    },
    onSuccess: (response) => {
      signIn({ /* map response to user state */ });
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('formAuth.signupFailed'));
    },
  });

  return { submitSignUp, isSigningUp, isChecking, handleCheckAndProceed };
}
```

### Rules:
- `mutateAsync` (không phải `mutate`) khi cần `await` trong form `onSubmit`
- `isPending` rename thành `isLoading`-style: `isSigningUp`, `isChecking`
- Error handling dùng `showErrorMessage()` với translated message
- Success handling dùng `showSuccessMessage()`

---

## 6. State Management (Zustand + MMKV)

### Store Pattern:
```typescript
// features/auth/user-store.tsx
const _useGetUser = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialUserState,
      status: EAuthStatus.idle,
      signIn: (user) => { set({ ...user, status: EAuthStatus.signIn }); },
      signOut: () => { set({ ...initialUserState, status: EAuthStatus.signOut }); },
      updateToken: (token) => { set({ ...get(), ...token }); },
    }),
    {
      name: 'user-storage', // Tên unique cho MMKV key
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useUserManager = createSelectors(_useGetUser);
```

### Rules:
- **Luôn dùng** `persist` middleware với `mmkvStorage` cho data cần giữ qua session
- **Luôn dùng** `createSelectors()` wrapper để tạo fine-grained selectors
- Export store dưới dạng `use{Name}` (e.g., `useUserManager`, `useHomeStore`)
- Truy cập ngoài React component: `useUserManager.getState().accessToken`

---

## 7. API Layer

### Client Setup (`lib/api/common/client.tsx`):
```typescript
export const client = createService(); // Axios singleton

// Features:
// - Auto-attach JWT token từ Zustand store
// - Auto-refresh token khi 401
// - Auto-signOut khi refresh fail
// - Error: extract message từ response.data.message
```

### API Service Pattern:
```typescript
// lib/api/auth/auth.service.ts
export const authService = {
  signup: async (variables: TSignupVariables): Promise<TAuthResponse> => {
    const { data } = await client.post('/auth/signup', variables);
    return data.data || data; // Server wraps in { data: ... }
  },

  login: async (identifier: string, password: string): Promise<TAuthResponse> => {
    const { data } = await client.post('/auth/login', { identifier, password });
    return data.data || data;
  },
};
```

### Rules:
- Mỗi domain có 1 file service: `auth.service.ts`, `device.service.ts`, `home.service.ts`
- Types định nghĩa trong cùng file service hoặc file `types.ts` riêng
- Response unwrap: `data.data || data` (vì server wraps trong `{ statusCode, data }`)
- **KHÔNG** import `client` trực tiếp trong component — luôn qua service

---

## 8. Navigation (expo-router)

### Layout hierarchy:
```
app/
├── _layout.tsx          → Root: Providers + Stack(3 screens)
├── (app)/               → Authenticated (Tab/Drawer layout)
│   └── _layout.tsx      → Bottom tabs / Drawer
├── (welcome)/           → Unauthenticated (auth screens)
│   └── _layout.tsx      → Stack for login/signup
└── onboarding.tsx       → First-time user flow
```

### Auth redirect:
- `useUserManager().status` → `EAuthStatus.signIn` → `(app)/`
- `useUserManager().status` → `EAuthStatus.signOut` → `(welcome)/`
- `useIsFirstTime()` → `onboarding`

### Navigation in code:
```typescript
// eslint-disable-next-line react-hooks/rules-of-hooks
const router = useRouter();
router.push('/devices');
router.back();
router.replace('/(welcome)/signin');
```

---

## 9. UI & Styling

### Styling: NativeWind (Tailwind CSS for RN)
```tsx
<View className="flex-1 bg-white px-4 dark:bg-gray-900">
  <Text className="text-2xl font-bold text-[#1B1B1B]">Title</Text>
  <Button
    className={cn('h-12 rounded-full', isDisabled ? 'bg-[#A3E635]/50' : 'bg-[#A3E635]')}
    onPress={handleSubmit}
    loading={isLoading}
    label={translate('formAuth.titleSignUp')}
  />
</View>;
```

### UI Component Imports:
```typescript
// LUÔN import từ barrel export
import {
  Button,
  FloatInput,
  IS_IOS,
  showErrorMessage,
  showSuccessMessage,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
```

### `cn()` utility cho conditional classes:
```typescript
import { cn } from '@/lib/utils';

className={cn('base-class', condition && 'conditional-class')}
```

### Dark mode:
- Sử dụng `dark:` prefix: `className="bg-white dark:bg-black"`
- Theme toggle qua `useThemeConfig()`

---

## 10. i18n (Internationalization)

### Setup:
- Framework: `i18next` + `react-i18next`
- Fallback language: `vi` (Vietnamese)
- Translation files: `src/translations/vi.json`, `src/translations/en.json`

### Sử dụng:
```typescript
import { translate } from '@/lib/i18n';

// Trong code
const message = translate('formAuth.titleSignUp');

// Với interpolation
translate('formAuth.verifyIdentifier', { identifier: 'Email' });

// Trong JSX với Text component (tx prop)
<Text tx="formAuth.or" />
```

### Rules:
- **KHÔNG hardcode text** — luôn dùng `translate(key)`
- **KHÔNG dùng Alert.alert** — dùng `showErrorMessage()` / `showSuccessMessage()`
- Key format: `{feature}.{context}.{name}` (e.g., `formAuth.error.passwordRequired`)

---

## 11. Error & Success Messages

```typescript
import { showErrorMessage, showSuccessMessage } from '@/components/ui';

// Error (red flash message)
showErrorMessage(translate('formAuth.signupFailed'));
showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));

// Success (green flash message)
showSuccessMessage(translate('formAuth.signupSuccess'));
```

**Tuyệt đối không dùng** `Alert.alert()` — luôn dùng flash messages.

---

## 12. Forms (TanStack React Form + Zod)

### Schema:
```typescript
const schema = z.object({
  identifier: z.string().trim().min(1, translate('formAuth.error.identifierRequired')).refine(val => emailRegex.test(val) || phoneRegex.test(val), {
    message: translate('formAuth.error.invalidFormatIdentifier'),
  }),
  password: z.string().min(6, translate('formAuth.error.passwordInvalidFormat')).optional(),
}).refine((data) => {
  if (data.password && data.repeatPassword)
    return data.password === data.repeatPassword;
  return true;
}, { path: ['repeatPassword'], message: translate('formAuth.error.passwordNotMatch') });
```

### Form setup:
```typescript
const form = useForm({
  defaultValues: { identifier: '', password: '' },
  validators: { onChange: schema as any },
  onSubmit: async ({ value }) => {
    await submitSignUp(value); // Delegate to hook
  },
});
```

### Field rendering:
```tsx
<form.Field
  name="identifier"
  children={field => (
    <FloatInput
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
      label={translate('formAuth.titleIdentifier')}
    />
  )}
/>;
```

### ⚠️ Stale Closure Gotcha:
```typescript
// ❌ SAI: getFieldValue ở render level = stale value
const identifierValue = form.getFieldValue('identifier');
const onSubmit = () => doSomething(identifierValue); // Có thể empty!

// ✅ ĐÚNG: Đọc giá trị bên trong handler
function onSubmit() {
  const currentValue = form.getFieldValue('identifier');
  doSomething(currentValue);
}
```

---

## 13. Animations

```typescript
import Animated, { FadeInRight, FadeInUp, FadeOutLeft } from 'react-native-reanimated';

<Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
  {/* Content */}
</Animated.View>
```

---

## 14. BLE (Bluetooth Low Energy)

```typescript
import { NativeEventEmitter, NativeModules } from 'react-native';
import { IS_IOS } from '@/components/ui';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(IS_IOS ? BleManagerModule : undefined);
```

`IS_IOS` check để tránh `removeListeners` warning trên Android.

---

## 15. Testing

- Framework: **Jest** + React Native Testing Library
- Test files: cùng folder với source, suffix `.test.tsx` / `.test.ts`
- Pattern: `button.test.tsx`, `crypto.test.ts`, `form-utils.test.ts`

Chưa có quy chuẩn và coverage requirement cho app — cần đề xuất sau.

---

## 16. ESLint, TypeScript & Formatting

### ESLint (`eslint.config.mjs`)

- Config base: **`@antfu/eslint-config`** (includes TypeScript, React, import sorting)
- Formatter: **ESLint Stylistic** (không dùng Prettier — formatting tích hợp trong ESLint)
- Plugins: `react-compiler`, `better-tailwindcss`, `i18n-json`, `testing-library`

#### Stylistic Rules (Formatting):
```javascript
stylistic: {
  indent: 2,          // Indent 2 spaces
  quotes: 'single',   // Single quotes
  semi: true,          // Bắt buộc semicolons
}
```

#### Key Rules:
```javascript
// General
'max-params': ['error', 3],                    // Tối đa 3 params cho function
'max-lines-per-function': ['error', 500],      // Tối đa 500 dòng/function
'no-console': 'off',                           // Cho phép console.log (debugging)

// TypeScript
'ts/consistent-type-definitions': ['error', 'type'],  // ⚠️ BẮT BUỘC dùng `type`, KHÔNG dùng `interface`
'ts/consistent-type-imports': ['warn', {
  prefer: 'type-imports',                       // Dùng `import type { ... }`
  fixStyle: 'inline-type-imports',              // Inline type imports
}],
'ts/no-use-before-define': 'off',              // Cho phép forward references

// React
'react/display-name': 'off',
'react/no-inline-styles': 'off',
'react-compiler/react-compiler': 'error',      // React Compiler enforcement
'react-hooks/refs': 'off',

// TailwindCSS
'better-tailwindcss/no-unnecessary-whitespace': 'warn',
'better-tailwindcss/no-unknown-classes': 'warn',
```

#### ⚠️ Quy tắc quan trọng:
```typescript
// ✅ ĐÚNG: Dùng `type` (enforced by ESLint)
// ✅ ĐÚNG: Type imports phải dùng `import type`
import type { TDeviceResult } from '../types';
import type { TUser } from './utils';

// ❌ SAI: Import type mà không dùng `type` keyword
import { TDeviceResult } from '../types';
import { someFunction } from './utils';

type TUser = {
  id: string;
  name: string;
};

// ❌ SAI: Dùng `interface` sẽ bị ESLint báo lỗi
type IUser = {
  id: string;
  name: string;
};
```

### TypeScript (`tsconfig.json`)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,                // Strict mode ON
    "checkJs": true,               // Also check .js files
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],          // Import alias: @/components/ui
      "@env": ["./env.ts"],        // Environment variables
      "@@/*": ["./*"]              // Root alias
    }
  }
}
```

### i18n JSON Validation

- `en.json` là reference file — `vi.json` phải có **chính xác** cùng tập keys
- Keys phải sorted alphabetically (ASC)
- Validation syntax: i18next format

### Scripts

```bash
yarn lint              # ESLint check
yarn lint:fix          # ESLint auto-fix
yarn type-check        # tsc --noEmit
yarn lint:translations # Validate translation JSON files
yarn check-all         # lint + type-check + lint:translations + test
```

### Trước khi commit — PHẢI chạy:
```bash
yarn type-check        # Đảm bảo không có TypeScript errors
yarn lint:fix          # Auto-fix lint issues
```

---

## 17. Khi Tạo Feature Mới — Checklist

1. **Tạo folder** trong `src/features/{feature-name}/`
2. **Tạo screen** component: `{feature-name}-screen.tsx`
3. **Tạo components/** cho các form/widget phức tạp
4. **Tạo hooks/** cho mutation/query logic (tách khỏi component)
5. **Tạo API service** trong `src/lib/api/{domain}/`
6. **Thêm route** trong `src/app/` (file-based routing)
7. **Thêm i18n keys** trong `src/translations/vi.json` và `en.json` (giữ keys identical)
8. **Store** (nếu cần persist state): tạo trong `src/stores/` hoặc `features/{name}/`
9. **Import UI** từ `@/components/ui` barrel export
10. **Error handling** dùng `showErrorMessage()` + `translate()`
11. **Chạy `yarn check-all`** trước khi commit
