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
