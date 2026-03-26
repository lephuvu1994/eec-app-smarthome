import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { FontAwesome5 } from '@expo/vector-icons';
import { ActivityIndicator, View as RNView, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';
import { useClimateControl } from '@/features/devices/hooks/use-climate-control';

export function ClimateModalItem({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const { isOn, isLoading, targetTemp, handleToggle, handleIncreaseTemp, handleDecreaseTemp } = useClimateControl(device, entity);

  // Colors based on state
  const containerBg = isOn ? 'bg-[#3B82F6]' : 'bg-neutral-100 dark:bg-neutral-800';
  const textColor = isOn ? 'text-white' : 'text-neutral-800 dark:text-white';
  const controlBtnBg = isOn ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700';

  return (
    <RNView className={`h-24 w-full flex-row items-center justify-between rounded-xl p-4 ${containerBg}`}>
      {/* Power Toggle Area */}
      <TouchableOpacity 
        className="flex-1 flex-row items-center space-x-3" 
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <View className={`items-center justify-center size-10 rounded-full ${isOn ? 'bg-white' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
          {isLoading ? (
            <ActivityIndicator size="small" color={isOn ? '#3B82F6' : '#999'} />
          ) : (
            <FontAwesome5 name="power-off" size={16} color={isOn ? '#3B82F6' : '#fff'} />
          )}
        </View>
        <View>
          <Text className={`text-lg font-bold ${textColor}`}>
            {entity.name || entity.code}
          </Text>
          <Text className={`text-sm ${isOn ? 'text-blue-100' : 'text-neutral-500'}`}>
            {isOn ? `Target: ${targetTemp}°C` : 'Off'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Temp Controls */}
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity 
          className={`items-center justify-center size-10 rounded-full ${controlBtnBg}`}
          onPress={handleDecreaseTemp}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="minus" size={14} color={isOn ? '#fff' : '#888'} />
        </TouchableOpacity>
        
        <Text className={`w-10 text-center text-xl font-bold ${textColor}`}>
          {targetTemp}°
        </Text>
        
        <TouchableOpacity 
          className={`items-center justify-center size-10 rounded-full ${controlBtnBg}`}
          onPress={handleIncreaseTemp}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="plus" size={14} color={isOn ? '#fff' : '#888'} />
        </TouchableOpacity>
      </View>
    </RNView>
  );
}
