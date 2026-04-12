/**
 * Loại trigger/action context khi user chọn từ Scene Trigger Hub.
 * Dùng enum thay vì magic strings (AI_INSTRUCTIONS §3.2).
 */
export enum ESceneTriggerHubType {
  /** Chạm để chạy — scene không có trigger */
  Manual = 'MANUAL',
  /** Khi trạng thái thiết bị thay đổi */
  DeviceState = 'DEVICE_STATE',
  /** Lịch trình */
  Schedule = 'SCHEDULE',
  /** Khi thời tiết thay đổi */
  Weather = 'WEATHER',
  /** Khi vị trí thay đổi */
  Location = 'LOCATION',
  /** Thay đổi chế độ an ninh */
  ArmMode = 'ARM_MODE',
  /** Khi báo động kích hoạt */
  Alarm = 'ALARM',
  /** Cảnh báo thảm hoạ */
  Disaster = 'DISASTER',
  /** Tạo kịch bản theo mẫu */
  Template = 'TEMPLATE',
  /** Tạo kịch bản nâng cao */
  Advanced = 'ADVANCED',
}
