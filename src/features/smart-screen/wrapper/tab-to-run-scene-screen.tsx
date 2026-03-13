import type { TSceneCard } from '../components/sortable-scene-grid';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { showSuccessMessage, Text, View } from '@/components/ui';
import { SortableSceneGrid } from '../components/sortable-scene-grid';

// ─── Static Data (sẽ thay bằng API sau) ─────────────────────────────────────

const TAP_TO_RUN_CARDS: TSceneCard[] = [
  {
    key: 'tap-all-on',
    title: 'Bật tất cả',
    colSpan: 1,
    cardColor: '#ECFDF5',
    iconBgColor: '#D1FAE5',
    textColor: '#065F46',
    menuIconColor: '#10B981',
    icon: <MaterialCommunityIcons name="lightning-bolt" size={20} color="#10B981" />,
  },
  {
    key: 'tap-all-off',
    title: 'Tắt tất cả',
    colSpan: 1,
    cardColor: '#FEF2F2',
    iconBgColor: '#FEE2E2',
    textColor: '#991B1B',
    menuIconColor: '#EF4444',
    icon: <MaterialCommunityIcons name="power" size={20} color="#EF4444" />,
  },
  {
    key: 'tap-movie',
    title: 'Chế độ xem phim',
    colSpan: 1,
    cardColor: '#1F2937',
    iconBgColor: '#374151',
    textColor: '#F9FAFB',
    menuIconColor: '#9CA3AF',
    showGlossyEffect: true,
    icon: <MaterialCommunityIcons name="movie-open-outline" size={20} color="#A78BFA" />,
  },
  {
    key: 'tap-sleep',
    title: 'Đi ngủ',
    colSpan: 1,
    cardColor: '#EFF6FF',
    iconBgColor: '#DBEAFE',
    textColor: '#1E3A8A',
    menuIconColor: '#60A5FA',
    icon: <MaterialCommunityIcons name="weather-night" size={20} color="#3B82F6" />,
  },
  {
    key: 'tap-eco',
    title: 'Chế độ tiết kiệm điện toàn nhà',
    colSpan: 2,
    bgGradient: ['#34D399', '#059669'],
    textColor: '#FFFFFF',
    menuIconColor: '#FFFFFF',
    iconBgColor: 'rgba(255,255,255,0.2)',
    showGlossyEffect: true,
    icon: <MaterialCommunityIcons name="leaf" size={22} color="#FFFFFF" />,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type TProps = {
  className?: string;
};

export const TapToRunSceneWrapper: React.FC<TProps> = ({ className }) => {
  // TODO: thay bằng useMutation khi có API endpoint
  const handleRunScene = useCallback((card: TSceneCard) => {
    // TODO: gọi API chạy scene
    // runSceneMutation.mutate({ sceneId: card.key });
    showSuccessMessage(`Đang chạy: ${card.title}`);
  }, []);

  return (
    <ScrollView
      className={className}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Grid drag & drop — có onCardPress → card pressable để chạy scene */}
      <SortableSceneGrid
        initialCards={TAP_TO_RUN_CARDS}
        onCardPress={handleRunScene}
      />

      {/* --- FOOTER INFO --- */}
      <View className="mt-6 mb-2 w-full flex-row flex-wrap items-center justify-center px-4">
        <Text className="text-sm text-[#6B7280]">Nhấn vào card để chạy kịch bản tức thì</Text>
      </View>
    </ScrollView>
  );
};
