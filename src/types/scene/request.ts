import type { TSceneTrigger, TSceneAction } from './base';

export type TCreateSceneDto = {
  name: string;
  homeId: string;
  icon?: string;
  color?: string;
  roomId?: string;
  triggers?: TSceneTrigger[];
  actions: TSceneAction[];
  minIntervalSeconds?: number;
};

export type TUpdateSceneDto = Partial<Omit<TCreateSceneDto, 'homeId'>>;
