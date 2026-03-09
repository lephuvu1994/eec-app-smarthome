import AppIntents
import Foundation

// 1. Định nghĩa Thực thể Thiết bị (Dynamic)
struct DeviceEntity: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Thiết bị"
    
    @Property(title: "ID")
    var id: String
    
    @Property(title: "Tên")
    var name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }

    // Kết nối thực thể với bộ truy vấn
    static var defaultQuery = DeviceQuery()
}

// 2. Bộ lọc tìm kiếm thiết bị cho Siri - ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT
struct DeviceQuery: EntityQuery {
    
    // Tìm kiếm thiết bị theo ID (Dùng khi Siri đã nhớ thiết bị đó)
    func entities(for identifiers: [String]) async throws -> [DeviceEntity] {
        let allDevices = getAllDevicesFromStorage()
        return allDevices.filter { identifiers.contains($0.id) }
    }

    // Tìm kiếm thiết bị theo tên (Dùng khi bác nói "Bật Đèn Chùm")
    func suggestedEntities() async throws -> [DeviceEntity] {
        return getAllDevicesFromStorage()
    }

    // Hàm bổ trợ để đọc data từ UserDefaults mà SmartHomeModule đã lưu
    private func getAllDevicesFromStorage() -> [DeviceEntity] {
        guard let savedDevices = UserDefaults.standard.array(forKey: "SiriShortcutsDevices") as? [[String: String]] else {
            return []
        }
        
        return savedDevices.compactMap { dict in
            guard let id = dict["id"], let name = dict["name"] else { return nil }
            return DeviceEntity(id: id, name: name)
        }
    }
}

// 3. Intent thực thi lệnh
struct ControlDeviceIntent: AppIntent {
    static var title: LocalizedStringResource = "Điều khiển thiết bị thông minh"

    // Siri sẽ tự động bóc tách tham số 'target' dựa trên danh sách DeviceQuery trả về
    @Parameter(title: "Thiết bị")
    var target: DeviceEntity

    @Parameter(title: "Hành động", default: "bật")
    var action: String 

    // Hàm thực thi khi khớp lệnh
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // Bắn Notification để SmartHomeModule.swift hứng và gửi về JS
        NotificationCenter.default.post(
            name: NSNotification.Name("onSiriAction"),
            object: nil,
            userInfo: [
                "deviceId": target.id,
                "action": action
            ]
        )

        // Câu trả lời của Siri (Bác có thể tùy biến Tiếng Việt)
        return .result(dialog: "Đã thực hiện \(action) \(target.name)")
    }
}

// 4. Đăng ký các câu mẫu (Zero Shortcut)
struct SmartHomeShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: ControlDeviceIntent(),
            phrases: [
                "\(.applicationName) ơi \(\.$action) \(\.$target)",
                "\(\.$action) \(\.$target) trong \(.applicationName)",
                "Chạy kịch bản \(\.$target) bằng \(.applicationName)"
            ],
            shortTitle: "Điều khiển nhà thông minh",
            systemImageName: "house.fill"
        )
    }
}