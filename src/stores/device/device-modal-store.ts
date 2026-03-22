import type { TDevice, TDeviceFeature } from '@/lib/api/devices/device.service';
import { create } from 'zustand';

type TDeviceModalState = {
  isOpen: boolean;
  activeDevice: TDevice | null;
  activeFeature: TDeviceFeature | undefined;
  openModal: (device: TDevice, feature?: TDeviceFeature) => void;
  closeModal: () => void;
};

export const useDeviceModal = create<TDeviceModalState>(set => ({
  isOpen: false,
  activeDevice: null,
  activeFeature: undefined,
  openModal: (device, feature) => set({ isOpen: true, activeDevice: device, activeFeature: feature }),
  closeModal: () => set({ isOpen: false, activeDevice: null, activeFeature: undefined }),
}));
