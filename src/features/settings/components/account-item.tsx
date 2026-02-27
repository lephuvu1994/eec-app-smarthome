import Entypo from '@expo/vector-icons/Entypo';
import { Link } from 'expo-router';
import { twMerge } from 'tailwind-merge';
import { useUniwind } from 'uniwind';
import {
  colors,
  Image,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';

export function AccountItem({
  fullName,
  email,
  image,
  isAccountDetail,
}: {
  fullName: string;
  email: string;
  isAccountDetail: boolean;
  image?: string;
}) {
  const { theme } = useUniwind();
  const iconColor
    = theme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  return (
    <Link href="/(app)/(settings)/account" asChild>
      <TouchableOpacity
        disabled={isAccountDetail}
        className={twMerge(
          'w-full flex-row items-center px-2 py-2',
          !isAccountDetail ? 'justify-between' : '',
        )}
      >
        {image && image.length > 1
          ? (
              <Image
                className="size-12 rounded-full"
                source={{
                  uri: image,
                }}
                style={{ width: 48, height: 48 }}
              />
            )
          : (
              <Image
                className="size-12 rounded-full"
                source={require('@@/assets/default_avatar.png')}
              />
            )}
        <View className="w-[80%] pl-2">
          <Text className="text-xl text-neutral-600 dark:text-white">
            {fullName}
          </Text>
          <Text className="text-primary-500 dark:text-primary-500">
            {email}
          </Text>
        </View>
        {!isAccountDetail
          ? (
              <View>
                <Entypo name="chevron-small-right" size={24} color={iconColor} />
              </View>
            )
          : null}
      </TouchableOpacity>
    </Link>
  );
}
