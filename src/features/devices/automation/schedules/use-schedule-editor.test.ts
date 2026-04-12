import { renderHook, act } from '@testing-library/react-native';
import { EAutomationTargetType } from '@/types/automation';
import { useScheduleEditor } from './use-schedule-editor';
import * as queryApi from '@/lib/api/automation/automation.query';
import { useQueryClient } from '@tanstack/react-query';

jest.mock('@/lib/api/automation/automation.query');
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
  QueryClient: jest.fn().mockImplementation(() => ({
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  })),
  QueryClientProvider: ({ children }: any) => children,
}));
jest.mock('@/components/ui', () => ({
  showErrorMessage: jest.fn(),
  showSuccessMessage: jest.fn(),
}));
jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

describe('useScheduleEditor', () => {
  const mockQueryClient = {
    invalidateQueries: jest.fn(),
  };

  const mockCreateScheduleMutation = jest.fn();
  const mockDeleteScheduleMutation = jest.fn();
  
  let originalDateTimeFormat: any;

  beforeAll(() => {
    originalDateTimeFormat = Intl.DateTimeFormat;
    (Intl as any).DateTimeFormat = () => ({
      resolvedOptions: () => ({ timeZone: 'Asia/Ho_Chi_Minh' }),
    });
  });

  afterAll(() => {
    Intl.DateTimeFormat = originalDateTimeFormat;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as unknown as jest.Mock).mockReturnValue(mockQueryClient);

    // @ts-ignore
    queryApi.useCreateSchedule.getKey = jest.fn().mockReturnValue(['createSchedule']);
    // @ts-ignore
    queryApi.useDeleteSchedule.getKey = jest.fn().mockReturnValue(['deleteSchedule']);

    (queryApi.useCreateSchedule as unknown as jest.Mock).mockImplementation(({ onSuccess, onError }) => {
      return {
        mutateAsync: async (vars: any) => {
          await mockCreateScheduleMutation(vars);
          if (vars.targetId === 'error') {
            onError();
            throw new Error('Create error');
          }
          onSuccess();
        },
        isPending: false,
      };
    });

    (queryApi.useDeleteSchedule as unknown as jest.Mock).mockImplementation(({ onSuccess, onError }) => {
      return {
        mutateAsync: async (id: string) => {
          await mockDeleteScheduleMutation(id);
          if (id === 'error-delete') {
            onError();
            throw new Error('Delete error');
          }
          onSuccess();
        },
        isPending: false,
      };
    });
  });

  const mockEntity = { id: 'entity-1', name: 'Test Entity' } as any;
  const mockExistingSchedule = { id: 'schedule-1' } as any;

  it('saves new schedule without deleting if no existing schedule is passed', async () => {
    const onSuccessMock = jest.fn();
    const { result } = renderHook(() => 
      useScheduleEditor({ entity: mockEntity, onSuccess: onSuccessMock })
    );

    const testTime = new Date('2024-01-01T08:05:00Z'); // 8:05

    await act(async () => {
      await result.current.saveSchedule(testTime, [1, 2, 3], 1);
    });

    expect(mockDeleteScheduleMutation).not.toHaveBeenCalled();
    expect(mockCreateScheduleMutation).toHaveBeenCalledWith({
      name: 'automation.schedule.scheduleFor Test Entity',
      targetType: EAutomationTargetType.DEVICE_ENTITY,
      targetId: 'entity-1',
      service: 'device-control',
      actions: [{ value: 1 }],
      daysOfWeek: [1, 2, 3],
      timeOfDay: `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`,
      timezone: 'Asia/Ho_Chi_Minh',
    });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['createSchedule'] });
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['schedules'] });
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it('deletes existing schedule before creating new one if existing schedule is passed', async () => {
    const { result } = renderHook(() => 
      useScheduleEditor({ entity: mockEntity, existingSchedule: mockExistingSchedule })
    );

    const testTime = new Date('2024-01-01T15:30:00Z');

    await act(async () => {
      await result.current.saveSchedule(testTime, [0, 6], 0);
    });

    expect(mockDeleteScheduleMutation).toHaveBeenCalledWith('schedule-1');
    expect(mockCreateScheduleMutation).toHaveBeenCalled();
  });

  it('throws error if saving schedule with no entity', async () => {
    // @ts-ignore
    const { result } = renderHook(() => useScheduleEditor({ entity: null }));

    const testTime = new Date();
    await act(async () => {
      await expect(result.current.saveSchedule(testTime, [], 1)).rejects.toThrow('No entity selected');
    });
  });

  it('deletes specific schedule successfully', async () => {
    const { result } = renderHook(() => 
      useScheduleEditor({ entity: mockEntity })
    );

    await act(async () => {
      await result.current.deleteSchedule('schedule-x');
    });

    expect(mockDeleteScheduleMutation).toHaveBeenCalledWith('schedule-x');
    const { showSuccessMessage } = require('@/components/ui');
    expect(showSuccessMessage).toHaveBeenCalledWith('automation.schedule.deleted');
  });
});
