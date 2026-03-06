import * as React from 'react';
import { useState } from 'react';
import Animated from 'react-native-reanimated';

import { ActivityIndicator, Image, Text, View } from '@/components/ui';
import { PulseDot } from './PulseDot';
import VideoVLCStream from './VideoVLCStream';

type Props = {
  videoUrl?: string;
  imageUrl?: string;
  defaultImage?: string;
  handleError: () => void;
};

export function LiveCameraWrapper({ videoUrl, imageUrl, defaultImage, handleError }: Props) {
  const [isFailedRTS, setIsFailedRTS] = useState<boolean>(false);

  return (
    <Animated.View className="relative z-50 size-full overflow-hidden rounded-xl border-neutral-300 bg-slate-400 dark:bg-neutral-900">
      {imageUrl
        ? (
            <View className="w-full rounded-t-xl">
              <Image
                className="w-full rounded-t-xl"
                style={{
                  width: '100%',
                  aspectRatio: 16 / 9,
                  opacity: isFailedRTS || !videoUrl || videoUrl.length === 0 ? 1 : 0.2,
                }}
                source={{ uri: imageUrl }}
              />
            </View>
          )
        : defaultImage
          ? (
              <Image
                className="w-full rounded-t-xl"
                style={{
                  width: '100%',
                  aspectRatio: 16 / 9,
                }}
                contentFit="cover"
                source={{ uri: defaultImage }}
                cachePolicy="memory-disk"
                transition={500}
              />
            )
          : (
              <Image
                className="w-full rounded-t-xl"
                style={{
                  width: '100%',
                  aspectRatio: 16 / 9,
                }}
                contentFit="cover"
                source={require('@@/assets/room/default_image.png')}
                cachePolicy="memory-disk"
                transition={500}
              />
            )}
      {videoUrl && videoUrl.length > 0 && !isFailedRTS
        ? (
            <ActivityIndicator className="absolute top-0 left-0 z-2 size-full" color="#0891b2" />
          )
        : null}
      {videoUrl && videoUrl.length > 0
        ? (
            <>
              <VideoVLCStream
                videoUrl={videoUrl}
                imageUrl={imageUrl}
                setIsFailedRTS={setIsFailedRTS}
                handleError={handleError}
              />
              <View className="absolute top-2 right-2 flex-row items-center rounded-full bg-white/10 px-2 py-1 dark:bg-black/10">
                <PulseDot
                  color="red"
                  size={8}
                  duration={600}
                  maxScale={2}
                  style={{ marginRight: 4 }}
                />
                <Text className="text-xs font-bold text-white">LIVE</Text>
              </View>
            </>
          )
        : null}
    </Animated.View>
  );
}
