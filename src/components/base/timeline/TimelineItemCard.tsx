import { TDeviceTimelineItem } from '@/types/device';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import * as React from 'react';
import { Text, View } from 'react-native';
import { EDeviceTimelineEvent, EDeviceTimelineSource, EDeviceTimelineType } from '@/types/device';
import { translate } from '@/lib/i18n';

type TimelineItemCardProps = {
  item: TDeviceTimelineItem;
  isDark?: boolean;
  isLast?: boolean;
  fallbackDeviceName?: string;
  isModal?: boolean; // If true, different border/padding styling
};

export const TimelineItemCard: React.FC<TimelineItemCardProps> = ({ item, isLast, fallbackDeviceName, isModal }) => {
  const isMain = item.entityCode === 'main';
  const deviceNameStr = item.deviceName || fallbackDeviceName || '';

  let finalPrefixName = '';
  if (isMain && deviceNameStr) {
    finalPrefixName = deviceNameStr; // Prefer Device Name for 'main' entity
  }
  else {
    finalPrefixName = item.entityName || deviceNameStr || '';
  }

  // Get localized Action Event Name
  let actionStatusText = '';
  if (item.type === EDeviceTimelineType.Connection) {
    actionStatusText = item.event === EDeviceTimelineEvent.Online
      ? (translate('deviceDetail.timeline.deviceOnline' as TxKeyPath) as string)
      : (translate('deviceDetail.timeline.deviceOffline' as TxKeyPath) as string);
  }
  else {
    // e.g. Open -> "Mở"
    const eventKey = `deviceDetail.timeline.events.${item.event.toLowerCase()}`;
    const transEvent = translate(eventKey as TxKeyPath);
    actionStatusText = transEvent !== eventKey ? (transEvent as string) : item.event;
  }

  // Source & User Logic
  let sourceIconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle-outline';
  let sourceIconColor = '#9CA3AF'; // neutral
  let sourceText = '';

  if (item.type === EDeviceTimelineType.Connection) {
    sourceIconName = 'server-network';
    sourceIconColor = '#3B82F6';
    sourceText = translate('deviceDetail.timeline.sources.system' as TxKeyPath) || 'Hệ thống';
  }
  else if (item.source) {
    switch (item.source) {
      case EDeviceTimelineSource.App:
        sourceIconName = 'cellphone';
        sourceIconColor = '#3B82F6';
        break;
      case EDeviceTimelineSource.Physical:
        sourceIconName = 'gesture-tap-button';
        sourceIconColor = '#F59E0B';
        break;
      case EDeviceTimelineSource.RF:
        sourceIconName = 'remote';
        sourceIconColor = '#10B981';
        break;
      case EDeviceTimelineSource.Voice:
        sourceIconName = 'microphone';
        sourceIconColor = '#8B5CF6';
        break;
      case EDeviceTimelineSource.Automation:
        sourceIconName = 'robot-outline';
        sourceIconColor = '#EAB308';
        break;
      case EDeviceTimelineSource.System:
        sourceIconName = 'server-network';
        sourceIconColor = '#3B82F6';
        break;
      default:
        sourceIconName = 'information-outline';
        break;
    }

    // Try translating source
    const sourceKey = `deviceDetail.timeline.sources.${item.source.toLowerCase()}`;
    const transSource = translate(sourceKey as TxKeyPath);
    sourceText = transSource !== sourceKey ? (transSource as string) : item.source;

    // Handle user formatting if source is App/Voice and we have user info
    if (item.actionBy && (item.source === EDeviceTimelineSource.App || item.source === EDeviceTimelineSource.Voice)) {
      if (item.actionBy.userName) {
        sourceText = item.actionBy.userName;
      }
      else if (item.actionBy.userEmail) {
        const parts = item.actionBy.userEmail.split('@');
        let masked = item.actionBy.userEmail;
        if (parts.length > 0) {
          const namePart = parts[0];
          if (namePart.length > 3) {
            masked = `${namePart.substring(0, 3)}***@${parts[1] || ''}`;
          }
          else {
            masked = `${namePart}***@${parts[1] || ''}`;
          }
        }
        else {
          masked = `${item.actionBy.userEmail.substring(0, 3)}***`;
        }
        sourceText = masked;
      }
      else if (item.actionBy.userPhone) {
        const phone = item.actionBy.userPhone;
        if (phone.length >= 5) {
          sourceText = `${phone.substring(0, 3)}***${phone.substring(phone.length - 2)}`;
        }
        else {
          sourceText = `${phone}***`;
        }
      }
      else {
        sourceText = 'User';
      }
    }
  }

  const renderMainIcon = () => {
    if (item.type === EDeviceTimelineType.Connection) {
      const isOnline = item.event === EDeviceTimelineEvent.Online;
      return (
        <View className={`size-10 shrink-0 items-center justify-center rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <MaterialCommunityIcons
            name={isOnline ? 'wifi' : 'wifi-off'}
            size={20}
            color={isOnline ? '#10B981' : '#EF4444'}
          />
        </View>
      );
    }

    let iconName: any = 'information-outline';
    let iconColor = '#3B82F6';
    let bgClass = 'bg-blue-500/20';

    const evt = item.event.toLowerCase();

    const isLockEvent = evt.includes('childlock') || item.entityCode?.toLowerCase().includes('child_lock') || evt.includes('lock');
    if (isLockEvent) {
      const isLockOn = evt.includes('on') || evt === '1' || evt === 'locked' || evt === 'lock';
      iconName = isLockOn ? 'lock' : 'lock-open-variant';
      iconColor = isLockOn ? '#EF4444' : '#10B981';
      bgClass = isLockOn ? 'bg-red-500/20' : 'bg-green-500/20';
    }
    else if (evt === 'on') {
      iconName = 'power-on';
      iconColor = '#10B981';
      bgClass = 'bg-green-500/20';
    }
    else if (evt === 'off') {
      iconName = 'power-sleep';
      iconColor = '#EF4444';
      bgClass = 'bg-red-500/20';
    }
    else if (evt === 'open') {
      iconName = 'door-open';
      iconColor = '#10B981';
      bgClass = 'bg-green-500/20';
    }
    else if (evt === 'close') {
      iconName = 'door-closed';
      iconColor = '#EF4444';
      bgClass = 'bg-red-500/20';
    }
    else if (evt === 'pause' || evt === 'stop') {
      iconName = 'pause';
      iconColor = '#F59E0B';
      bgClass = 'bg-amber-500/20';
    }

    return (
      <View className={`size-10 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      </View>
    );
  };

  const containerClass = isModal
    ? `mb-3 flex-row items-start gap-3 ${!isLast ? 'border-b border-black/5 pb-3 dark:border-neutral-800' : ''}`
    : `flex-row items-start gap-3`;

  return (
    <View className={containerClass}>
      {/* Left Column (Icon + Time) */}
      <View className="w-12 shrink-0 flex-col items-center justify-start gap-1">
        {renderMainIcon()}
        <Text className="text-[10px] font-medium text-neutral-500 dark:text-neutral-500">
          {dayjs(item.createdAt).format('HH:mm:ss')}
        </Text>
      </View>

      {/* Right Column (Descriptions) */}
      <View className="flex-1 shrink flex-col justify-center gap-0.5">
        {!!finalPrefixName && (
          <Text className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100" numberOfLines={1}>
            {finalPrefixName}
          </Text>
        )}
        <Text className={`text-xs font-medium text-neutral-600 dark:text-neutral-300 ${!finalPrefixName ? 'text-sm/5 text-neutral-800 dark:text-neutral-200' : 'mt-0.5'}`}>
          {item.type === EDeviceTimelineType.Connection ? actionStatusText : `Trạng thái: ${actionStatusText}`}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          {item.actionBy?.userAvatar
            ? (
                <Image
                  source={{ uri: item.actionBy.userAvatar }}
                  className="size-[14px] shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
                  contentFit="cover"
                />
              )
            : (
                <MaterialCommunityIcons name={sourceIconName as any} size={14} color={sourceIconColor} />
              )}
          <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
            {sourceText || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
};
