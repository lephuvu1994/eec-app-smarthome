export type TConfig = {
  showCameraPreview: boolean;
  showRoomViewExpand: boolean;
  allowHaptics: boolean;
  deviceViewMode: 'grouped' | 'split';
  /** Maps deviceId → curtain device type ID (local preference, not synced) */
  shutterDeviceTypes: Record<string, string>;
};

export type TConfigState = TConfig & {
  setShowCameraPreview: (showCameraPreview: boolean) => void;
  setShowRoomViewExpand: (showRoomViewExpand: boolean) => void;
  setToggleAllowHaptics: (allowHaptics: boolean) => void;
  setDeviceViewMode: (mode: 'grouped' | 'split') => void;
  setShutterDeviceType: (deviceId: string, typeId: string) => void;
};
