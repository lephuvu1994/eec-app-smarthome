# Smart Scene (Kịch bản) — Đã hoàn thành

## Phase 1 — Server: Schema + DTOs + Anti-Loop Engine ✅ DONE

- **Database Migration**: Thêm fields (icon, color, roomId, sortOrder), Update Action DTO delayMs. 
- **Action Executor**: `handleRunScene`, `handleSceneDeviceActions`, `handleCheckDeviceStateTriggers`.
- **Anti-Loop Engine (v2: HA + Tuya hybrid)**: State Transition Filter, Rate Limit (`minIntervalSeconds`), Chain Depth Guard (max 5 hops).
- **delayMs execution**: BullMQ delayed jobs.

---

## Phase 2 — App: Kết nối API & SortOrder ✅ DONE

- [x] **API Services**: Cập nhật Model (Thêm `icon`, `color`, `roomId`, `minIntervalSeconds`, `sortOrder`). Tạo endpoints và hooks (`useCreateScene`, `useUpdateScene`, `useDeleteScene`, `useReorderScenes`).
- [x] **Phân loại hiển thị**: Map data từ API lên các tab "Tap-to-run" (manual) và "Automation". 
- [x] **Kéo thả / Reorder (Optimistic Updates)**: Triển khai flow dời vị trí kịch bản, update ngay trên App (cache) và gọi ngầm lệnh PATCH `/scenes/reorder` lên Server.
- [x] Filter kịch bản theo `roomId`.
