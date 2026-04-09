import { Alert } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { cleanup, render, screen, setup, fireEvent } from '@/lib/test-utils';
import { translate } from '@/lib/i18n';
import { CurtainRfLearnModal } from './curtain-rf-learn-modal';

// Mock Alert
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert = { alert: jest.fn() };
  return rn;
});

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
  const mockOnClearLearn = jest.fn();

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
        onClearLearn={mockOnClearLearn}
        isOnline={true}
      />
    );
  };

  it('renders start screen when no status is present', async () => {
    renderModal('');

    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.note'))).toBeOnTheScreen();
    const startButton = screen.getByText(translate('deviceDetail.shutter.advanced.rf.startStudy'));
    expect(startButton).toBeOnTheScreen();
  });

  it('calls onStartLearn when start button is pressed inside alert', async () => {
    const { user } = renderModal('');
    
    (Alert.alert as jest.Mock).mockImplementation((_title, _msg, buttons) => {
      // Simulate clicking "Bắt đầu" (the second button)
      buttons[1].onPress();
    });

    const startButton = screen.getByText(translate('deviceDetail.shutter.advanced.rf.startStudy'));
    await user.press(startButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      translate('deviceDetail.shutter.advanced.rf.startStudyAlertTitle'),
      expect.any(String),
      expect.any(Array)
    );
    expect(mockOnStartLearn).toHaveBeenCalledTimes(1);
  });

  it('shows timeline step 1 when started', () => {
    renderModal('start');

    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.progressTitle'))).toBeOnTheScreen();
    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.step1'))).toBeOnTheScreen();
    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.cancelProcess'))).toBeOnTheScreen();
    expect(screen.queryByText(translate('deviceDetail.shutter.advanced.rf.saveFinish'))).not.toBeOnTheScreen();
  });

  it('shoes Hoan tat & Luu button when step 3 is done', () => {
    renderModal('step_3_stop');

    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.saveFinish'))).toBeOnTheScreen();
  });

  it('calls onSaveLearn when Hoan tat & Luu button is pressed', async () => {
    const { user } = renderModal('step_3_stop');

    const saveButton = screen.getByText(translate('deviceDetail.shutter.advanced.rf.saveFinish'));
    await user.press(saveButton);

    expect(mockOnSaveLearn).toHaveBeenCalledTimes(1);
  });

  it('shows success screen when status is success', () => {
    renderModal('success');

    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.successTitle'))).toBeOnTheScreen();
    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.finish'))).toBeOnTheScreen();
  });

  it('shows cancel/timeout screen when status is timeout', () => {
    renderModal('timeout');

    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.failedTitle'))).toBeOnTheScreen();
    expect(screen.getByText(translate('deviceDetail.shutter.advanced.rf.retry'))).toBeOnTheScreen();
  });

  it('calls setRfLearnStatus to empty when Thử lại is pressed', async () => {
    const { user } = renderModal('cancelled');

    const retryButton = screen.getByText(translate('deviceDetail.shutter.advanced.rf.retry'));
    await user.press(retryButton);

    expect(mockSetRfLearnStatus).toHaveBeenCalledWith('');
  });
});
