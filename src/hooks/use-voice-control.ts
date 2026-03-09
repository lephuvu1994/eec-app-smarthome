import { addSiriListener, updateSiriEntities } from '@@/modules/siri-intent';
import Env from '@env';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { EAuthStatus } from '@/features/auth/types/enum';
import { useUserManager } from '@/features/auth/user-store';
import { client } from '@/lib/api';

export function useVoiceControl() {
  const { status } = useUserManager();
  const url = Linking.useLinkingURL();

  const executeCommand = async (deviceId: string, action: string) => {
    try {
      const cmd = action.toLowerCase().includes('bật') || action.toUpperCase() === 'ON' ? 'ON' : 'OFF';
      await client.post('/devices/execute', { deviceId, command: cmd });
      console.log(`Executed: ${cmd} on ${deviceId}`);
    }
    catch (error) {
      console.error('Execute Error:', error);
    }
  };

  // 1. Sync Entities (iOS & Android Cloud)
  useEffect(() => {
    if (status === EAuthStatus.signIn) {
      const sync = async () => {
        if (Platform.OS === 'ios') {
          const res = await client.get('/devices/siri-sync');
          if (res.data)
            await updateSiriEntities(res.data);
        }
        else {
          await client.post('/google/request-sync');
        }
      };
      sync();
    }
  }, [status]);

  // 2. Listen Siri (iOS)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const sub = addSiriListener((event: { deviceId: string; action: string }) => {
        executeCommand(event.deviceId, event.action);
      });
      return () => sub.remove();
    }
  }, []);

  // 3. Listen Deep Link (Android) - Dùng useEffect với URL từ hook useURL
  useEffect(() => {
    if (Platform.OS === 'android' && url) {
      const data = Linking.parse(url);
      if (data.scheme === Env.EXPO_PUBLIC_SCHEME && data.hostname === 'control') {
        const { deviceId, action } = data.queryParams as { deviceId: string; action: string };
        if (deviceId && action)
          executeCommand(deviceId, action);
      }
    }
  }, [url]);
}
