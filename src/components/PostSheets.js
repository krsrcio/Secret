import React, { useEffect, useState } from "react";
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
import { formatRelativeTime } from "../utils/formatDate";
import { nameOf, postText, responsesOf } from "../utils/presentation";

export function ReplySheet({
  post,
  currentUser,
  onClose,
  onReply,
  styles,
  colors,
}) {
  const [reply, setReply] = useState("");
  if (!post) return null;
  const author = post.author || post.user || {};
  const send = async () => {
    if (await onReply(post.id, reply)) setReply("");
  };
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Responses</Text>
              <Pressable onPress={onClose} style={styles.close}>
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
                disabled={!reply.trim()}
                onPress={send}
                style={[styles.send, !reply.trim() && styles.disabled]}
              >
                <Icon name="arrow-up" color={colors.white} size={19} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function PostEditorSheet({ post, onClose, onSave, styles, colors }) {
  const [question, setQuestion] = useState("");
  useEffect(() => {
    setQuestion(post ? postText(post) : "");
  }, [post]);
  if (!post) return null;
  const save = async () => {
    if (await onSave(post.id, question)) onClose();
  };
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.editorSheet}>
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
            <View style={styles.editorFooter}>
              <Text style={styles.mutedSmall}>{question.length}/220</Text>
              <Pressable
                disabled={!question.trim()}
                onPress={save}
                style={[
                  styles.smallButton,
                  !question.trim() && styles.disabled,
                ]}
              >
                <Text style={styles.smallButtonText}>Save changes</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Response({ response, styles }) {
  const author = response.author || response.user || response;
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
        <Text style={styles.responseBody}>
          {response.text || response.content || response.answer || ""}
        </Text>
      </View>
    </View>
  );
}
