import React, { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { Avatar } from "./Avatar";
import { Icon } from "./Ui";
import { VoiceMessage } from "./VoiceMessage";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { formatDuration } from "../utils/formatDuration";

export function PostComposer({
  currentUser,
  onOpenProfile,
  onCreatePost,
  onPickPhoto,
  onError,
  styles,
  colors,
}) {
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const {
    voiceUrl,
    voiceDurationMs,
    isRecording,
    recordingDurationMs,
    toggleRecording,
    discardVoice,
  } = useVoiceRecorder(onError);
  const canPost = Boolean(question.trim() || imageUrl || voiceUrl) && !isRecording;

  const publish = async () => {
    if (await onCreatePost({ question, imageUrl, audioUrl: voiceUrl, audioDurationMs: voiceDurationMs })) {
      setQuestion("");
      setImageUrl(null);
      await discardVoice();
    }
  };

  const choosePhoto = async () => {
    const selectedImageUrl = await onPickPhoto();
    if (selectedImageUrl) setImageUrl(selectedImageUrl);
  };

  return (
    <View style={styles.composer}>
      <Pressable onPress={onOpenProfile}>
        <Avatar person={currentUser} size={45} />
      </Pressable>
      <View style={styles.composerBody}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          style={styles.composerInput}
          multiline
          maxLength={220}
          placeholder="Ask what's on your mind..."
          placeholderTextColor={colors.muted}
        />
        {!!imageUrl && (
          <View style={styles.composerImageWrap}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.composerImage}
              resizeMode="cover"
            />
            <Pressable
              accessibilityLabel="Remove post photo"
              onPress={() => setImageUrl(null)}
              style={styles.composerImageRemove}
            >
              <Icon name="close" color={colors.white} size={16} />
            </Pressable>
          </View>
        )}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Icon name="mic" color={colors.danger} size={16} />
            <Text style={styles.recordingText}>
              Recording {formatDuration(recordingDurationMs)}
            </Text>
          </View>
        )}
        {!!voiceUrl && (
          <View style={styles.composerVoiceDraft}>
            <VoiceMessage
              uri={voiceUrl}
              durationMs={voiceDurationMs}
              styles={styles}
              colors={colors}
            />
            <Pressable
              accessibilityLabel="Remove post voice message"
              onPress={discardVoice}
              style={styles.voiceDiscard}
            >
              <Icon name="close" color={colors.purpleDark} size={17} />
            </Pressable>
          </View>
        )}
        <View style={styles.composerFooter}>
          <View style={styles.composerMeta}>
            <View style={styles.composerActions}>
              <Pressable
                accessibilityLabel="Add a photo to your post"
                onPress={choosePhoto}
                style={styles.composerPhotoButton}
              >
                <Icon name="image-outline" color={colors.purple} size={18} />
                <Text style={styles.composerPhotoText}>
                  {imageUrl ? "Change photo" : "Photo"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={isRecording ? "Stop post voice recording" : "Record a voice message for your post"}
                onPress={toggleRecording}
                style={styles.composerPhotoButton}
              >
                <Icon name={isRecording ? "stop" : "mic-outline"} color={isRecording ? colors.danger : colors.purple} size={18} />
                <Text style={[styles.composerPhotoText, isRecording && styles.composerRecordingText]}>
                  {isRecording ? "Stop" : "Voice"}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.mutedSmall}>{question.length}/220</Text>
          </View>
          <Pressable
            disabled={!canPost}
            onPress={publish}
            style={[styles.smallButton, !canPost && styles.disabled]}
          >
            <Text style={styles.smallButtonText}>Post</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
