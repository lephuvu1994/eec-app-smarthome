import type { ESceneTriggerHubType } from '@/features/scenes/builder/types/scene-trigger-hub';
import { TSceneAction, TSceneTrigger } from '@/types/scene';
import { create } from 'zustand';

export type TSceneBuilderState = {
  triggerType: ESceneTriggerHubType | null;
  name: string;
  icon: string;
  color?: string;
  roomId?: string;
  showOnHome: boolean;
  triggers: TSceneTrigger[];
  actions: (TSceneAction & { _id: string })[];
};

type TSceneBuilderActions = {
  setTriggerType: (type: ESceneTriggerHubType) => void;
  setName: (name: string) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  setRoomId: (roomId: string) => void;
  setShowOnHome: (show: boolean) => void;
  setTriggers: (triggers: TSceneTrigger[]) => void;
  addAction: (action: TSceneAction) => void;
  updateAction: (id: string, action: Partial<TSceneAction>) => void;
  removeAction: (id: string) => void;
  reorderActions: (actions: (TSceneAction & { _id: string })[]) => void;
  clearStore: () => void;
};

const initialState: TSceneBuilderState = {
  triggerType: null,
  name: '',
  icon: 'lightning-bolt',
  roomId: undefined,
  showOnHome: true,
  triggers: [],
  actions: [],
};

export const useSceneBuilderStore = create<TSceneBuilderState & TSceneBuilderActions>(set => ({
  ...initialState,

  setTriggerType: type => set({ triggerType: type }),
  setName: name => set({ name }),
  setIcon: icon => set({ icon }),
  setColor: color => set({ color }),
  setRoomId: roomId => set({ roomId }),
  setShowOnHome: showOnHome => set({ showOnHome }),
  setTriggers: triggers => set({ triggers }),

  addAction: action =>
    set(state => ({
      actions: [...state.actions, { ...action, _id: Date.now().toString() }],
    })),

  updateAction: (id, updatedAction) =>
    set(state => ({
      actions: state.actions.map(act =>
        act._id === id ? { ...act, ...updatedAction } : act,
      ),
    })),

  removeAction: id =>
    set(state => ({
      actions: state.actions.filter(act => act._id !== id),
    })),

  reorderActions: actions => set({ actions }),

  clearStore: () => set(initialState),
}));
