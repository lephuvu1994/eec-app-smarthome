export type TConfig = {
  showCameraPreview: boolean;
  showRoomViewExpand: boolean;
};

export type TConfigState = TConfig & {
  setShowCameraPreview: (showCameraPreview: boolean) => void;
  setShowRoomViewExpand: (showRoomViewExpand: boolean) => void;
};
