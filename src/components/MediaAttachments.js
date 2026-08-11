import React from "react";
import { Image, Pressable, View } from "react-native";
import { VoiceMessage } from "./VoiceMessage";
import { Icon } from "./Ui";

export function MediaAttachments({
  imageUrl,
  audioUrl,
  audioDurationMs,
  onRemoveImage,
  onRemoveAudio,
  imageStyle,
  wrapperStyle,
  styles,
  colors,
}) {
  return (
    <>
      {!!imageUrl && (
        <View style={wrapperStyle}>
          <Image source={{ uri: imageUrl }} style={imageStyle} resizeMode="cover" />
          {!!onRemoveImage && (
            <Pressable
              accessibilityLabel="Remove photo"
              onPress={onRemoveImage}
              style={styles.composerImageRemove}
            >
              <Icon name="close" color={colors.white} size={16} />
            </Pressable>
          )}
        </View>
      )}
      {!!audioUrl && (
        <View style={styles.composerVoiceDraft}>
          <VoiceMessage
            uri={audioUrl}
            durationMs={audioDurationMs}
            styles={styles}
            colors={colors}
          />
          {!!onRemoveAudio && (
            <Pressable
              accessibilityLabel="Remove voice message"
              onPress={onRemoveAudio}
              style={styles.voiceDiscard}
            >
              <Icon name="close" color={colors.purpleDark} size={17} />
            </Pressable>
          )}
        </View>
      )}
    </>
  );
}
