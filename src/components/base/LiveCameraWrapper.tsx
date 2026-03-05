import React, { useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"

import { ActivityIndicator, Image, Text, View } from "@/components/ui"
import VideoVLCStream from "./VideoVLCStream"
import { PulseDot } from "./PulseDot"

type Props = {
  videoUrl?: string
  imageUrl?: string
  defaultImage?: string
  handleError: () => void
}

export const LiveCameraWrapper = ({ videoUrl, imageUrl, defaultImage, handleError }: Props) => {
  const [isFailedRTS, setIsFailedRTS] = useState<boolean>(false)

  return (
    <Animated.View className="h-full w-full relative overflow-hidden z-50 rounded-xl bg-slate-400 border-neutral-300 dark:bg-neutral-900">
      {imageUrl ? (
        <View className="w-full rounded-t-xl">
          <Image
            className="w-full rounded-t-xl"
            style={{
              width: "100%",
              aspectRatio: 16 / 9,
              opacity: isFailedRTS || !videoUrl || videoUrl.length === 0 ? 1 : 0.2
            }}
            source={{ uri: imageUrl }}
          />
        </View>
      ) : defaultImage ? (
        <Image
          className="w-full rounded-t-xl"
          style={{
            width: "100%",
            aspectRatio: 16 / 9
          }}
          contentFit="cover"
          source={{ uri: defaultImage }}
          cachePolicy={"memory-disk"}
          transition={500}
        />
      ) : (
        <Image
          className="w-full rounded-t-xl"
          style={{
            width: "100%",
            aspectRatio: 16 / 9
          }}
          contentFit="cover"
          source={require("../../../assets/rooms.jpg")}
          cachePolicy={"memory-disk"}
          transition={500}
        />
      )}
      {videoUrl && videoUrl.length > 0 && !isFailedRTS ? (
        <ActivityIndicator className="absolute top-0 left-0 w-full h-full z-2" color={"#0891b2"} />
      ) : null}
      {videoUrl && videoUrl.length > 0 ? (
        <>
          <VideoVLCStream
            videoUrl={videoUrl}
            imageUrl={imageUrl}
            setIsFailedRTS={setIsFailedRTS}
            isFailedRTS={isFailedRTS}
            handleError={handleError}
          />
          <View className="flex-row items-center bg-white/10 dark:bg-black/10 px-2 py-1 rounded-full absolute top-2 right-2">
            <PulseDot
              color="red"
              size={8}
              duration={600}
              maxScale={2}
              style={{ marginRight: 4 }}
            />
            <Text className="text-white font-bold text-xs">LIVE</Text>
          </View>
        </>
      ) : null}
    </Animated.View>
  )
}
