import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "./Avatar";
import { Icon } from "./Ui";

export function ProfileEditorSheet({ user, onClose, onSave, onPickPhoto, styles, colors }) {
  if (!user) return null;
  return <ProfileEditorContent key={String(user.id)} user={user} onClose={onClose} onSave={onSave} onPickPhoto={onPickPhoto} styles={styles} colors={colors} />;
}

function ProfileEditorContent({ user, onClose, onSave, onPickPhoto, styles, colors }) {
  const [name, setName] = useState(user.name || user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [pronouns, setPronouns] = useState(user.pronouns || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || null);

  const pickPhoto = async () => {
    const selected = await onPickPhoto();
    if (selected) setAvatarUrl(selected);
  };
  const save = async () => {
    if (await onSave({ name, bio, pronouns, avatarUrl })) onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.editorSheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit profile</Text>
              <Pressable accessibilityLabel="Close profile editor" onPress={onClose} style={styles.close}>
                <Icon name="close" color={colors.purpleDark} size={20} />
              </Pressable>
            </View>
            <Pressable accessibilityLabel="Choose profile photo" onPress={pickPhoto} style={styles.profileEditorAvatar}>
              <Avatar person={{ ...user, avatarUrl }} size={68} />
              <View style={styles.profileEditorCamera}>
                <Icon name="camera" color={colors.white} size={14} />
              </View>
            </Pressable>
            <Text style={styles.inputLabel}>Display name</Text>
            <TextInput value={name} onChangeText={setName} maxLength={50} style={styles.profileEditorInput} placeholder="Your name" placeholderTextColor={colors.muted} />
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput value={bio} onChangeText={setBio} maxLength={180} multiline style={styles.profileEditorBio} placeholder="A little about you" placeholderTextColor={colors.muted} />
            <Text style={styles.inputLabel}>Pronouns</Text>
            <TextInput value={pronouns} onChangeText={setPronouns} maxLength={40} style={styles.profileEditorInput} placeholder="e.g. she/her" placeholderTextColor={colors.muted} />
            <View style={styles.editorFooter}>
              <Text style={styles.mutedSmall}>{bio.length}/180</Text>
              <Pressable disabled={!name.trim()} onPress={save} style={[styles.smallButton, !name.trim() && styles.disabled]}>
                <Text style={styles.smallButtonText}>Save profile</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
