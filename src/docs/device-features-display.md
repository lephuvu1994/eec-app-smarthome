# Kiến Trúc Hiển Thị Thiết Bị & Features (Smart Home)

Tài liệu này giải thích cách hệ thống phân rã một thiết bị vật lý (Physical Device) thành các nút bấm/cảm biến độc lập (Logic Features) trên Giao diện App (React Native).

Đây là nguyên tắc sống còn để App có thể hỗ trợ các thiết bị phức tạp như Công tắc 4 nút, Ổ cắm thông minh có đo điện, hoặc Cảm biến môi trường 3-trong-1 (Nhiệt độ, Độ ẩm, Ánh sáng).

---

## 1. Khái Niệm Cốt Lõi: Device vs Feature

Trong Data Model từ Backend truyền xuống, chúng ta có 2 tầng rõ rệt:

1. **`TDevice` (Thiết bị Vật lý):**
   - Đại diện cho phần cứng (Phôi chip, Vỏ nhựa, Địa chỉ MAC/IP, Kết nối Wifi/Zigbee).
   - *Ví dụ:* Cụm Công tắc cảm ứng âm tường loại 4 nút.
   - User quản lý TDevice để: Xem phiên bản Firmware, Xóa thiết bị khỏi nhà, Đổi tên tóm tắt cả cụm.

2. **`TDeviceEntity` (Điểm điều khiển Logic):**
   - Đại diện cho **các công năng cụ thể** nằm trên Thiết bị Vật lý đó.
   - *Ví dụ:* Nút bấm số 1 (Đèn trần), Nút bấm số 2 (Đèn hắt), Nút bấm số 3 (Quạt hút).
   - User tương tác với TDeviceEntity để: Bật/Tắt, Kéo thanh sáng mờ (Dimmer), Đọc nhiệt độ.

---

## 2. Cách App Render Giao Diện (Unpacking Logic)

Khác với các App sơ sài chỉ render 1 khối cho 1 thiết bị, App của chúng ta thiết kế theo chuẩn **Tuya / Apple HomeKit**:

**Mọi màn hình điều khiển (Home Screen / Room Screen / Favorite) KHÔNG render thẻ `Device`, mà render các thẻ `Feature`.**

### Luồng Xử Lý (Flow):
1. **Fetch Data:** App tải về mảng `TDevice[]`. Mỗi `TDevice` chứa một mảng con `features: TDeviceEntity[]`.
2. **Unpack (Dàn phẳng):** Component `ListDevice` (hoặc các Section) sẽ loop qua từng `TDevice`, moi mảng `features` ra và **duỗi phẳng (flat)** tất cả thành một list chung.
3. **Render Card:** Mỗi `Feature` được vẽ thành một `DeviceCard` độc lập.
   - Nút 1 thành một ô vuông. Bấm vào thì `switch_1` sáng.
   - Nút 2 thành một ô vuông. Bấm vào thì `switch_2` sáng.
   - Nếu công tắc có 4 nút, App sẽ vẽ 4 ô vuông bằng nhau, trông như 4 bóng đèn riêng biệt.

---

## 3. Quản Lý Không Gian Chuyên Sâu (Feature-Level Room Assignment)

Hệ thống Database của chúng ta (Prisma) hỗ trợ cấu hình cực kỳ linh hoạt: Cả `Device` và `DeviceEntity` đều có cột `roomId`.

**Tại sao lại cần thế này?**
- Thực tế lắp đặt: Một cái công tắc 4 nút được khoan và gắn vật lý ở bức tường **Phòng Khách** (`Device.roomId = id_phong_khach`).
- Tuy nhiên, thợ điện nối rây:
  - Nút 1: Đèn Chùm Phòng Khách -> Đầu ra ở Phòng Khách.
  - Nút 2: Đèn Hắt Tường -> Đầu ra ở Phòng Khách.
  - Nút 3: Đèn Ngọn Cây Ngoài Sân -> Đầu ra ở **Sân Vườn**.
  - Nút 4: Quạt hút Mùi Bếp -> Đầu ra ở **Phòng Bếp**.

**Flow Gán Phòng (Tránh rác UI):**
- Khi lập trình Màn hình **Assign Room (Gán phòng cho thiết bị)**, App tuyệt đối **không** gán cả cục `TDevice` vào Phòng.
- App phải cho phép User chọn TỪNG DÒNG `TDeviceEntity` và bấm Lưu vào phòng mong muốn.
- Nhờ vậy, khi User mở Tab "Phòng Bếp", họ chỉ thấy cục "Quạt hút mùi lõi 4" hiện lên chứ không bị bắt ép phải xem cả 3 cái nút phòng khách bị dính kèm.

