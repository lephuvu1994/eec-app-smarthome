# AI_INSTRUCTIONS — Smart Home Expo React Native App

> **Mục đích:** File này mô tả kiến trúc, conventions, và design patterns **THỰC TẾ** đang được sử dụng trong source code. Khi code tính năng mới, AI **PHẢI** tuân theo các quy tắc dưới đây.

---

## 1. Project Overview

| Mục              | Giá trị                                |
| ---------------- | -------------------------------------- |
| Framework        | Expo SDK 54 + React Native             |
| Package Manager  | Yarn 4.9 (Berry)                       |
| Router           | `expo-router` (file-based routing)     |
| State Management | Zustand + MMKV (persisted)             |
| Data Fetching    | TanStack React Query + Axios           |
| Forms            | TanStack React Form + Zod validation   |
| Styling          | NativeWind / UniWind (Tailwind for RN) |
| i18n             | `i18next` + `react-i18next` (vi, en)   |
| UI Notifications | `react-native-flash-message`           |
| Animations       | `react-native-reanimated`              |
| Bottom Sheet     | `@gorhom/bottom-sheet`                 |
| BLE              | `react-native-ble-manager`             |
| Icons            | `@expo/vector-icons`                   |

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
│   ├── auth/                     # Auth flow (components, hooks, screens)
│   ├── devices/                  # Cấu trúc Thiết bị (Domain-driven)
│   │   ├── common/               # Dùng chung: device-list, action-bar, hooks (use-device-control)
│   │   ├── types/                # Component & Logic điều khiển từng loại thiết bị
│   │   │   ├── switch/           # Công tắc
│   │   │   ├── curtain/          # Rèm / Cửa cuốn
│   │   │   ├── climate/          # Điều hòa
│   │   │   └── light/            # Đèn
│   │   ├── automation/           # Tự động hóa thiết bị
│   │   │   ├── schedules/        # Lên lịch đóng mở
│   │   │   ├── timers/           # Đếm ngược
│   │   │   └── timeline/         # Lịch sử thiết bị
│   │   └── management/           # Thiết lập thiết bị
│   │       ├── add-device-screen/# Luồng cài đặt cấu hình ESP32/BLE
│   │       └── settings/         # Thông tin, xoá thiết bị, thông báo
│   ├── scenes/                   # Cấu trúc Kịch bản thông minh
│   │   ├── common/               # Dùng chung: scene-card, hooks list
│   │   ├── builder/              # Trình tạo/sửa ngữ cảnh (Builder UI)
│   │   ├── triggers/             # Các loại kích hoạt (Time, DeviceState)
│   │   ├── actions/              # Các hành động (Control device, Delay)
│   │   └── management/           # Quản lý logs kịch bản
│   ├── home-screen/              # Màn hình chính Dashboard
│   ├── smart-screen/             # TTTM / Dashboard phụ
│   └── settings-screen/          # Cài đặt người dùng
├── hooks/                        # Shared custom hooks (App global hooks)
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

| Loại           | Convention                           | Ví dụ                                                 |
| -------------- | ------------------------------------ | ----------------------------------------------------- |
| File           | `kebab-case`                         | `signup-form.tsx`, `use-sign-up.ts`, `user-store.tsx` |
| Component      | `PascalCase`                         | `SignUpForm`, `ForgotPasswordForm`                    |
| Hook           | `camelCase` với prefix `use`         | `useSignUp`, `useForgotPassword`                      |
| Store          | `camelCase` với prefix `use`         | `useUserManager`, `useHomeStore`                      |
| Type/Interface | `PascalCase` với prefix `T` hoặc `E` | `TUser`, `TAuthResponse`, `EAuthStatus`               |
| Enum           | `PascalCase` với prefix `E`          | `EAuthStatus`, `EAddDeviceStep`                       |
| Constant       | `camelCase` hoặc `UPPER_SNAKE`       | `emailRegex`, `API_VERSION`                           |
| API service    | `camelCase` object                   | `authService.login()`, `deviceService.getDevices()`   |

### 3.2 TypeScript & Enums

- **Sử dụng TypeScript strict mode**
- **Dùng `type` cho data shapes.** Tuyệt đối KHÔNG dùng `interface`.
- **Dùng `enum` (với prefix `E`) cho các nhóm giá trị cố định (fixed values) để loại bỏ Magic Strings.**
  - _Ví dụ:_ Các trường trạng thái từ API trả về (`status`, `type`, `event`, `source`) **BẮT BUỘC** phải được định nghĩa `enum` (vd: `EDeviceTimelineEvent.Online`).
  - **TUYỆT ĐỐI KHÔNG** so sánh hardcode chuỗi chay như `if (event === 'online')` hay định nghĩa type `event: 'online' | 'offline'`.
