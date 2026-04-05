# Device Integration Rules

These instructions guide the standard architecture for handling device states in the React Native application. All future device integrations **MUST** adhere to these rules.

## 1. Zero Local State for Real-Time Attributes
Do **NOT** use `useState` to track real-time or persistent device attributes (like on/off status, mode, configuration, or travel times). 
- **Reasoning**: If a user navigates away or backgrounds the app, `useState` closures can become stale. When the app returns to the foreground, React Query will fetch the latest status from the `/devices` REST API, but localized `useState` variables will ignore the updated global store and display inaccurate/offline ghosting data.

## 2. Derive Everything from `useDeviceStore`
All visual components must derive their properties directly from the global Zustand store (`device-store.ts`).
- When extracting values, query `device.entities` or `device.status`.
- Example for a Switch: 
  ```typescript
  const isOn = primaryEntity?.currentState === 1; // DO THIS
  // const [isOn, setIsOn] = useState(primaryEntity?.currentState === 1) // DO NOT DO THIS
  ```

## 3. Real-Time MQTT Updates (`useDeviceEvent`)
When the app establishes an MQTT connection, it subscribes to topics directly from the IoT device. 
- Use the `useDeviceEvent` hook to capture real-time updates.
- **Rule**: Incoming MQTT updates must be dispatched directly to the global store using `updateDeviceEntity`. DO NOT call a local `setState` hook.
- Example:
  ```typescript
  useDeviceEvent(device.id, (data) => {
    if (data.entityCode) {
        updateDeviceEntity(device.id, data.entityCode, { state: data.state });
    }
  });
  ```

## 4. Exceptions for Local Scope
- **Animations / 60fps Visuals**: Use `useSharedValue` from `react-native-reanimated` for values that update dozens of times per second (like a curtain position traveling). The global store should not be responsible for tracking interpolations, as it will tank list performance.
- **API Loading Spinners**: Variables like `isControlling` (used to disable a button while waiting for a REST response) should remain local `useState` variables since they are ephemeral UI interactions.

## 5. Defensive State Initialization
When deriving states from the global store, handle missing objects, missing attributes, or legacy schemas defensively using optional chaining `?.` and fallback values.

## 6. Splitting vs Unified Devices (Dashboard Rendering)
When mapping raw `device.entities` to Dashboard UI cards, the function `getPrimaryEntities()` (inside `device-entity-helper.ts`) dictates how a device is split:
- **Unified Appliances (e.g., Curtain, Air Conditioner, Water Heater, Robot Vacuum):**
  If a device configuration conceptually groups multiple features into a single cohesive physical product, **ONE** of its entities MUST be assigned the code `"main"`. 
  *Result:* The helper will return ONLY the `"main"` entity, collapsing the entire device into exactly **1 Card** on the Dashboard. Clicking the card opens a Detail Screen that has access to the full `device.entities` array to render its secondary controls (Child Lock, RF, BLE Mode).
- **Multi-Gang Devices (e.g., 1-4 Gang Switches, Multi-channel Relays):**
  Instead of a `"main"` entity, use distinct sibling entities like `"channel_1"`, `"channel_2"`, etc.
  *Result:* The helper will return all matching robust domains (`switch_`, `light`, etc.), generating **N Cards** on the Dashboard for independent control.
  Modifiers should ideally be mapped as `attributes` within a primary entity (e.g., `brightness` inside `light_1`). If defined as sibling entities, their domains must not be listed in `isPrimaryEntity()` (e.g., use `number`, `color`), ensuring they do not leak out as extraneous floating cards on the Dashboard.

## 7. Device vs Entity UI Rules (Grouped vs Flat Modes)
When designing screens that interact with or display devices, clearly distinguish between the overall physical hardware (`TDevice`) and its functional endpoints (`TDeviceEntity`).

### Dashboard Card UI (Home Screen)
The UI logic (Power/Expand buttons and Name) relies on whether the device naturally has `entities.length <= 1` (`isSingleHardwareEntity`) and whether the UI is rendering it in `Flat` isolation (`activeEntity` injected):

