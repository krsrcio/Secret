import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { ProfileSkeleton } from "../components/LoadingSkeletons";
import { Header } from "../components/Navigation";
import { PostCard } from "../components/PostCard";
import { Empty, Icon, Stat } from "../components/Ui";
import { idOf, nameOf } from "../utils/presentation";

export function ProfileScreen({
  profile,
  currentUser,
  onBack,
  onFollow,
  onMute,
  onBlock,
  onEditProfile,
  onOpenPost,
  onFavorite,
  onEditPost,
  onDeletePost,
  styles,
  colors,
}) {
  const [tab, setTab] = useState("Posts");
  const person = profile?.user;
  const tabPosts =
    tab === "Posts"
      ? profile?.posts || []
      : tab === "Answers"
        ? profile?.answers || []
        : profile?.favorites || [];
  if (!person) return null;
  const self = String(idOf(person)) === String(idOf(currentUser));
  const following = Boolean(person.isFollowing ?? person.viewerIsFollowing);
  const canViewContent = person.canViewContent !== false;
  return (
    <View style={styles.screen}>
      <Header title="Profile" onBack={onBack} styles={styles} colors={colors} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {profile?.isLoading ? (
          <ProfileSkeleton styles={styles} />
        ) : (
          <>
            <View style={styles.profileHero}>
              <Avatar person={person} size={94} />
              <View style={[styles.flex, styles.profileCopy]}>
                <Text style={styles.profileName}>{nameOf(person)}</Text>
                <Text style={styles.mutedSmall}>{person.pronouns || ""}</Text>
              </View>
              {self ? (
                <Pressable onPress={onEditProfile} style={styles.followButton}>
                  <Text style={styles.followText}>Edit profile</Text>
                </Pressable>
              ) : person.isBlocked ? (
                <Pressable onPress={onBlock} style={styles.followingButton}>
                  <Text style={styles.followingText}>Blocked</Text>
                </Pressable>
              ) : (
                <View style={styles.profileActions}>
                <Pressable
                  onPress={onFollow}
                  style={[
                    styles.followButton,
                    following && styles.followingButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.followText,
                      following && styles.followingText,
                    ]}
                  >
                    {following ? "Following" : "Follow"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Profile safety tools"
                  onPress={() => Alert.alert("Profile tools", "These controls only affect this device.", [
                    { text: person.isMuted ? "Unmute" : "Mute", onPress: onMute },
                    { text: "Block", style: "destructive", onPress: onBlock },
                    { text: "Cancel", style: "cancel" },
                  ])}
                  style={styles.profileTools}
                >
                  <Icon name="ellipsis-horizontal" color={colors.purpleDark} size={19} />
                </Pressable>
                </View>
              )}
            </View>
            {!!person.bio && <Text style={styles.bio}>{person.bio}</Text>}
            <View style={styles.stats}>
              <Stat
                value={person.followingCount}
                label="Following"
                styles={styles}
              />
              <View style={styles.statLine} />
              <Stat
                value={person.followersCount ?? person.followerCount}
                label="Followers"
                styles={styles}
              />
              <View style={styles.statLine} />
              <Stat
                value={person.postCount ?? profile?.posts?.length}
                label="Posts"
                styles={styles}
              />
            </View>
            {canViewContent ? (
              <>
                <View style={styles.tabs}>
                  {["Posts", "Answers", "Favorites"].map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setTab(item)}
                      style={[styles.tab, tab === item && styles.activeTab]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          tab === item && styles.activeTabText,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {tabPosts.length ? (
                  tabPosts.map((post) => (
                    <PostCard
                      key={String(post.id)}
                      post={post}
                      canManage={
                        String(idOf(post.author || post.user)) ===
                        String(idOf(currentUser))
                      }
                      onOpen={() => onOpenPost(post)}
                      onFavorite={() => onFavorite(post.id)}
                      onEdit={() => onEditPost(post)}
                      onDelete={() => onDeletePost(post)}
                      onOpenProfile={() => {}}
                      styles={styles}
                      colors={colors}
                    />
                  ))
                ) : (
                  <Empty
                    icon={
                      tab === "Posts"
                        ? "chatbubble-ellipses-outline"
                        : "folder-open-outline"
                    }
                    text={`No ${tab.toLowerCase()} to show yet.`}
                    styles={styles}
                  />
                )}
              </>
            ) : (
              <Empty
                icon="lock-closed-outline"
                text={person.isBlocked ? "You have blocked this profile on this device." : person.isMuted ? "You have muted this profile on this device." : "Follow this private profile to see its activity."}
                styles={styles}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