---

## 4. Đồng Bộ Trạng Thái Trực Tiếp (Live Telemetry MQTT)

Vì App đã **Unpack** UI xuống mức Feature, việc nhận tín hiệu Real-time (Socket/Websocket/MQTT) cũng phải đâm thẳng vào Feature.

- Khi Chip phần cứng gửi gói tin MQTT báo Nút 2 được bấm thủ công bằng tay.
- Gói tin sẽ là: `{ device_id: "xxx", feature_code: "switch_2", value: 1 }`.
- Thay vì `device-store.ts` phải chật vật update lại cả cục `TDevice`, Zustand Store nên cung cấp một hàm:
  `updateFeatureValue(deviceId, entityCode, newValue)`
- Hàm này sẽ quét mảng Devices, tìm đúng vòng lặp `features`, và vá (patch) `lastValue = 1` vào đúng nút đó. React sẽ tự động re-render cái Thẻ Card tương ứng màu vàng lên chỉ trong 1 milisecond!

---

## 5. Chế Độ Hiển Thị Kép (Dual UI Display Modes)

Nhằm tối đa hóa trải nghiệm người dùng, hệ thống hỗ trợ việc chuyển đổi giữa 2 chế độ hiển thị thẻ bài (Card) thông qua **Cài đặt chung (General Settings)**.

### A. Chế Độ Phẳng (Flat Mode)
Đây là chế độ mặc định, bóc tách và render mọi Feature thành từng thẻ độc lập (Ví dụ: Công tắc 4 nút sẽ hiện thành 4 ô).

**Tương tác UX:**
- **Tap (Bấm nhẹ vào giữa thẻ):** Chỉ dùng để bật/tắt nhanh các thiết bị có tính chất nhị phân (Binary: `switch`, `light_on_off`).
- **Arrow-Up Icon (Góc dưới bên phải):** Nếu thẻ đó đại diện cho một tính năng phức tạp (ví dụ: Bóng đèn Dimmer cần chỉnh độ sáng, Đèn LED cần bảng màu RGB, Điều hòa cần chỉnh chế độ gió), góc dưới bên phải thẻ sẽ xuất hiện một Icon Arrow-Up mờ.
- **Kích hoạt Arrow-Up:** Khi chạm vào góc này (hoặc Long Press), App sẽ đẩy lên một **Bottom Sheet Modal** chuyên dụng chứa thanh trượt, bảng màu tương ứng với kiểu Feature đó.

### B. Chế Độ Gộp Cụm (Grouped Mode / Hardware Mode)
Dành cho người dùng thích sự gọn gàng. Thay vì rải rác 4 nút bấm, giao diện chỉ hiển thị 1 thẻ duy nhất là **"Tên Thiết Bị Vật Lý"** (Ví dụ: "Công Tắc Thông Minh Khu Vực Bếp").

**Tương tác UX:**
- Thẻ Gộp này **Luôn Luôn** có Icon Arrow-Up ở góc phải dưới (Tương tự thư mục folder trong iOS).
- **Kích hoạt Card / Arrow-Up:** Bấm vào thẻ này không làm bật/tắt thiết bị điên cuồng, mà sẽ gọi **Bottom Sheet Modal** trượt lên.
- Bên trong Modal lúc này, hệ thống sẽ render ra một Mini-Grid (hoặc List) chứa 4 nút bấm thành phần của cụm thiết bị đó. Từ đây User mới đi sâu vào điều khiển từng thành phần.

> **Tóm lại:** Lợi ích của kiến trúc "Móc dữ liệu sâu bằng Modal" sẽ giúp Màn hình Home không bao giờ bị quá tải thông tin, giữ được sự sang trọng (Minimalist UX), nhưng vẫn không cắt bớt bất kỳ quy mô điều khiển chuyên sâu nào.

---

> **Checklist Dành Cho Developer:**
> - [ ] Luôn kiểm tra Array `features` bên trong Model `TDevice` trước khi render.
> - [ ] Không bao giờ đặt biến `isOn = device.status` (vì một thiết bị đa nút không có state tắt/bật chung). Phải dùng `feature.lastValue === 1`.
> - [ ] Khi làm màn hình Cài Đặt, cho phép User sửa Tên của từng `Feature` (ví dụ sửa `switch_1` thành `Đèn Ngủ`). Cốt lõi trải nghiệm UX ăn tiền là ở đây.
