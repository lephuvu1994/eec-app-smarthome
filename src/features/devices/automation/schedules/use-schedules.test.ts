import { act, renderHook } from '@testing-library/react-native';
import { EAutomationTargetType } from '@/types/automation';
import { useSchedules } from './use-schedules';
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
}));
jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

describe('useSchedules', () => {
  const mockQueryClient = {
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  };

  const mockToggleMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as unknown as jest.Mock).mockReturnValue(mockQueryClient);

    (queryApi.useSchedules as unknown as jest.Mock).mockReturnValue({
      data: [
        { id: '1', targetType: EAutomationTargetType.DEVICE_ENTITY, targetId: 'e1', isActive: true },
        { id: '2', targetType: EAutomationTargetType.DEVICE_ENTITY, targetId: 'e2', isActive: false },
        { id: '3', targetType: EAutomationTargetType.SCENE, targetId: 'e1', isActive: true },
      ],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    // @ts-ignore - Mocking the custom property
    queryApi.useSchedules.getKey = jest.fn().mockReturnValue(['schedules']);

    (queryApi.useToggleSchedule as unknown as jest.Mock).mockImplementation(({ onSuccess, onError }) => {
      return {
        mutateAsync: async (vars: any) => {
          await mockToggleMutation(vars);
          if (vars.id === 'error-id') {
            onError();
            throw new Error('Toggle failed');
          }
          onSuccess();
        },
      };
    });
  });

  it('filters schedules for the given entity id', () => {
    // @ts-ignore
    const { result } = renderHook(() => useSchedules({ id: 'e1' }));
    
    expect(result.current.schedules).toHaveLength(1);
    expect(result.current.schedules[0].id).toBe('1');
    expect(result.current.isLoadingSchedules).toBe(false);
  });

  it('optimistically updates schedule state on toggle', async () => {
    // @ts-ignore
    const { result } = renderHook(() => useSchedules({ id: 'e1' }));

    await act(async () => {
      await result.current.toggleSchedule('1', false);
    });

    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['schedules'],
      expect.any(Function)
    );
    expect(mockToggleMutation).toHaveBeenCalledWith({ id: '1', isActive: false });
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['schedules'] });
  });

  it('reverts optimistic update and shows error on failure', async () => {
    // @ts-ignore
    const { result } = renderHook(() => useSchedules({ id: 'e1' }));

    await act(async () => {
      await expect(result.current.toggleSchedule('error-id', true)).resolves.not.toThrow();
    });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['schedules'] });
    const { showErrorMessage } = require('@/components/ui');
    expect(showErrorMessage).toHaveBeenCalledWith('base.somethingWentWrong');
  });
});
