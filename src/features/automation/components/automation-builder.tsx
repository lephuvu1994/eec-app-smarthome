import React, { useState } from 'react';
import { View, Text, Switch, TextInput } from 'react-native';
import { RepeatSelector } from './repeat-selector';

// Placeholder for an actual time picker library component
const TimePicker = ({ time, onChange }: { time: string, onChange: (val: string) => void }) => {
  return (
    <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mt-4">
      <Text className="text-lg font-bold text-gray-800">Choose Time</Text>
      <TextInput 
        value={time} 
        onChangeText={onChange} 
        placeholder="HH:mm" 
        className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-lg"
      />
    </View>
  );
};

export function AutomationBuilder() {
  const [isSchedule, setIsSchedule] = useState(true); // false = timer, true = schedule
  const [time, setTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  // Dummy Action State
  const [targetType, setTargetType] = useState('DEVICE_ENTITY');
  const [targetId, setTargetId] = useState('switch_1');
  const [actionState, setActionState] = useState(1);

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-black mb-6">Tạo Tự động hóa</Text>

      {/* Mode Switcher */}
      <View className="flex-row items-center justify-between bg-gray-100 p-2 rounded-lg mb-6">
        <Text className="text-gray-600 font-semibold px-4">Đếm ngược (Timer)</Text>
        <Switch 
          value={isSchedule} 
          onValueChange={setIsSchedule}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isSchedule ? '#f5dd4b' : '#f4f3f4'}
        />
        <Text className="text-gray-600 font-semibold px-4">Lặp lại (Schedule)</Text>
      </View>

      {/* Time & Repeat config */}
      <View className="mb-8">
        <Text className="text-lg font-bold">1. {isSchedule ? 'Thời điểm kích hoạt' : 'Đếm ngược kết thúc'}</Text>
        <TimePicker time={time} onChange={setTime} />
        
        {isSchedule && (
          <RepeatSelector selectedDays={selectedDays} onChange={setSelectedDays} />
        )}
      </View>

      {/* Target Config */}
      <View className="mb-8">
         <Text className="text-lg font-bold mb-4">2. Thực hiện hành động</Text>
         <View className="p-4 bg-gray-50 rounded-xl border border-gray-200">
           <Text className="font-semibold text-gray-700">Mục tiêu: Đèn phòng khách</Text>
           <View className="flex-row items-center justify-between mt-4">
             <Text className="text-gray-500">Bật / Tắt</Text>
             <Switch 
               value={actionState === 1} 
               onValueChange={(val) => setActionState(val ? 1 : 0)} 
             />
           </View>
         </View>
      </View>

    </View>
  );
}
