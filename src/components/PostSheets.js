import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "./Avatar";
import { Empty, Icon } from "./Ui";
import { MediaAttachments } from "./MediaAttachments";
import { SheetEntrance } from "./Motion";
import { VoiceMessage } from "./VoiceMessage";
import { formatRelativeTime } from "../utils/formatDate";
import { formatDuration } from "../utils/formatDuration";
import { nameOf, postText, responsesOf } from "../utils/presentation";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

export function ReplySheet({
  post,
  ...props
}) {
  if (!post) return null;
  return <ReplySheetContent key={String(post.id)} post={post} {...props} />;
}

function ReplySheetContent({
  post,
  currentUser,
  onClose,
  onReply,
  onError,
  styles,
  colors,
}) {
  const [reply, setReply] = useState("");
  const {
    voiceUrl,
    voiceDurationMs,
    isRecording,
    recordingDurationMs,
    toggleRecording,
    discardVoice,
  } = useVoiceRecorder(onError);
  if (!post) return null;
  const author = post.author || post.user || {};
  const canSend = Boolean(reply.trim() || voiceUrl) && !isRecording;

  const send = async () => {
    if (await onReply(post.id, { text: reply, audioUrl: voiceUrl, audioDurationMs: voiceDurationMs })) {
      setReply("");
      await discardVoice();
    }
  };
  const close = async () => {
    try {
      await discardVoice();
    } finally {
      onClose();
    }
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={close} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <SheetEntrance style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Responses</Text>
              <Pressable onPress={close} style={styles.close}>
                <Icon name="close" color={colors.purpleDark} size={20} />
              </Pressable>
            </View>
            <View style={styles.question}>
              <Avatar person={author} size={35} />
              <View style={[styles.flex, styles.questionCopy]}>
                <Text style={styles.postName}>{nameOf(author)}</Text>
                {!!postText(post) && (
                  <Text style={styles.questionText}>{postText(post)}</Text>
                )}
                {!!post.imageUrl && (
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.questionImage}
                    resizeMode="cover"
                  />
                )}
                {!!post.audioUrl && (
                  <VoiceMessage
                    uri={post.audioUrl}
                    durationMs={post.audioDurationMs}
                    styles={styles}
                    colors={colors}
                  />
                )}
              </View>
            </View>
            <ScrollView
              style={styles.responses}
              contentContainerStyle={styles.responsesContent}
            >
              {responsesOf(post).length ? (
                responsesOf(post).map((response, index) => (
                  <Response
                    key={String(response.id || index)}
                    response={response}
                    styles={styles}
                    colors={colors}
                  />
                ))
              ) : (
                <Empty
                  icon="chatbubble-outline"
                  text="Be the first to respond."
                  styles={styles}
                />
              )}
            </ScrollView>
            <View style={styles.replyComposer}>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <Icon name="mic" color={colors.danger} size={16} />
                  <Text style={styles.recordingText}>
                    Recording {formatDuration(recordingDurationMs)}
                  </Text>
                </View>
              )}
              {!!voiceUrl && (
                <View style={styles.voiceDraft}>
                  <VoiceMessage uri={voiceUrl} durationMs={voiceDurationMs} styles={styles} colors={colors} />
                  <Pressable
                    accessibilityLabel="Remove voice message"
                    onPress={discardVoice}
                    style={styles.voiceDiscard}
                  >
                    <Icon name="close" color={colors.purpleDark} size={17} />
                  </Pressable>
                </View>
              )}
              <View style={styles.replyInput}>
                <Avatar person={currentUser} size={35} />
                <TextInput
                  value={reply}
                  onChangeText={setReply}
                  multiline
                  maxLength={220}
                  style={styles.replyTextInput}
                  placeholder="Write a response"
                  placeholderTextColor={colors.muted}
                />
                <Pressable
                  accessibilityLabel={isRecording ? "Stop voice recording" : "Record a voice message"}
                  onPress={toggleRecording}
                  style={[styles.voiceRecord, isRecording && styles.voiceRecording]}
                >
                  <Icon name={isRecording ? "stop" : "mic-outline"} color={isRecording ? colors.white : colors.purple} size={18} />
                </Pressable>
                <Pressable
                  disabled={!canSend}
                  onPress={send}
                  style={[styles.send, !canSend && styles.disabled]}
                >
                  <Icon name="arrow-up" color={colors.white} size={19} />
                </Pressable>
              </View>
            </View>
          </SheetEntrance>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function PostEditorSheet(props) {
  if (!props.post) return null;
  return <PostEditorContent key={String(props.post.id)} {...props} />;
}