- Import types với `import type { ... }` khi chỉ dùng type.

### 3.3 Reanimated & Worklets

- **QUAN TRỌNG:** KHÔNG DÙNG `runOnJS` từ `react-native-reanimated` để chạy callback trên JS thread. App này sử dụng thư viện \*\*`react-native-worklets`

### 3.4 Import Order

```typescript
// 1. Type imports
import type { TDeviceResult } from "../types";

import { useMutation } from "@tanstack/react-query";
// 2. External library imports
import { useCallback, useEffect, useState } from "react";

// 3. Internal imports (@ alias = src/)
import {
  Button,
  showErrorMessage,
  View,
  Text,
  Input,
  FloatInput,
  ScrollView,
  WIDTH,
  HEIGHT,
  IS_IOS,
  IS_ANDROID,
  ActivityIndicator,
  Modal,
  Select,
  Pressable,
  TouchableOpacity,
  colors,
} from "@/components/ui";
import { authService } from "@/lib/api/auth/auth.service";
import { translate } from "@/lib/i18n";

// 4. Relative imports
import { useSignUp } from "../hooks/use-sign-up";
import { emailRegex } from "../utils/constants";
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
  const { submitSignUp, isSigningUp, isChecking, handleCheckAndProceed } =
    useSignUp();

  // Form setup
  const form = useForm({
    defaultValues: { identifier: "", password: "", repeatPassword: "" },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      await submitSignUp({
        identifier: value.identifier,
        password: value.password!,
      });
    },
  });

  return (
    <KeyboardAvoidingView behavior={IS_IOS ? "padding" : "height"}>
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
  const signIn = useUserManager((s) => s.signIn);

  const { mutateAsync: submitSignUp, isPending: isSigningUp } = useMutation({
    mutationFn: async (variables: { identifier: string; password: string }) => {
      return authService.signup({
        identifier: variables.identifier,
        password: variables.password,
      });
    },
    onSuccess: (response) => {
      signIn({
        /* map response to user state */
      });
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate("formAuth.signupFailed"));
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
      signIn: (user) => {
        set({ ...user, status: EAuthStatus.signIn });
      },
      signOut: () => {
        set({ ...initialUserState, status: EAuthStatus.signOut });
      },
      updateToken: (token) => {
        set({ ...get(), ...token });
      },
    }),
    {
      name: "user-storage", // Tên unique cho MMKV key
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

### ⚠️ Chiến lược "Offline-First / Cache-First" (Kiến trúc chuẩn Apple HomeKit / Tuya)

Đối với các dữ liệu mang tính cấu trúc vật lý cốt lõi của Smart Home (Homes, Floors, Rooms, Devices Metadata):

- Xem **[Device Integration Rules](./device/AI_INSTRUCTIONS.md)** để biết chi tiết về luật xử lý trạng thái thời gian thực và cách quyết định **Tách lẻ Card (Splitting)** hay **Gộp Card (Unified)** khi map `device.entities` lên Dashboard UI dựa trên quy ước mã code `"main"`.

- **BẮT BUỘC lưu trữ ở bộ nhớ đệm (Local Cache)** thông qua Zustand `persist` (MMKV) để đạt trải nghiệm Zero-Latency (Mở app là thấy ngay cấu trúc UI, tuyệt đối cấm dùng biến `isLoading` / vòng quay Loading che màn hình block UI).
- **Boot-Level Hydration:** Quá trình gọi API đồng bộ dữ liệu ngầm (Background Sync) phải được đưa lên Root Component (trên `_layout.tsx`) để chạy song song với `CustomSplashScreen` thông qua cơ chế `Promise.race`. Không gọi các API nạp cấu trúc tổng ở các màn hình con để tránh đụng độ lifecycle khi khởi động.
- **Live Status Separation:** Tách biệt dữ liệu cấu trúc (tên thiết bị, icon, phòng) và dữ liệu trạng thái (Bật/Tắt/Độ sáng). UI render trước cấu trúc từ cache, còn trạng thái (Telemetry) lập tức được kéo về qua MQTT/WebSockets và vá (`patch`) thẳng vào Zustand Store.

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
    const { data } = await client.post("/auth/signup", variables);
    return data.data || data; // Server wraps in { data: ... }
  },

  login: async (
    identifier: string,
    password: string,
  ): Promise<TAuthResponse> => {
    const { data } = await client.post("/auth/login", { identifier, password });
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
router.push("/devices");
router.back();
router.replace("/(welcome)/signin");
```

