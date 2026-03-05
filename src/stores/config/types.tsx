export type TConfig = {
  showCameraPreview: boolean
}

export type TConfigState = TConfig & {
  setShowCameraPreview: (showCameraPreview: boolean) => void
}