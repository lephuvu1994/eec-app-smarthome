import { renderHook, act } from '@testing-library/react-native';
import { EAutomationTargetType } from '@/types/automation';
import { useTimerEditor } from './use-timer-editor';
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

describe('useTimerEditor', () => {
  const mockQueryClient = {
    invalidateQueries: jest.fn(),
  };

  const mockCreateTimerMutation = jest.fn();
  const mockDeleteTimerMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as unknown as jest.Mock).mockReturnValue(mockQueryClient);

    // Provide getKey mocks to avoid runtime errors during invalidation
    // @ts-ignore
    queryApi.useCreateTimer.getKey = jest.fn().mockReturnValue(['createTimer']);
    // @ts-ignore
    queryApi.useDeleteTimer.getKey = jest.fn().mockReturnValue(['deleteTimer']);

    (queryApi.useCreateTimer as unknown as jest.Mock).mockImplementation(({ onSuccess, onError }) => {
      return {
        mutateAsync: async (vars: any) => {
          await mockCreateTimerMutation(vars);
          if (vars.targetId === 'error') {
            onError();
            throw new Error('Create error');
          }
          onSuccess();
        },
        isPending: false,
      };
    });

    (queryApi.useDeleteTimer as unknown as jest.Mock).mockImplementation(({ onSuccess, onError }) => {
      return {
        mutateAsync: async (id: string) => {
          await mockDeleteTimerMutation(id);
          if (id === 'error-delete') {
            onError();
            throw new Error('Delete error');
          }
          onSuccess();
        },
        isPending: false,
      };
    });

    jest.spyOn(Date, 'now').mockReturnValue(1600000000000); // stable date
  });

  const mockEntity = { id: 'entity-1', name: 'Test Entity' } as any;
  const mockExistingTimer = { id: 'timer-1' } as any;

  it('saves new timer without deleting if no existing timer is passed', async () => {
    const onSuccessMock = jest.fn();
    const { result } = renderHook(() => 
      useTimerEditor({ entity: mockEntity, onSuccess: onSuccessMock })
    );

    await act(async () => {
      await result.current.saveTimer(60, 1);
    });

    expect(mockDeleteTimerMutation).not.toHaveBeenCalled();
    expect(mockCreateTimerMutation).toHaveBeenCalledWith({
      name: 'automation.countdown.timerFor Test Entity',
      targetType: EAutomationTargetType.DEVICE_ENTITY,
      targetId: 'entity-1',
      service: 'device-control',
      executeAt: new Date(1600000000000 + 60 * 1000).toISOString(),
      actions: [{ value: 1 }],
    });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['createTimer'] });
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['timers'] });
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it('deletes existing timer before creating new one if existing timer is passed', async () => {
    const { result } = renderHook(() => 
      useTimerEditor({ entity: mockEntity, existingTimer: mockExistingTimer })
    );

    await act(async () => {
      await result.current.saveTimer(120, 0);
    });

    expect(mockDeleteTimerMutation).toHaveBeenCalledWith('timer-1');
    expect(mockCreateTimerMutation).toHaveBeenCalled();
  });

  it('throws error if saving timer with no entity', async () => {
    // @ts-ignore
    const { result } = renderHook(() => useTimerEditor({ entity: null }));

    await act(async () => {
      await expect(result.current.saveTimer(60, 1)).rejects.toThrow('No entity selected');
    });
  });

  it('deletes specific timer successfully', async () => {
    const { result } = renderHook(() => 
      useTimerEditor({ entity: mockEntity })
    );

    await act(async () => {
      await result.current.deleteTimer('timer-x');
    });

    expect(mockDeleteTimerMutation).toHaveBeenCalledWith('timer-x');
    const { showSuccessMessage } = require('@/components/ui');
    expect(showSuccessMessage).toHaveBeenCalledWith('automation.countdown.deleted');
  });
});
