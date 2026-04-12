import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, TouchableOpacity, View } from 'react-native';

const SCENE_ICONS = [
  'weather-sunset',
  'weather-night',
  'home-outline',
  'home-export-outline',
  'movie-open-outline',
  'shield-alert-outline',
  'lightbulb-on-outline',
  'run',
  'lock-outline',
  'star-outline',
];

type TProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SceneIconPicker({ value, onChange }: TProps) {
  const selectedIcon = value;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="w-full"
      contentContainerStyle={{ paddingHorizontal: 4, gap: 12, paddingBottom: 12 }}
    >
      {SCENE_ICONS.map((iconName) => {
        const isSelected = selectedIcon === iconName;
        return (
          <TouchableOpacity
            key={iconName}
            onPress={() => onChange(iconName)}
            activeOpacity={0.7}
          >
            <View
              className={`size-14 items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[#10B981] bg-[#D1FAE5] dark:border-[#10B981] dark:bg-[#10B981]/20'
                  : 'border-transparent bg-white/80 dark:bg-white/10'
              }`}
            >
              <MaterialCommunityIcons
                name={iconName as any}
                size={28}
                color={isSelected ? '#10B981' : '#6B7280'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
