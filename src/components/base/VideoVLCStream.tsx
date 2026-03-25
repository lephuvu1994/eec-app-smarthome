import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
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
  const isFocused = useIsFocused();

  const handleErrorRTS = useCallback(() => {
    setIsLoading(false);
    setIsFailedRTS(true);
    if (!imageUrl || imageUrl === '') {
      handleError();
    }
  }, [imageUrl, handleError, setIsFailedRTS]);

  const playerElement = useMemo(() => {
    if (!isFocused) return null;

    return (
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
    );
  }, [videoUrl, handleErrorRTS, isFocused]);

  return (
    <View className="absolute top-0 left-0 z-1 size-full">
      <TouchableOpacity disabled={isLoading}>
        {playerElement}
      </TouchableOpacity>
    </View>
  );
});

export default VideoStreamComponent;
