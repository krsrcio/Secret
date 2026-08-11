import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { formatDuration } from "../utils/formatDuration";
import { Icon } from "./Ui";

export function VoiceMessage({ uri, durationMs = 0, styles, colors }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const durationSeconds = status.duration || durationMs / 1000;
  const duration = durationSeconds * 1000;
  const progress = durationSeconds
    ? Math.min(status.currentTime / durationSeconds, 1)
    : 0;

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || status.currentTime >= durationSeconds) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={styles.voiceMessage}>
      <Pressable
        accessibilityLabel={status.playing ? "Pause voice message" : "Play voice message"}
        onPress={togglePlayback}
        style={styles.voicePlay}
      >
        <Icon
          name={status.playing ? "pause" : "play"}
          color={colors.white}
          size={15}
        />
      </Pressable>
      <View style={styles.voiceProgress}>
        <View style={[styles.voiceProgressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.voiceDuration}>
        {formatDuration(status.currentTime * 1000 || duration)}
      </Text>
    </View>
  );
}
