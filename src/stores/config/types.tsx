export type TConfig = {
  showCameraPreview: boolean;
  showRoomViewExpand: boolean;
  allowHaptics: boolean;
  deviceViewMode: 'grouped' | 'split';
};

export type TConfigState = TConfig & {
  setShowCameraPreview: (showCameraPreview: boolean) => void;
  setShowRoomViewExpand: (showRoomViewExpand: boolean) => void;
  setToggleAllowHaptics: (allowHaptics: boolean) => void;
  setDeviceViewMode: (mode: 'grouped' | 'split') => void;
};
