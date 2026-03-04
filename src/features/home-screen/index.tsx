import React from 'react';
import Animated, { FadeInDown, SlideInRight, SlideInLeft, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from '@expo/vector-icons';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { View, Text, ScrollView, TouchableOpacity, Image } from '@/components/ui';

export function HomeScreen() {
  return (
    <BaseLayout>
    <Text>HomeScreen</Text>
    </BaseLayout>
  );
}
