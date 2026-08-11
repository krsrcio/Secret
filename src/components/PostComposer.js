import React, { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { Avatar } from "./Avatar";
import { Icon } from "./Ui";

export function PostComposer({
  currentUser,
  onOpenProfile,
  onCreatePost,
  onPickPhoto,
  styles,
  colors,
}) {
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const canPost = Boolean(question.trim() || imageUrl);

  const publish = async () => {
    if (await onCreatePost({ question, imageUrl })) {
      setQuestion("");
      setImageUrl(null);
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
        <View style={styles.composerFooter}>
          <View style={styles.composerMeta}>
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
