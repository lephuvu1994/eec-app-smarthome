import { renderHook } from '@testing-library/react-native';
import { EAutomationTargetType } from '@/types/automation';
import { useTimers } from './use-timers';
import * as queryApi from '@/lib/api/automation/automation.query';

jest.mock('@/lib/api/automation/automation.query');

describe('useTimers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (queryApi.useTimers as unknown as jest.Mock).mockReturnValue({
      data: [
        { id: '1', targetType: EAutomationTargetType.DEVICE_ENTITY, targetId: 'e1' },
        { id: '2', targetType: EAutomationTargetType.DEVICE_ENTITY, targetId: 'e2' },
        { id: '3', targetType: EAutomationTargetType.SCENE, targetId: 'e1' },
      ],
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  it('filters timers for the given entity id', () => {
    // @ts-ignore
    const { result } = renderHook(() => useTimers({ id: 'e1' }));
    
    expect(result.current.timers).toHaveLength(1);
    expect(result.current.timers[0].id).toBe('1');
    expect(result.current.isLoadingTimers).toBe(false);
  });

  it('handles null or undefined entity gracefully', () => {
    const { result } = renderHook(() => useTimers());
    expect(result.current.timers).toHaveLength(0);

    const { result: resultNull } = renderHook(() => useTimers(null));
    expect(resultNull.current.timers).toHaveLength(0);
  });
});
