import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { Icon } from './Ui';
import { ExpandableImage } from './PhotoViewer';
import { VoiceMessage } from './VoiceMessage';
import { formatRelativeTime } from '../utils/formatDate';
import { countOf, favoriteOf, nameOf, postText } from '../utils/presentation';

export function PostCard({ post, canManage, onOpen, onFavorite, onOpenProfile, onEdit, onDelete, styles, colors }) {
  const author = post.author || post.user || {};
  const count = countOf(post);
  const text = postText(post);
  return <View style={styles.card}>
    <View style={styles.postTop}><Pressable accessibilityLabel={`Open ${nameOf(author)} profile`} onPress={onOpenProfile}><Avatar person={author} size={42} /></Pressable><Pressable onPress={onOpenProfile} style={styles.postAuthor}><Text style={styles.postName}>{nameOf(author)}</Text><Text style={styles.mutedSmall}>{formatRelativeTime(post.createdAt || post.time)}</Text></Pressable>{canManage && <Pressable accessibilityLabel="Manage your post" onPress={() => Alert.alert('Post options', undefined, [{ text: 'Edit', onPress: onEdit }, { text: 'Delete', style: 'destructive', onPress: onDelete }, { text: 'Cancel', style: 'cancel' }])} style={styles.iconHit}><Icon name="ellipsis-horizontal" color={colors.muted} size={20} /></Pressable>}<Pressable accessibilityLabel={favoriteOf(post) ? 'Remove favorite' : 'Favorite post'} onPress={onFavorite} style={styles.iconHit}><Icon name={favoriteOf(post) ? 'star' : 'star-outline'} color={favoriteOf(post) ? '#D88991' : '#BDB6CB'} size={23} /></Pressable></View>
    {!!text && <Pressable onPress={onOpen}><Text style={styles.postText}>{text}</Text></Pressable>}
    {!!post.imageUrl && <ExpandableImage uri={post.imageUrl} style={styles.postImage} styles={styles} colors={colors} />}
    {!!post.audioUrl && <VoiceMessage uri={post.audioUrl} durationMs={post.audioDurationMs} styles={styles} colors={colors} />}
    <View style={styles.postActions}><Pressable onPress={onOpen} style={styles.inlineAction}><Icon name="chatbubble-ellipses-outline" color={colors.purple} size={17} /><Text style={styles.mutedSmall}>{count} {count === 1 ? 'response' : 'responses'}</Text></Pressable><Pressable onPress={onOpen} style={styles.inlineAction}><Icon name="arrow-undo-outline" color={colors.purple} size={16} /><Text style={styles.replyText}>Reply</Text></Pressable></View>
  </View>;
}
