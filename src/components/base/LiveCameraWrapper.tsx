import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { ActivityIndicator, Image, Text, TouchableOpacity, View } from '@/components/ui';
import { PulseDot } from './PulseDot';
import VideoVLCStream from './VideoVLCStream';

type Props = {
  videoUrl?: string;
  imageUrl?: string;
  defaultImage?: string;
  handleError: () => void;
  autoPlay?: boolean;
};

export const LiveCameraWrapper = React.memo(({ videoUrl, imageUrl, defaultImage, handleError, autoPlay = false }: Props) => {
  const [isFailedRTS, setIsFailedRTS] = useState<boolean>(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState<boolean>(autoPlay);
  const navigation = useNavigation();

  // Reset play state when leaving the screen to preserve resources & UX
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setIsReadyToPlay(autoPlay);
    });
    return unsubscribe;
  }, [navigation, autoPlay]);

  return (
    <View className="relative z-50 size-full overflow-hidden rounded-xl border-neutral-300 bg-slate-400 dark:bg-neutral-900">
      {/* Thumbnail rendering block */}
      {!isReadyToPlay && (
        <TouchableOpacity
          activeOpacity={0.8}
          className="relative aspect-video size-full items-center justify-center"
          onPress={() => {
            if (videoUrl)
              setIsReadyToPlay(true);
          }}
        >
          {imageUrl
            ? (
                <Image
                  className="absolute inset-0 size-full rounded-t-xl"
                  style={{ width: '100%', aspectRatio: 16 / 9 }}
                  contentFit="cover"
                  source={{ uri: imageUrl }}
                />
              )
            : defaultImage
              ? (
                  <Image
                    className="absolute inset-0 size-full rounded-t-xl"
                    style={{ width: '100%', aspectRatio: 16 / 9 }}
                    contentFit="cover"
                    source={{ uri: defaultImage }}
                    cachePolicy="memory-disk"
                    transition={500}
                  />
                )
              : (
                  <Image
                    className="absolute inset-0 size-full rounded-t-xl"
                    style={{ width: '100%', aspectRatio: 16 / 9 }}
                    contentFit="cover"
                    source={require('@@/assets/room/default_camera.webp')}
                    cachePolicy="memory-disk"
                    transition={500}
                  />
                )}

          {/* Semi-transparent overlay and Play Button */}
          <View className="absolute inset-0 bg-black/30" />
          <View className="flex-row items-center justify-center rounded-full bg-white/20 p-2">
            <MaterialCommunityIcons name="play-circle" size={56} color="white" />
          </View>
        </TouchableOpacity>
      )}

      {/* Video playing block (only rendered when tapped or autoPlay=true) */}
      {isReadyToPlay && videoUrl && videoUrl.length > 0 && (
        <View className="size-full">
          {imageUrl && (
            <Image
              className="absolute inset-0 size-full opacity-20"
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              contentFit="cover"
              source={{ uri: imageUrl }}
            />
          )}

          {!isFailedRTS && (
            <ActivityIndicator className="absolute top-0 left-0 z-2 size-full" color="#0891b2" />
          )}

          <VideoVLCStream
            videoUrl={videoUrl}
            imageUrl={imageUrl}
            setIsFailedRTS={setIsFailedRTS}
            handleError={handleError}
          />

          <View className="absolute top-2 right-2 flex-row items-center rounded-full bg-white/10 px-2 py-1 dark:bg-black/10">
            <PulseDot color="red" size={8} duration={600} maxScale={2} style={{ marginRight: 4 }} />
            <Text className="text-xs font-bold text-white">LIVE</Text>
          </View>

          {/* Timeline Placeholder Button */}
          <TouchableOpacity
            className="absolute right-2 bottom-2 items-center justify-center rounded-full bg-black/50 p-2"
            onPress={() => console.log('Timeline slider opened')}
          >
            <MaterialCommunityIcons name="history" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});
