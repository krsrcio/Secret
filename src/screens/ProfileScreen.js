import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { ProfileSkeleton } from "../components/LoadingSkeletons";
import { Header } from "../components/Navigation";
import { PostCard } from "../components/PostCard";
import { Empty, Stat } from "../components/Ui";
import { idOf, nameOf } from "../utils/presentation";

export function ProfileScreen({
  profile,
  currentUser,
  onBack,
  onFollow,
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
              {!self && (
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
                text="Follow this private profile to see its activity."
                styles={styles}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
