import ExpoModulesCore

public class SmartHomeModule: Module {
  public func definition() -> ModuleDefinition {
    // 1. Định nghĩa tên Module (Khớp với requireNativeModule trong TS)
    Name("SmartHomeSiri")

    // 2. Khai báo các Event mà Module này sẽ phát ra
    Events("onSiriAction")

    AsyncFunction("updateEntities") { (devices: [[String: String]]) in
      UserDefaults.standard.set(devices, forKey: "SiriShortcutsDevices")
      // Ép iOS cập nhật lại danh sách Shortcut ngay lập tức
      if #available(iOS 16.0, *) {
          AppShortcutsProvider.updateAppShortcutParameters()
      }
      print("Siri Entities Updated: \(devices.count) devices")
    }

    // 4. Lắng nghe thông báo từ AppIntent gửi sang
    // Dùng OnStartObserving để chỉ lắng nghe khi JS thực sự đang subscribe
    OnStartObserving {
      NotificationCenter.default.addObserver(
        forName: NSNotification.Name("onSiriAction"),
        object: nil,
        queue: .main
      ) { [weak self] notification in
        // Gửi data (deviceId, action) về cho TypeScript
        if let userInfo = notification.userInfo {
          self?.sendEvent("onSiriAction", userInfo)
        }
      }
    }

    // 5. Quan trọng: Phải hủy lắng nghe khi JS stop observing để tránh rò rỉ bộ nhớ
    OnStopObserving {
      NotificationCenter.default.removeObserver(self, name: NSNotification.Name("onSiriAction"), object: nil)
    }
  }
}