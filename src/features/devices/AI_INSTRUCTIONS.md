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
- **Secondary Modifiers (e.g., Dimmer, Color, Battery):**
  Modifiers should ideally be mapped as `attributes` within a primary entity (e.g., `brightness` inside `light_1`). If defined as sibling entities, their domains must not be listed in `isPrimaryEntity()` (e.g., use `number`, `color`), ensuring they do not leak out as extraneous floating cards on the Dashboard.
