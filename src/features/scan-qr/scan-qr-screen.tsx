import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusAwareStatusBar, ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { ScanOverlay } from '@/features/scan-qr/scan-overlay';
import { translate } from '@/lib/i18n';

const RE_INACTIVE = /inactive|background/;

export function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);

  const qrLockRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  // Reset qrLock khi app trở lại foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && RE_INACTIVE.test(appStateRef.current)) {
        qrLockRef.current = false;
      }
      appStateRef.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (!data || qrLockRef.current)
      return;
    qrLockRef.current = true;
    cameraRef.current?.pausePreview();

    setScannedData(data);

    // Thử parse JSON, nếu không được thì hiển thị raw string
    try {
      const parsed = JSON.parse(data);
      setParsedData(parsed);
    }
    catch {
      setParsedData(null);
    }
  }, []);

  const handleRescan = useCallback(() => {
    setScannedData(null);
    setParsedData(null);
    qrLockRef.current = false;
    cameraRef.current?.resumePreview();
  }, []);

  // ─── Chưa có quyền camera ───
  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <FocusAwareStatusBar />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <FocusAwareStatusBar />
        <Stack.Screen
          options={{
            title: translate('scanQr.title'),
            headerShown: true,
            headerTransparent: true,
            headerTintColor: '#fff',
            headerBackTitle: '',
          }}
        />
        <MaterialCommunityIcons name="camera-off" size={64} color="#888" />
        <Text style={styles.permissionText}>
          {translate('scanQr.needCameraPermission')}
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{translate('scanQr.allowCamera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{translate('base.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Đã quét xong → Hiển thị kết quả ───
  if (scannedData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <FocusAwareStatusBar />
        <Stack.Screen
          options={{
            title: translate('scanQr.resultTitle'),
            headerShown: true,
            headerTransparent: true,
            headerTintColor: '#fff',
            headerBackTitle: '',
          }}
        />

        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color="#10B981" />
            <Text style={styles.resultTitle}>{translate('scanQr.scanSuccess')}</Text>
          </View>

          <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
            {/* Raw data */}
            <Text style={styles.sectionLabel}>{translate('scanQr.rawData')}</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText} selectable>{scannedData}</Text>
            </View>

            {/* Parsed JSON (nếu có) */}
            {parsedData && (
              <>
                <Text style={styles.sectionLabel}>{translate('scanQr.parsedJson')}</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText} selectable>
                    {JSON.stringify(parsedData, null, 2)}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rescanButton} onPress={handleRescan}>
              <MaterialCommunityIcons name="qrcode-scan" size={20} color="#fff" />
              <Text style={styles.rescanButtonText}>{translate('scanQr.rescan')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Text style={styles.closeButtonText}>{translate('scanQr.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── Camera đang quét ───
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#fff',
          headerBackTitle: '',
        }}
      />

      <CameraView
        ref={cameraRef}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <ScanOverlay />

      {/* Instruction text */}
      <View style={[styles.instructionContainer, { bottom: insets.bottom + 80 }]}>
        <Text style={styles.instructionText}>
          {translate('scanQr.instruction')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  // Permission
  permissionText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#888',
    fontSize: 14,
  },
  // Instruction
  instructionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Result
  resultContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  resultTitle: {
    color: '#10B981',
    fontSize: 22,
    fontWeight: '700',
  },
  resultScroll: {
    flex: 1,
  },
  sectionLabel: {
    color: '#999',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  codeBlock: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  codeText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  rescanButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  closeButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
});
