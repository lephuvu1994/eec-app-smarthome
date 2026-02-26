# EEC Smarthome

React Native app (Expo SDK 54) dựa trên [Obytes React Native Template](https://github.com/obytes/react-native-template-obytes).

## Công nghệ

- **Expo SDK 54** + React Native 0.81.5
- **TypeScript**, **Expo Router 6**, **TailwindCSS** (NativeWind/Uniwind)
- **Zustand**, **React Query**, **TanStack Form + Zod**, **MMKV**

## Bắt đầu

**Lưu ý:** Project dùng **yarn** (không dùng pnpm). Nếu vừa chuyển từ pnpm, xóa `node_modules` và `pnpm-lock.yaml` (nếu còn) rồi chạy `yarn install` để tạo `yarn.lock`.

```bash
yarn install
yarn start              # Dev server
yarn ios                # Chạy iOS
yarn android            # Chạy Android
yarn expo prebuild      # Sinh lại thư mục android/ ios/
```

## Lệnh thường dùng

| Lệnh | Mô tả |
|------|--------|
| `yarn start` | Chạy Metro / Expo |
| `yarn ios` / `yarn android` | Chạy trên thiết bị/emulator |
| `yarn lint` | Kiểm tra ESLint |
| `yarn type-check` | Kiểm tra TypeScript |
| `yarn test` | Chạy Jest |
| `yarn check-all` | Lint + type-check + test |
| `yarn start:preview` | Chạy với env preview |
| `yarn build:production:ios` | EAS build production iOS |

## Cấu trúc project

```text
src/
├── app/              # Expo Router (file-based routes)
├── features/         # Các feature (auth, feed, settings...)
├── components/ui/    # UI components dùng chung
├── lib/              # API, auth, i18n, storage
├── translations/     # i18n (en.json, ar.json...)
└── global.css        # Cấu hình Tailwind

patches/              # Patch cho dependencies (patch-package)
```

---

## Các chỉnh sửa / thiết lập riêng của project

Project dùng **yarn** và một số dependency cần chỉnh để chạy đúng với Expo SDK 54 / React Native 0.81. Các thay đổi đã áp dụng:

### 1. Thêm `@expo/cli` vào devDependencies

- **Vấn đề:** Khi chạy `yarn expo prebuild` báo lỗi: *"Your application tried to access @expo/cli, but it isn't declared in your dependencies"*.
- **Nguyên nhân:** Package `expo` cần `@expo/cli` nhưng không được khai báo trực tiếp trong project.
- **Cách xử lý:** Thêm `@expo/cli` (phiên bản `54.0.22`, khớp Expo 54) vào `devDependencies` trong `package.json`.

### 2. Patch `react-native-vlc-media-player` (Expo config plugin)

- **Vấn đề:** Prebuild Android báo: *"Failed to match /applyNativeModulesAppBuildGradle(project)/i in contents"*.
- **Nguyên nhân:** Config plugin của `react-native-vlc-media-player` tìm trong `android/app/build.gradle` chuỗi `applyNativeModulesAppBuildGradle(project)` để chèn code. Template Expo/RN 0.81 không còn dùng chuỗi này mà dùng `autolinkLibrariesWithApp()` trong block `react { }`.
- **Cách xử lý:** Patch file `expo/android/withGradleTasks.js` trong package, đổi anchor từ regex `applyNativeModulesAppBuildGradle(project)` sang `autolinkLibrariesWithApp()`.

### 3. Patch bằng patch-package (yarn)

- **Cách xử lý:** Dùng `patch-package` (tương thích yarn):
  - File patch: `patches/react-native-vlc-media-player+1.0.98.patch`
  - Script `postinstall`: `patch-package` trong `package.json`.
  - Mỗi lần `yarn install`, patch được áp dụng cho `react-native-vlc-media-player`.

**Lưu ý:** Sau khi nâng cấp `react-native-vlc-media-player` lên bản mới, cần kiểm tra lại xem bản mới đã sửa anchor chưa; nếu chưa thì tạo lại patch: sửa file trong `node_modules`, rồi chạy `npx patch-package react-native-vlc-media-player`.

---

## Xóa cache (khi cần)

```bash
watchman watch-del-all && \
rm -rf node_modules/.cache && \
rm -rf $TMPDIR/metro-cache && \
rm -rf $TMPDIR/haste-map-*
```
