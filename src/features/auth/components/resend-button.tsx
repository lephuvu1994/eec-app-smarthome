import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { countDownVerifyCode } from '../utils/constants';

export function ResendOtpButton({ onResend }: { onResend: () => void }) {
  // Mặc định đếm 60s ngay khi hiện lên
  const [countdown, setCountdown] = useState(countDownVerifyCode);

  useEffect(() => {
    // Nếu hết giờ thì dừng không tạo interval nữa
    if (countdown <= 0)
      return;

    // Cứ đúng 1 giây (1000ms) thì gọi React update state đúng 1 lần
    const intervalId = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Clean up cực kỳ an toàn
    return () => clearInterval(intervalId);
  }, [countdown]);

  const handlePress = () => {
    if (countdown > 0)
      return; // Khóa double-check an toàn
    onResend();
    setCountdown(countDownVerifyCode); // Reset bộ đếm
  };

  return (
    <TouchableOpacity
      className="mt-6 flex-row items-center justify-center"
      disabled={countdown > 0}
      onPress={handlePress}
    >
      <Text className="text-sm text-[#4B5563]">
        {translate('formAuth.notReceivedOtp')}
        {' '}
        <Text
          className={cn(
            'font-bold transition-colors duration-200',
            countdown > 0 ? 'text-[#9CA3AF]' : 'text-[#A3E635]',
          )}
        >
          {translate('formAuth.resendOtp')}
          {' '}
          {countdown > 0 ? `(${countdown}s)` : ''}
        </Text>
      </Text>
    </TouchableOpacity>
  );
}