| Device Type | View Mode | Display Name | Quick Power Toggle | Expand Modal Icon |
| :--- | :--- | :--- | :---: | :---: |
| **Multi-Gang** (e.g., 3-Gang Switch) | `Grouped` (Unified Card) | `device.name` (Total Device) | ❌ Hidden | ✅ Visible |
| **Multi-Gang** (e.g., 3-Gang Switch) | `Flat` (Split Cards) | `device.name - entity.name` | ✅ Visible | ❌ Hidden |
| **Single-Entity** (e.g., Curtain, Plug) | `Grouped` & `Flat` | `entity.name` (fallback `device.name`) | ✅ Visible | ❌ Hidden (Unless has attributes) |

*Logic Flags (in `use-device-control`):*
- **`canQuickToggle`**: `isSingleHardwareEntity || !!activeEntity` -> Shows the Power cycle button if it's naturally 1 button or it's been isolated into Flat mode.
- **`showExpandIcon`**: `(!activeEntity && !isSingleHardwareEntity) || hasAttributes` -> Shows the expand icon if it is a unified group card OR the entity has deep properties (e.g. Brightness).

### Device Info Settings UI (Editing Names)
When editing names in settings, avoid confusing the user between updating the IoT Box vs updating a functional switch.
- **Hardware Name (Header)**: The prominent header edit button should STRICTLY call `deviceService.renameDevice` to update ONLY the hardware name (Device Name), regardless of whether the device is single-entity or multi-gang. DO NOT use `Promise.all` to forcibly sync entity names with the hardware name, as this corrupts default semantic names for complex devices like Curtains or Air Conditioners.
- **Multi-Gang (`entities.length > 1`)**: Render an additional List of Entities below the header. This allows the user to explicitly rename specific features by calling `deviceService.renameDeviceEntity` element-by-element.
- **Single-Entity (`entities.length <= 1`)**: Hide the List of Entities entirely (similar to Tuya style). The functional entity naturally inherits its identity from the hardware device name on the Home Screen via fallback `Entity.name || Device.name`.

### Device Detail Screen (Group vs Flat Views)
When a user opens a Device Detail Screen (e.g. `switch-detail-screen.tsx`, `curtain-detail-screen.tsx`), the rendering logic MUST respect the `entityId` navigation parameter to isolate controls properly:
- **Group Mode (No `entityId` provided)**: Render the comprehensive view of the hardware device, displaying ALL primary entities (e.g., all 3 switches of a 3-gang switch). The Screen Header title should strictly be `device.name`.
- **Flat Mode (`entityId` is explicitly provided)**: Render an isolated view corresponding to ONLY that specific `entityId`. Do NOT render sibling entities. The Screen Header title should shift to emphasize the isolated entity (e.g., `entity.name || device.name` or `entity.name - device.name`). 

### Inline Entity Renaming (Long Press)
To reduce friction in the UX:
- Primary control components (e.g., `SwitchModalItem`) MUST support an `onLongPress` event. 
- Long-pressing a control component inside a Device Detail screen should silently trigger `Haptics.impactAsync` and launch an inline `<RenameDeviceModal>` targeted directly at renaming that specific `entity.name` via `deviceService.renameDeviceEntity`.

## 8. Tái cấu trúc thư mục (Refactored Directory Structure)
Các file của một thiết bị phân tán theo nguyên tắc Domain-driven:
- **`src/features/devices/common/`**: Header/Action Bar/Danh sách thiết bị dùng chung cho toàn bộ module. Chứa `use-device-control`.
- **`src/features/devices/types/{Tên_Thiết_Bị}/`**: Hook, Screen, Modal UI riêng biệt cho từng dòng thiết bị. VD: `types/switch`, `types/curtain`.
- **`src/features/devices/automation/`**: Tách bạch Schedules, Timers, và Timeline sử dụng chéo.
- **`src/features/devices/management/`**: Flow cài đặt (add-device) và cấu hình app Setting (info).
Hãy bảo toàn cấu trúc này khi tích hợp thêm các phần cứng/device types mới.