---

## 9. UI & Styling

### Styling: NativeWind (Tailwind CSS for RN)

```tsx
<View className="flex-1 bg-white px-4 dark:bg-gray-900">
  <Text className="text-2xl font-bold text-[#1B1B1B]">Title</Text>
  <Button
    className={cn(
      "h-12 rounded-full",
      isDisabled ? "bg-[#A3E635]/50" : "bg-[#A3E635]",
    )}
    onPress={handleSubmit}
    loading={isLoading}
    label={translate("formAuth.titleSignUp")}
  />
</View>
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
} from "@/components/ui";
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

### Rules & Tuân thủ Dịch thuật:

- **BẮT BUỘC dùng `translate(key)`** cho TẤT CẢ văn bản hiển thị. **TUYỆT ĐỐI KHÔNG** để raw text / string chay lồng trực tiếp trong View/Component dưới mọi hình thức (vd: ❌ `<Text>Thiết bị</Text>` / ❌ `const status = "Đang chạy"`).
- **Tuyệt đối tránh Nối chuỗi (String Concatenation):**
  - Khi cần ghép giá trị động vào câu (vd: "Trạng thái: Bật (qua Ứng dụng)"), **BẮT BUỘC** phải dùng tính năng `Interpolation` (biến trong cặp `{{ }}`) của i18next thay vì nối chuỗi JavaScript (`+` hoặc template literals `${}`).
  - _Ví dụ đúng:_ `"statusVia": "{{name}}Trạng thái: {{event}} (qua {{source}})"`
- Các giá trị sinh ra từ API (Source, Event, Error) thay vì map chữ cứng thì cũng phải chạy qua `translate(mappingEnum)`.
- **KHÔNG dùng Alert.alert** — dùng `showErrorMessage()` / `showSuccessMessage()`
- Key format: `{feature}.{context}.{name}` (e.g., `formAuth.error.passwordRequired`)

---

## 11. User Feedback — Toast vs Alert

### Toast (Flash Message) — Thông báo nhẹ, không chặn luồng

Dùng `showErrorMessage()` / `showSuccessMessage()` cho các thông tin **đơn giản, thoáng qua**, KHÔNG yêu cầu user phải hành động gì:

```typescript
import { showErrorMessage, showSuccessMessage } from "@/components/ui";

// Thao tác thành công
showSuccessMessage(translate("device.remove.success"));

// Lỗi API / validation
showErrorMessage(translate("formAuth.signupFailed"));
showErrorMessage(error?.message ?? translate("base.somethingWentWrong"));
```

**Khi nào dùng Toast:**

- Xác nhận thao tác thành công/thất bại (lưu, xóa, cập nhật...)
- Lỗi validation form, lỗi mạng
- Thông tin ngắn gọn không cần user phản hồi

### Alert.alert() — Hộp thoại yêu cầu xác nhận hoặc quyết định

Dùng `Alert.alert()` cho các tình huống **quan trọng**, cần user **đọc kỹ và ra quyết định**:

```typescript
import { Alert } from "react-native";

// Xác nhận hành động nguy hiểm (xóa, đăng xuất)
Alert.alert(
  translate("device.remove.title"),
  translate("device.remove.confirmMessage"),
  [
    { text: translate("base.cancel"), style: "cancel" },
    {
      text: translate("base.deleteButton"),
      style: "destructive",
      onPress: handleDelete,
    },
  ],
);

