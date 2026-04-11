# Smart Scene (Kịch bản / Tự động hóa) — Implementation Plan

**Trạng thái**: 🚧 Đang triển khai — Phase 1 Server hoàn tất (schema + DTOs + anti-loop engine + tests).

**Hướng đi**: Kết hợp **Tuya UX** (Builder step-by-step, Card grid, Tap-to-Run vs Automation tab) + **HA engine** (triggers/actions JSON, BullMQ executor, Redis trigger index, State Transition Filter).

## Mô tả tổng quan

Tính năng "Kịch bản" cho phép người dùng nhóm nhiều hành động điều khiển thiết bị lại và tự động hóa chúng theo lịch, vị trí hoặc trạng thái cảm biến (If-Then). Phân 2 loại:
- **Chạy tay (Tap-to-Run):** triggers = [] — bấm nút là chạy ngay.
- **Tự động hóa (Automation):** có trigger(s) — server tự kích khi điều kiện thỏa.

---

## Phase 1 — Server: Schema + DTOs + Anti-Loop Engine ✅ DONE

**A. Database Migration** ✅
- [x] Thêm `icon String?`, `color String?`, `roomId String? @db.Uuid` vào model `Scene`
- [x] Thêm `delayMs` vào cấu trúc actions JSON (DTO)
- [x] Chạy `prisma db push` để apply
- [x] Thêm bidirectional relation `scenes[]` trên Room model

**B. Action Executor** ✅ (đã có sẵn trong `device-control.processor.ts`)
- [x] `handleRunScene` — Orchestrator: load scene → batch pre-fetch devices → Redis pipeline → addBulk
- [x] `handleSceneDeviceActions` — Lean executor: MQTT publish + Socket emit
- [x] `handleCheckDeviceStateTriggers` — Evaluate trigger conditions (AND/OR)
- [x] Performance: O(1) orchestrator I/O bất kể số device (addBulk + pipeline)

**C. DTO Update** ✅
- [x] `CreateSceneDto`: icon, color, roomId, minIntervalSeconds, delayMs trên SceneActionItemDto (@Max 300000)
- [x] `UpdateSceneDto`: tương tự, roomId=null để xóa gán phòng
- [x] `SceneResponseDto`: expose icon, color, roomId, minIntervalSeconds, delayMs

**D. Anti-Loop Engine (v2: HA + Tuya hybrid)** ✅
- [x] **Layer 1 — State Transition Filter (HA pattern):** Gateway chỉ queue trigger eval khi entity state THỰC SỰ đổi (oldState !== newState). Cho phép cascade hợp lệ, chặn same-state loop.
- [x] **Layer 2 — Rate Limit (Tuya pattern):** `minIntervalSeconds` per-scene (default=60s, min=10s). Mutex `scene:lock:{sceneId}` TTL=10s chống double-fire.
- [x] **Layer 3 — Chain Depth Guard:** `scene:chain:{token}` → Redis → chainDepth counter. Max 5 hops. Chặn cross-scene loop đối nghịch (A→B→A→B).

**E. Unit Tests** ✅
- [x] 8/8 tests pass (iot-gateway): chainDepth default=0, chainDepth propagation, state-transition filter (HA pattern)

**Branch:** `feat/scene-anti-loop-v1` — 4 commits, ready for merge.

---

## Phase 1.5 — Server: Remaining items ✅ DONE

- [x] **delayMs execution** — actions with `delayMs > 0` queued as BullMQ delayed jobs. Group by `(deviceToken, delayMs)` tuple.
- [x] **SceneScheduleService** — fix import cron-parser v5: `CronExpressionParser.parse()` + `.toDate().getTime()`
- [ ] **LOCATION trigger executor** + geofence integration (Phase 3+ scope)

---

## Phase 2 — App: Kết nối API (thay mock bằng dữ liệu thật)

- [ ] Thêm `TScene.icon`, `TScene.color`, `TScene.roomId`, `TScene.minIntervalSeconds` vào type trong `scene.service.ts`
- [ ] Thêm `createScene`, `updateScene`, `deleteScene` vào `sceneService`
- [ ] Thêm `useCreateScene`, `useUpdateScene`, `useDeleteScene` vào `use-scenes.ts`
- [ ] **`tab-to-run-scene-screen.tsx`**: Replace `TAP_TO_RUN_CARDS` mock bằng `useScenes(homeId)`, filter scene có `triggers.length === 0`, map `TScene → TSceneCard` dùng `scene.icon` + `scene.color`
- [ ] **`automation-scene-screen.tsx`**: Replace `AUTOMATION_CARDS` mock bằng scene có `triggers.length > 0`, hiển thị badge tóm tắt trigger ("⏰ 18:00", "📍 Về nhà", "🔌 Cảm biến")
- [ ] `onCardPress` trên Tap-to-Run → gọi `useRunScene().mutate(scene.id)` với loading state
- [ ] Filter theo `scene.roomId` thay vì `filterTags` hardcode

