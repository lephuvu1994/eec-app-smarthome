/**
 * Device List Screen — shows devices grouped by room + scenes list
 * Uses hooks only, no direct API calls
 */
import type { Device } from '@/lib/api/devices/device.service';
import type { Scene } from '@/lib/api/scenes/scene.service';

import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDevices } from '@/hooks/use-devices';
import { useHomes } from '@/hooks/use-homes';
import { useRunScene, useScenes } from '@/hooks/use-scenes';

// ============================================================
// DEVICE CARD
// ============================================================
function DeviceCard({ device }: { device: Device }) {
  const isOnline = device.status === 'online';

  return (
    <View style={[styles.card, !isOnline && styles.cardOffline]}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.deviceName} numberOfLines={1}>
          {device.name}
        </Text>
      </View>
      {device.room && (
        <Text style={styles.roomLabel}>📍 {device.room.name}</Text>
      )}
      <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
}

// ============================================================
// SCENE CARD
// ============================================================
function SceneCard({ scene, onRun }: { scene: Scene; onRun: (id: string) => void }) {
  return (
    <TouchableOpacity style={styles.sceneCard} onPress={() => onRun(scene.id)}>
      <Text style={styles.sceneIcon}>▶</Text>
      <Text style={styles.sceneName} numberOfLines={1}>
        {scene.name}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================
// ROOM SECTION
// ============================================================
type RoomGroup = {
  roomName: string;
  devices: Device[];
};

// ============================================================
// MAIN SCREEN
// ============================================================
export function DeviceListScreen() {
  // -- Fetch homes to get first home --
  const { data: homes, isLoading: homesLoading } = useHomes();
  const firstHomeId = homes?.[0]?.id ?? '';

  // -- Fetch devices & scenes --
  const {
    data: deviceRes,
    isLoading: devicesLoading,
    refetch: refetchDevices,
  } = useDevices({ homeId: firstHomeId || undefined });

  const {
    data: scenes,
    refetch: refetchScenes,
  } = useScenes(firstHomeId);

  const runScene = useRunScene();

  const [refreshing, setRefreshing] = useState(false);

  // -- Group devices by room --
  const roomGroups = useMemo<RoomGroup[]>(() => {
    const devices = deviceRes?.data ?? [];
    const grouped = new Map<string, Device[]>();

    devices.forEach((d) => {
      const roomName = d.room?.name ?? 'Không có phòng';
      if (!grouped.has(roomName)) grouped.set(roomName, []);
      grouped.get(roomName)!.push(d);
    });

    return Array.from(grouped.entries(), ([roomName, devs]) => ({
      roomName,
      devices: devs,
    }));
  }, [deviceRes]);

  // -- Handlers --
  const handleRunScene = (sceneId: string) => {
    runScene.mutate(sceneId, {
      onSuccess: () => Alert.alert('Thành công', 'Scene đang được thực thi'),
      onError: (err) => Alert.alert('Lỗi', err.message),
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDevices(), refetchScenes()]);
    setRefreshing(false);
  };

  // -- Loading --
  if (homesLoading || devicesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // -- Empty state --
  if (!firstHomeId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Chưa có nhà nào. Hãy tạo nhà trước.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      data={roomGroups}
      keyExtractor={(item) => item.roomName}
      ListHeaderComponent={
        <>
          {/* SCENES SECTION */}
          {scenes && scenes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎬 Scene ({scenes.length})</Text>
              <FlatList
                horizontal
                data={scenes}
                keyExtractor={(s) => s.id}
                renderItem={({ item }) => (
                  <SceneCard scene={item} onRun={handleRunScene} />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sceneList}
              />
            </View>
          )}

          {/* DEVICE COUNT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📱 Thiết bị ({deviceRes?.meta?.total ?? 0})
            </Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.roomSection}>
          <Text style={styles.roomTitle}>{item.roomName}</Text>
          {item.devices.map((d) => (
            <DeviceCard key={d.id} device={d} />
          ))}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>Chưa có thiết bị nào</Text>
        </View>
      }
    />
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },

  // Scene
  sceneList: {
    gap: 10,
  },
  sceneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  sceneIcon: {
    color: '#fff',
    fontSize: 14,
  },
  sceneName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 120,
  },

  // Room
  roomSection: {
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Device card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardOffline: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#22c55e',
  },
  dotOffline: {
    backgroundColor: '#94a3b8',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  roomLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
});