// Thông báo cần user chủ động đóng (quyền hệ thống, hướng dẫn thao tác)
Alert.alert(
  translate("settings.notification.permissionDenied"),
  translate("settings.notification.permissionDeniedDesc"),
);
```

**Khi nào dùng Alert:**

- Xác nhận hành động không thể hoàn tác (xóa thiết bị, đăng xuất, unbind...)
- Yêu cầu quyền hệ thống bị từ chối — cần hướng dẫn user vào Settings
- Thông báo quan trọng mà user CẦN PHẢI đọc xong mới tiếp tục (breaking change, data loss)
- Bất kỳ tình huống nào cần user chọn giữa 2+ hành động (Yes/No, Cancel/Confirm)

### ⚠️ Tóm tắt:

| Tình huống                          | Dùng                               |
| ----------------------------------- | ---------------------------------- |
| "Lưu thành công", "Xóa thành công"  | `showSuccessMessage()`             |
| "Lỗi mạng", "Sai mật khẩu"          | `showErrorMessage()`               |
| "Bạn có chắc muốn xóa?"             | `Alert.alert()` với 2 nút          |
| "Vui lòng bật quyền trong Settings" | `Alert.alert()`                    |
| "Đăng xuất?"                        | `Alert.alert()` với Cancel/Confirm |

---

## 12. Forms (TanStack React Form + Zod)

### Schema:

```typescript
const schema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, translate("formAuth.error.identifierRequired"))
      .refine((val) => emailRegex.test(val) || phoneRegex.test(val), {
        message: translate("formAuth.error.invalidFormatIdentifier"),
      }),
    password: z
      .string()
      .min(6, translate("formAuth.error.passwordInvalidFormat"))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.repeatPassword)
        return data.password === data.repeatPassword;
      return true;
    },
    {
      path: ["repeatPassword"],
      message: translate("formAuth.error.passwordNotMatch"),
    },
  );