---

## Phase 3 — App: Scene Builder UI (Tính năng chính)

- [ ] Tạo route `src/app/(app)/(modal)/scene-builder.tsx` (full-screen modal)
- [ ] Tạo `src/features/scenes/builder/` directory với structure:
  - `use-scene-builder.ts` — local state machine (Zustand) cho 3 bước
  - `scene-builder-screen.tsx` — container với ProgressBar header
  - `steps/step-trigger.tsx` — Bước 1: chọn loại scene + trigger
  - `steps/step-actions.tsx` — Bước 2: thêm/sắp xếp/xóa actions + delay
  - `steps/step-customize.tsx` — Bước 3: đặt tên, icon, màu, phòng
  - `components/trigger-type-picker.tsx` — 3 loại: Lịch hẹn / Vị trí / Cảm biến
  - `components/action-item-row.tsx` — Row hiển thị 1 action (swipe to delete)
  - `components/device-entity-picker.tsx` — Sheet chọn device → entity → value
  - `components/scene-icon-picker.tsx` — Grid chọn icon từ MaterialCommunityIcons

**Bước 1 — Trigger:**
- [ ] Tab "Chạy tay" / "Tự động hóa"
- [ ] Lịch hẹn: TimePicker + checkboxes ngày trong tuần
- [ ] Vị trí: toggle Về nhà / Ra khỏi nhà (dùng radius từ Home GPS)
- [ ] Cảm biến: chọn device → entity → operator (eq/gt/lt) → value

**Bước 2 — Actions:**
- [ ] List actions có thể drag-to-reorder (DraggableFlatList)
- [ ] "+ Thêm hành động" → Sheet: chọn device → entity → set value
- [ ] "+ Chờ N giây" → Input `delayMs` giữa 2 actions (Tuya-style)

**Bước 3 — Tùy chỉnh:**
- [ ] TextInput tên scene
- [ ] Icon picker (grid 4 cột)
- [ ] Color picker (preset palette)
- [ ] Room selector (optional)

---

## Phase 4 — App: Scene Detail / Edit

- [ ] Tạo route `src/app/(app)/(modal)/scene-detail/[id].tsx`
- [ ] Hiển thị: tên, icon, trigger summary, danh sách actions
- [ ] Nút "Chạy ngay" → `useRunScene`
- [ ] Nút "Chỉnh sửa" → mở Scene Builder với pre-filled data (edit mode)
- [ ] Toggle Active/Inactive
- [ ] Nút "Xóa" → confirm dialog → `useDeleteScene`

---

## Thứ tự ưu tiên

| # | Task | Repo | Độ khó | Status |
|---|------|------|--------|--------|
| 1 | DB migration (icon, color, roomId) | Server | XS | ✅ |
| 2 | DTO + Service update | Server | S | ✅ |
| 3 | Anti-loop engine (v2: HA + Tuya) | Server | L | ✅ |
| 4 | Unit tests (anti-loop) | Server | S | ✅ |
| 5 | delayMs execution (BullMQ delayed jobs) | Server | S | ✅ |
| 6 | cron-parser v5 migration | Server | XS | ✅ |
| 7 | Kết nối API trên 2 màn hình Smart Screen | App | S | ⬜ |
| 7 | Scene Builder UI (3 bước) | App | XL | ⬜ |
| 8 | Scene Detail / Edit | App | M | ⬜ |
| 9 | LOCATION trigger executor | Server | M | ⬜ |

## Anti-Loop Architecture Reference

```
Layer 1: State Transition Filter (HA)
  └→ Gateway chỉ trigger khi newState ≠ oldState
  └→ Giết 90% loop (same-state), cho phép cascade hợp lệ

Layer 2: Rate Limit + Mutex (Tuya)
  └→ minIntervalSeconds per-scene (default 60s)
  └→ scene:lock:{sceneId} TTL=10s (double-fire prevention)

Layer 3: Chain Depth Guard
  └→ scene:chain:{token} in Redis carries depth counter
  └→ iot-gateway reads → passes to BullMQ job → handleRunScene checks
  └→ Reject at depth ≥ 5 (opposing-state loops: A→B→A→B)
```

## Câu hỏi đã Giải quyết

- ✅ Conflict resolution: 2 scene xung đột cùng lúc → **Last-write-wins** (BullMQ job sau thắng) + mutex
- ✅ DEVICE_STATE trigger cooldown mặc định: **60s** (configurable via `minIntervalSeconds`, min=10s)
- ✅ Cascade chains: Cho phép (max 5 hops), chống loop bằng 3-layer defense
- Phase này chỉ Cloud — không triển khai Local/Offline scene.
