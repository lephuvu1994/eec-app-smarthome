import { MaterialCommunityIcons } from '@expo/vector-icons';

import { router, Stack } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

function SettingScreen() {
  const { theme } = useUniwind();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] } }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '',
          headerTitleAlign: 'center',
          headerRight: () => (
            <View className="flex-row items-center gap-5 px-1">
              {/* Button 1: Notifications */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {}}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialCommunityIcons name="line-scan" size={20} color={theme === 'dark' ? '#fff' : '#1B1B1B'} />
              </TouchableOpacity>
              {/* Button 2: General / Preferences */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(app)/(mobile)/(settings)/general' as any)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialCommunityIcons name="tune-variant" size={20} color={theme === 'dark' ? '#fff' : '#1B1B1B'} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          headerTransparent: true,
          title: translate('settings.userInformation'),
          headerTintColor: theme === ETheme.Dark ? colors.white : '#1B1B1B',
          headerTitleStyle: {
            color: theme === ETheme.Dark ? colors.white : '#1B1B1B',
            fontWeight: '600', // Sẵn tiện cho nó đậm lên tí nhìn cho sang
          },
          headerBackTitle: '',
        }}
      />
      <Stack.Screen
        name="homeManagement"
        options={{
          headerShown: true,
          headerTransparent: true,
          title: translate('settings.homeManagement'),
          headerTitleAlign: 'center',
          headerTintColor: theme === 'dark' ? '#ffffff' : '#1B1B1B',
          headerTitleStyle: {
            color: theme === 'dark' ? '#ffffff' : '#1B1B1B',
            fontWeight: '600', // Sẵn tiện cho nó đậm lên tí nhìn cho sang
          },
          headerBackTitle: '',
        }}
      />
      <Stack.Screen
        name="general"
        options={{
          headerShown: true,
          headerTransparent: true,
          title: translate('settings.general.title'),
          headerTitleAlign: 'center',
          headerTintColor: theme === 'dark' ? '#ffffff' : '#1B1B1B',
          headerTitleStyle: {
            color: theme === 'dark' ? '#ffffff' : '#1B1B1B',
            fontWeight: '600', // Sẵn tiện cho nó đậm lên tí nhìn cho sang
          },
          headerBackTitle: '',
        }}
      />
    </Stack>
  );
}

export default SettingScreen;
