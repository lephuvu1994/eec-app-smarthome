import type { TxKeyPath } from '@/lib/i18n';
import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { useUniwind } from 'uniwind';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { TimelineListScene } from './timeline-list-scene';

type Props = {
  contextType: 'home' | 'device';
  targetId: string;
  isModal?: boolean;
  fallbackDeviceName?: string;
};

export function TimelineTabView({ contextType, targetId, isModal, fallbackDeviceName }: Props) {
  const layout = useWindowDimensions();
  const { theme } = useUniwind();
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    { key: 'state', title: (translate('deviceDetail.timeline.filterState' as TxKeyPath)) as string },
    { key: 'connection', title: (translate('deviceDetail.timeline.filterConnection' as TxKeyPath)) as string },
  ]);

  const renderScene = React.useCallback(
    ({ route }: any) => {
      switch (route.key) {
        case 'state':
          return (
            <TimelineListScene
              type="state"
              contextType={contextType}
              targetId={targetId}
              isModal={isModal}
              fallbackDeviceName={fallbackDeviceName}
            />
          );
        case 'connection':
          return (
            <TimelineListScene
              type="connection"
              contextType={contextType}
              targetId={targetId}
              isModal={isModal}
              fallbackDeviceName={fallbackDeviceName}
            />
          );
        default:
          return null;
      }
    },
    [contextType, targetId, isModal, fallbackDeviceName],
  );

  const renderTabBar = (props: any) => (
    <View className="mb-2">
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: '#3B82F6',
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
        style={{
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme === ETheme.Dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
        activeColor="#3B82F6"
        inactiveColor={theme === ETheme.Dark ? '#8E8E93' : '#8E8E93'}
        labelStyle={{
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'none',
        }}
        pressColor="transparent"
      />
    </View>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      style={{ flex: 1 }}
    />
  );
}
