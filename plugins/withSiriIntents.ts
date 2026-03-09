import type { ConfigPlugin } from 'expo/config-plugins';
import { withEntitlementsPlist, withInfoPlist } from 'expo/config-plugins';

const withSiriIntents: ConfigPlugin = (config) => {
  // 1. Cấu hình Info.plist (Quyền hiển thị thông báo Siri)
  config = withInfoPlist(config, (config) => {
    config.modResults.NSSiriUsageDescription
      = 'Ứng dụng cần quyền Siri để bạn có thể điều khiển thiết bị bằng giọng nói.';
    return config;
  });

  // 2. Cấu hình Entitlements.plist (Bật Capability Siri)
  // Sử dụng withEntitlementsPlist thay cho withEntitlementsIOS
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.siri'] = true;
    return config;
  });

  return config;
};

export default withSiriIntents;
