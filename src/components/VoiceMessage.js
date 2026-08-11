import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { formatDuration } from "../utils/formatDuration";
import { Icon } from "./Ui";

export function VoiceMessage({ uri, durationMs = 0, styles, colors }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const [speed, setSpeed] = useState(1);
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
  const changeSpeed = () => {
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    player.playbackRate = next;
    setSpeed(next);
  };

  return (
    <View style={styles.voiceMessage}>
      <Pressable
        accessibilityLabel={status.playing ? "Pause voice message" : "Play voice message"}
        onPress={togglePlayback}
        style={({ pressed }) => [styles.voicePlay, pressed && styles.pressed]}
      >
        <Icon
          name={status.playing ? "pause" : "play"}
          color={colors.white}
          size={15}
        />
      </Pressable>
      <View style={styles.voiceWaveform}>
        {[6, 12, 8, 16, 10, 19, 8, 14, 6].map((height, index) => (
          <View key={index} style={[styles.voiceWaveBar, { height, opacity: index / 9 <= progress ? 1 : 0.42 }]} />
        ))}
      </View>
      <Pressable accessibilityLabel={`Playback speed ${speed}x`} onPress={changeSpeed} style={styles.voiceSpeed}>
        <Text style={styles.voiceSpeedText}>{speed}×</Text>
      </Pressable>
      <Text style={styles.voiceDuration}>
        {formatDuration(status.currentTime * 1000 || duration)}
      </Text>
    </View>
  );
}