function PostEditorContent({ post, onClose, onSave, onPickPhoto, onError, styles, colors }) {
  const [question, setQuestion] = useState(postText(post));
  const [imageUrl, setImageUrl] = useState(post.imageUrl || null);
  const {
    voiceUrl,
    voiceDurationMs,
    isRecording,
    recordingDurationMs,
    toggleRecording,
    discardVoice,
  } = useVoiceRecorder(onError, post);
  const canSave = Boolean(question.trim() || imageUrl || voiceUrl) && !isRecording;
  const save = async () => {
    if (await onSave(post.id, { question, imageUrl, audioUrl: voiceUrl, audioDurationMs: voiceDurationMs })) onClose();
  };
  const choosePhoto = async () => {
    const selected = await onPickPhoto();
    if (selected) setImageUrl(selected);
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <SheetEntrance style={styles.editorSheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit post</Text>
              <Pressable
                accessibilityLabel="Close post editor"
                onPress={onClose}
                style={styles.close}
              >
                <Icon name="close" color={colors.purpleDark} size={20} />
              </Pressable>
            </View>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              style={styles.editorInput}
              multiline
              maxLength={220}
              placeholder="Ask what is on your mind..."
              placeholderTextColor={colors.muted}
              autoFocus
            />
            <MediaAttachments
              imageUrl={imageUrl}
              audioUrl={voiceUrl}
              audioDurationMs={voiceDurationMs}
              onRemoveImage={() => setImageUrl(null)}
              onRemoveAudio={discardVoice}
              imageStyle={styles.editorImage}
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
            <View style={styles.editorFooter}>
              <View style={styles.editorAttachmentActions}>
                <Pressable accessibilityLabel="Choose a post photo" onPress={choosePhoto} style={styles.editorMediaButton}>
                  <Icon name="image-outline" color={colors.purple} size={18} />
                </Pressable>
                <Pressable accessibilityLabel={isRecording ? "Stop voice recording" : "Record a voice message"} onPress={toggleRecording} style={[styles.editorMediaButton, isRecording && styles.editorMediaButtonRecording]}>
                  <Icon name={isRecording ? "stop" : "mic-outline"} color={isRecording ? colors.white : colors.purple} size={18} />
                </Pressable>
                <Text style={styles.mutedSmall}>{question.length}/220</Text>
              </View>
              <Pressable
                disabled={!canSave}
                onPress={save}
                style={[
                  styles.smallButton,
                  !canSave && styles.disabled,
                ]}
              >
                <Text style={styles.smallButtonText}>Save changes</Text>
              </Pressable>
            </View>
          </SheetEntrance>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Response({ response, styles, colors }) {
  const author = response.author || response.user || response;
  const text = response.text || response.content || response.answer || "";
  return (
    <View style={styles.response}>
      <Avatar person={author} size={37} />
      <View style={[styles.flex, styles.responseCopy]}>
        <View style={styles.responseTop}>
          <Text style={styles.postName}>{nameOf(author)}</Text>
          <Text style={styles.mutedSmall}>
            {formatRelativeTime(response.createdAt || response.time)}
          </Text>
        </View>
        {!!text && <Text style={styles.responseBody}>{text}</Text>}
        {!!response.audioUrl && (
          <VoiceMessage
            uri={response.audioUrl}
            durationMs={response.audioDurationMs}
            styles={styles}
            colors={colors}
          />
        )}
      </View>
    </View>
  );
}
