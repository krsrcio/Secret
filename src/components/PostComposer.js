import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Avatar } from "./Avatar";
import { Icon } from "./Ui";
import { MediaAttachments } from "./MediaAttachments";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useDraftAutosave } from "../hooks/useDraftAutosave";
import { formatDuration } from "../utils/formatDuration";

export function PostComposer({
  currentUser,
  onOpenProfile,
  onCreatePost,
  onPickPhoto,
  onError,
  draft,
  onSaveDraft,
  styles,
  colors,
}) {
  const [question, setQuestion] = useState(draft?.question || "");
  const [imageUrl, setImageUrl] = useState(draft?.imageUrl || null);
  const {
    voiceUrl,
    voiceDurationMs,
    isRecording,
    recordingDurationMs,
    toggleRecording,
    discardVoice,
  } = useVoiceRecorder(onError, draft);
  const canPost = Boolean(question.trim() || imageUrl || voiceUrl) && !isRecording;

  useDraftAutosave(
    { question, imageUrl, audioUrl: voiceUrl, audioDurationMs: voiceDurationMs },
    onSaveDraft,
  );

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
        <MediaAttachments
          imageUrl={imageUrl}
          audioUrl={voiceUrl}
          audioDurationMs={voiceDurationMs}
          onRemoveImage={() => setImageUrl(null)}
          onRemoveAudio={discardVoice}
          imageStyle={styles.composerImage}
          wrapperStyle={styles.composerImageWrap}
          styles={styles}
          colors={colors}
        />
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Icon name="mic" color={colors.danger} size={16} />
            <Text style={styles.recordingText}>
              Recording {formatDuration(recordingDurationMs)}
            </Text>
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