```

### Form setup:

```typescript
const form = useForm({
  defaultValues: { identifier: "", password: "" },
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
  children={(field) => (
    <FloatInput
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
      error={getFieldError(field)}
      label={translate("formAuth.titleIdentifier")}
    />
  )}
/>
```

### ⚠️ Stale Closure Gotcha:

```typescript
// ❌ SAI: getFieldValue ở render level = stale value
const identifierValue = form.getFieldValue("identifier");
const onSubmit = () => doSomething(identifierValue); // Có thể empty!

// ✅ ĐÚNG: Đọc giá trị bên trong handler
function onSubmit() {
  const currentValue = form.getFieldValue("identifier");
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

## 14. Zeego Native Menu — Known Issues & Workarounds

### ⚠️ Bug: ZeegoNativeMenu trong `headerRight` (React Navigation)

**Vấn đề:** Khi đặt `ZeegoNativeMenu` (hoặc Zeego `DropdownMenu.Root`) bên trong `headerRight` của React Navigation / Expo Router, `DropdownMenu.Root` tự expand chiếm full width của `headerRight` container (~50% header width). Trigger button sẽ bị lệch sang trái thay vì nằm ở góc phải.

- GitHub Issue: [nandorojo/zeego#180](https://github.com/nandorojo/zeego/issues/180)
- **Chỉ xảy ra** khi ZeegoNativeMenu nằm trong `headerRight` — dùng bên ngoài header (e.g., custom header trong screen content) thì hoàn toàn bình thường.
- Regular `TouchableOpacity` trong `headerRight` **KHÔNG** bị lỗi này.

### Workaround: Custom `headerTitle` với `paddingRight`

Dùng custom `headerTitle` component để ép `headerRight` container về đúng kích thước:

```tsx
const HEADER_RIGHT_WIDTH = 32; // Điều chỉnh theo kích thước trigger

<Stack.Screen
  options={{
    headerTransparent: true,
    // ⚠️ Workaround Zeego #180: custom headerTitle ép headerRight width
    headerTitle: () => (
      <View className="flex-1" style={{ paddingRight: HEADER_RIGHT_WIDTH }}>
        <Text className="text-center text-[17px] font-semibold text-[#1B1B1B] dark:text-white">
          {translate("base.screenTitle")}
        </Text>
      </View>
    ),
    headerRight: () => (
      <ZeegoNativeMenu
        elements={menuElements}
        triggerComponent={
          <View
            pointerEvents="none"
            className="size-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40"
          >
            <AntDesign name="plus" size={18} color={tintColor} />
          </View>
        }
      />
    ),
  }}
/>;
```

### Rules cho ZeegoNativeMenu:

- **Trigger:** Dùng `<View pointerEvents="none">` làm trigger — Zeego `DropdownMenu.Trigger` tự handle press
- **KHÔNG** dùng `TouchableOpacity` làm trigger — sẽ conflict với Zeego's native press handling
- **Khi dùng trong `headerRight`:** BẮT BUỘC áp dụng workaround `headerTitle` ở trên
- **Khi dùng trong custom header hoặc screen content:** Dùng bình thường, không cần workaround
- Tham khảo `PrimaryHomeHeader.tsx` cho pattern chuẩn khi dùng ngoài `headerRight`

---

## 15. Drag & Drop (react-native-sortables)

### Thư viện:

- Package: **`react-native-sortables`** (peer deps: reanimated >=3, gesture-handler >=2 — đã có)
- Install: `npx expo install react-native-sortables`

### Khi nào dùng component nào:

| Component       | Khi nào dùng                                                                |
| --------------- | --------------------------------------------------------------------------- |
| `Sortable.Flex` | **Mixed layout** — items có width khác nhau (1 item full hàng, 2 item/hàng) |
| `Sortable.Grid` | **Uniform grid** — tất cả items cùng số cột cố định                         |

### Pattern cho Mixed Layout (`Sortable.Flex`):

```tsx
import Sortable from 'react-native-sortables';

// Data model: mỗi item cần `key` duy nhất và `colSpan: 1 | 2`
type TSceneItem = {
  key: string;
  title: string;
  colSpan: 1 | 2; // 1 = half-width (2 item/row), 2 = full-width (1 item/row)
  // ...other props
};

const SCENE_CARDS: TSceneItem[] = [
  { key: 'home', title: 'Về nhà', colSpan: 1, ... },
  { key: 'wakeup', title: 'Thức dậy sớm', colSpan: 1, ... },
  { key: 'power-off', title: 'Tắt toàn bộ thiết bị', colSpan: 2, ... }, // full hàng
];

// Width tính theo colSpan
const GAP = GAP_DEVICE_VIEW_MOBILE;
const halfWidth = (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP) / 2;

// Trong component
<Sortable.Flex
  data={cards}
  keyExtractor={item => item.key}
  renderItem={({ item }) => (
    <PrimarySceneCard
      {...item}
      containerStyle={{ width: item.colSpan === 2 ? '100%' : halfWidth }}
    />
  )}
  onOrderChange={newOrder => setCards(newOrder)}
  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}
/>
```

### Pattern cho Uniform Grid (`Sortable.Grid`):

```tsx
<Sortable.Grid
  data={items}
  columns={2}
  keyExtractor={(item) => item.key}
  renderItem={({ item }) => <MyCard {...item} />}
  onOrderChange={(newOrder) => setItems(newOrder)}
/>
```

### Rules:

- **PHẢI** wrap `Sortable.Flex` / `Sortable.Grid` bên trong `ScrollView` nếu nội dung dài
- **Chỉ** đặt các card cần drag vào trong `Sortable.*` — banner, section title, footer để **ngoài**
- `key` của mỗi item **PHẢI** unique và stable (không dùng index)
- `onOrderChange` nhận array items theo thứ tự mới — dùng `useState` để lưu
- Dùng `colSpan: 1 | 2` (không hardcode width string) để layout linh hoạt

---

## 16. BLE (Bluetooth Low Energy)

```typescript
import { NativeEventEmitter, NativeModules } from "react-native";
import { IS_IOS } from "@/components/ui";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(
  IS_IOS ? BleManagerModule : undefined,
);
```

`IS_IOS` check để tránh `removeListeners` warning trên Android.

---

## 17. Testing

- Framework: **Jest** + React Native Testing Library
- Test files: cùng folder với source, suffix `.test.tsx` / `.test.ts`
- Pattern: `button.test.tsx`, `crypto.test.ts`, `form-utils.test.ts`

Chưa có quy chuẩn và coverage requirement cho app — cần đề xuất sau.

---

## 18. ESLint, TypeScript & Formatting

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
import type { TDeviceResult } from "../types";
import type { TUser } from "./utils";

// ❌ SAI: Import type mà không dùng `type` keyword
import { TDeviceResult } from "../types";
import { someFunction } from "./utils";

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
    "strict": true, // Strict mode ON
    "checkJs": true, // Also check .js files
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"], // Import alias: @/components/ui
      "@env": ["./env.ts"], // Environment variables
      "@@/*": ["./*"] // Root alias
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

## 19. Khi Tạo Feature Mới — Checklist

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

Lưu ý: File skill.md (Superpowers) là QUY TRÌNH LÀM VIỆC của bạn. File AI_INSTRUCTIONS.md là PHONG CÁCH VIẾT CODE. Bạn phải tuân thủ QUY TRÌNH trước, tuyệt đối không được skip bước.

TASK CỦA BẠN HIỆN TẠI CHỈ LÀ BƯỚC 1 (BRAINSTORM & PLAN). TÔI CẤM BẠN VIẾT BẤT KỲ DÒNG CODE NÀO CHO ĐẾN KHI TÔI GÕ CHỮ 'DUYỆT PLAN'. NẾU BẠN VIẾT CODE NGAY, BẠN ĐÃ VI PHẠM LUẬT.
