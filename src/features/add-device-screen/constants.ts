import Env from '@env';

export const RADAR_SIZE = 340;
export const CENTER = RADAR_SIZE / 2;

export const PRIMARY_GREEN_HEX = '#A3EC3E';
export const HIGHLIGHT_COLOR = '#8B5CF6';
export const TEXT_PRIMARY = '#1A1A1A';
export const TEXT_SECONDARY = '#666666';

// AP Mode Configuration
export const AP_SSID_PREFIX = Env.EXPO_PUBLIC_AP_SSID_PREFIX;
export const AP_GATEWAY_IP = Env.EXPO_PUBLIC_AP_GATEWAY_IP;
export const AP_PORT = Number(Env.EXPO_PUBLIC_AP_PORT);
export const AP_CONNECT_TIMEOUT = 10_000; // 10s
