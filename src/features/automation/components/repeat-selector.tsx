import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const DAYS_OF_WEEK = [
  { label: 'T2', value: 1 },
  { label: 'T3', value: 2 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 4 },
  { label: 'T6', value: 5 },
  { label: 'T7', value: 6 },
  { label: 'CN', value: 0 },
];

interface RepeatSelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export function RepeatSelector({ selectedDays, onChange }: RepeatSelectorProps) {
  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      onChange(selectedDays.filter((d) => d !== dayValue));
    } else {
      onChange([...selectedDays, dayValue].sort());
    }
  };

  return (
    <View className="flex-row justify-between w-full mt-4">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selectedDays.includes(day.value);
        return (
          <TouchableOpacity
            key={day.value}
            onPress={() => toggleDay(day.value)}
            className={`w-10 h-10 rounded-full items-center justify-center border border-gray-300 ${
              isSelected ? 'bg-primary border-primary' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isSelected ? 'text-white' : 'text-gray-500'
              }`}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
