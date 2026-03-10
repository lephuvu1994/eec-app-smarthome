import * as React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { TouchableOpacity, View } from '@/components/ui';

type TVideoProps = {
  videoUrl: string;
  handleError: () => void;
  setIsFailedRTS: React.Dispatch<React.SetStateAction<boolean>>;
  imageUrl: string | undefined;
};

const VideoStreamComponent = memo(({
  videoUrl,
  imageUrl,
  handleError,
  setIsFailedRTS,
}: TVideoProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const opacityValue = useSharedValue(0.2);

  useEffect(() => {
    opacityValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true,
    );
  }, []);

  const handleErrorRTS = useCallback(() => {
    setIsLoading(false);
    setIsFailedRTS(true);
    if (!imageUrl || imageUrl === '') {
      handleError();
    }
  }, [imageUrl, handleError, setIsFailedRTS]);

  return (
    <View className="absolute top-0 left-0 z-1 size-full">
      <TouchableOpacity disabled={isLoading}>
        <VLCPlayer
          ref={videoRef}
          style={{
            width: '100%',
            zIndex: 50,
            height: 'auto',
            aspectRatio: 16 / 9,
          }}
          videoAspectRatio="16:9"
          resizeMode="fill"
          source={{
            uri: videoUrl,
          }}
          muted={false}
          onPlaying={() => {
            setIsLoading(false);
            console.log('playing');
          }}
          onEnd={() => {
            console.log('end');
          }}
          onStopped={() => {
            console.log('stopped');
          }}
          onLoad={() => {
            console.log('load');
          }}
          onError={handleErrorRTS}
          onPaused={() => {
            console.log('paused');
          }}
          onBuffering={() => {
            console.log('buffering');
          }}
        />
      </TouchableOpacity>
    </View>
  );
});

export default VideoStreamComponent;
