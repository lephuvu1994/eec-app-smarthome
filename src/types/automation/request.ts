export type TCreateTimerPayload = {
  name?: string;
  targetType: EAutomationTargetType;
  targetId: string;
  service: string;
  executeAt: string;
  actions: TAutomationAction[];
};

export type TCreateSchedulePayload = {
  name: string;
  targetType: EAutomationTargetType;
  targetId: string;
  service: string;
  actions: TAutomationAction[];
  daysOfWeek?: number[];
  timeOfDay?: string;
  timezone?: string;
  cronExpression?: string;
};

// ============================================================
// SERVICE
// ============================================================
