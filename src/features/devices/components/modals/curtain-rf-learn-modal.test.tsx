import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { cleanup, render, screen, setup, fireEvent } from '@/lib/test-utils';
import { CurtainRfLearnModal } from './curtain-rf-learn-modal';

// Mock uniwind theme
jest.mock('uniwind', () => ({
  useUniwind: () => ({ theme: 'light' }),
  withUniwind: (Component: any) => Component,
}));

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: 'FontAwesome5',
}));

describe('CurtainRfLearnModal', () => {
  const mockModalRef = { current: { dismiss: jest.fn() } } as unknown as React.RefObject<BottomSheetModal>;
  const mockSetRfLearnStatus = jest.fn();
  const mockOnStartLearn = jest.fn();
  const mockOnCancelLearn = jest.fn();
  const mockOnSaveLearn = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const renderModal = (rfLearnStatus: string, isControlling: boolean = false) => {
    return setup(
      <CurtainRfLearnModal
        modalRef={mockModalRef}
        isControlling={isControlling}
        rfLearnStatus={rfLearnStatus}
        setRfLearnStatus={mockSetRfLearnStatus}
        onStartLearn={mockOnStartLearn}
        onCancelLearn={mockOnCancelLearn}
        onSaveLearn={mockOnSaveLearn}
      />
    );
  };

  it('renders start screen when no status is present', async () => {
    renderModal('');

    expect(screen.getByText(/Lưu ý: Quá trình học lệnh RF được kiểm soát tự động/i)).toBeOnTheScreen();
    const startButton = screen.getByText('Bắt đầu Học RF');
    expect(startButton).toBeOnTheScreen();
  });

  it('calls onStartLearn when start button is pressed', async () => {
    const { user } = renderModal('');
    
    const startButton = screen.getByText('Bắt đầu Học RF');
    await user.press(startButton);

    expect(mockOnStartLearn).toHaveBeenCalledTimes(1);
  });

  it('shows timeline step 1 when started', () => {
    renderModal('start');

    expect(screen.getByText('Tiến trình học lệnh:')).toBeOnTheScreen();
    expect(screen.getByText('1. Bấm nút MỞ trên Remote')).toBeOnTheScreen();
    expect(screen.getByText('Hủy quá trình')).toBeOnTheScreen();
    expect(screen.queryByText('Hoàn tất & Lưu')).not.toBeOnTheScreen();
  });

  it('shoes Hoan tat & Luu button when step 3 is done', () => {
    renderModal('step_3_stop');

    expect(screen.getByText('Hoàn tất & Lưu')).toBeOnTheScreen();
  });

  it('calls onSaveLearn when Hoan tat & Luu button is pressed', async () => {
    const { user } = renderModal('step_3_stop');

    const saveButton = screen.getByText('Hoàn tất & Lưu');
    await user.press(saveButton);

    expect(mockOnSaveLearn).toHaveBeenCalledTimes(1);
  });

  it('shows success screen when status is success', () => {
    renderModal('success');

    expect(screen.getByText('Đã Lưu Thành Công')).toBeOnTheScreen();
    expect(screen.getByText('Hoàn tất')).toBeOnTheScreen();
  });

  it('shows cancel/timeout screen when status is timeout', () => {
    renderModal('timeout');

    expect(screen.getByText('Đã Hủy Học / Hết Hạn')).toBeOnTheScreen();
    expect(screen.getByText('Thử lại')).toBeOnTheScreen();
  });

  it('calls setRfLearnStatus to empty when Thử lại is pressed', async () => {
    const { user } = renderModal('cancelled');

    const retryButton = screen.getByText('Thử lại');
    await user.press(retryButton);

    expect(mockSetRfLearnStatus).toHaveBeenCalledWith('');
  });
});
