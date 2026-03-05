import { router } from 'expo-router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Button, Image, Text, TouchableOpacity, View } from '@/components/ui';
import { useUserManager } from '@/features/auth/user-store';
import { client } from '@/lib/api/common';
import { getLanguage, translate } from '@/lib/i18n';
import { ItemsContainer } from './components/items-container';

export function ProfileScreen() {
  const { signOut, userName, id: userId, avatar, email, phone } = useUserManager();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isViLanguage = getLanguage();
  const fullName = isViLanguage ? `${userName}` : `${userName}`;

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const revokeSessionResponse = await client.post(`/session/${userId}/revoke`);
      if (revokeSessionResponse.status === 200) {
        signOut();
      }
    }
    catch (error) {
      console.error(error);
      signOut();
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout>
      <View className="w-full flex-1 gap-4 px-4 pt-14">
        <ItemsContainer>
          <TouchableOpacity
            onPress={() => router.push('/(app)/(mobile)/(settings)/profile')}
            className={twMerge('w-full flex-row items-center gap-2 px-2 py-2')}
          >
            {avatar && avatar.length > 0
              ? (
                  <Image
                    className="size-12 rounded-full"
                    source={{
                      uri: avatar,
                    }}
                  />
                )
              : (
                  <Image className="size-12 rounded-full" source={require('@@/assets/default_avatar.png')} />
                )}
            <View className="w-[80%] pl-2">
              <Text className="text-xl text-neutral-600 dark:text-white">{fullName}</Text>
              <Text className="text-primary-500 dark:text-primary-500">{phone ?? email}</Text>
            </View>
          </TouchableOpacity>
        </ItemsContainer>
        <View className="w-full">
          <ItemsContainer>
            <Button
              onPress={handleLogout}
              loading={isLoading}
              size="default"
              label={translate('settings.logout')}
              className="my-0 bg-white py-0 dark:bg-transparent"
              textClassName="text-dark text-lg dark:text-white"
            />
          </ItemsContainer>
        </View>
      </View>
    </BaseLayout>
  );
}
