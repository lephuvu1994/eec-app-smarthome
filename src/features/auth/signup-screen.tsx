import { useHeaderHeight } from '@react-navigation/elements';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BaseLayout } from '@/components/layout/BaseLayout';
import {
  Image,
  Text,
  View,
} from '@/components/ui';
import { SignUpForm } from '@/features/auth/components/signup-form';

export function SignUp() {
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={require('@@/assets/sign-in/background-signIn.webp')}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          contentFit="cover"
        />
        <View className="gap-6 px-4" style={{ paddingTop: top + headerHeight - 32 }}>
          <Image
            source={require('@@/assets/short_logo.webp')}
            style={{
              width: 60,
              height: 60,
            }}
            contentFit="cover"
          />
          <Text className="text-4xl font-bold text-[#1B1B1B]" tx="formAuth.titleSignUp" />
        </View>
        <SignUpForm />
      </View>
    </BaseLayout>
  );
}
