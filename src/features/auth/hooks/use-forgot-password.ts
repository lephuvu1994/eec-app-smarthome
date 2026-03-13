import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { authService } from '@/lib/api/auth/auth.service';
import { translate } from '@/lib/i18n';

export function useForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [resetToken, setResetToken] = useState('');

  // Bước 1: Gửi OTP
  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: async (identifier: string) => {
      await authService.forgotPassword(identifier);
    },
  });

  // Bước 2: Verify OTP → returns resetToken
  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: async ({ identifier, otp }: { identifier: string; otp: string }) => {
      return authService.verifyOtp(identifier, otp);
    },
  });

  // Bước 3: Reset Password — requires resetToken
  const { mutate: submitResetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: async (variables: { identifier: string; newPassword: string; resetToken: string }) => {
      await authService.resetPassword(variables.identifier, variables.newPassword, variables.resetToken);
      showSuccessMessage(translate('formAuth.passwordChangedSuccess'));
      router.back();
    },
    onError: () => {
      showErrorMessage(translate('base.somethingWentWrong'));
    },
  });

  const handleRequestOTP = async (identifier: string) => {
    try {
      await sendOtp(identifier);
      setStep(2);
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_error) {
      showErrorMessage(translate('formAuth.accountNotFound'));
    }
  };

  const handleVerifyOTP = async (identifier: string, otp: string) => {
    try {
      const result = await verifyOtp({ identifier, otp });
      setResetToken(result.resetToken);
      setStep(3);
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_error) {
      showErrorMessage(translate('base.somethingWentWrong'));
    }
  };

  const handleResetPassword = (identifier: string, newPassword: string) => {
    submitResetPassword({ identifier, newPassword, resetToken });
  };

  return {
    step,
    setStep,
    resetToken,
    isSendingOtp,
    isVerifyingOtp,
    isResettingPassword,
    handleRequestOTP,
    handleVerifyOTP,
    handleResetPassword,
  };
}
