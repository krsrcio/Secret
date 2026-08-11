import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { BottomNav, Header } from "../components/Navigation";
import { PostCard } from "../components/PostCard";
import { Empty, Icon } from "../components/Ui";
import { idOf, nameOf } from "../utils/presentation";
import { searchResults } from "../utils/searchResults";

export function SearchScreen({
  data,
  onNavigate,
  onOpenPost,
  onOpenProfile,
  onFavorite,
  onEditPost,
  onDeletePost,
  onSettings,
  styles,
  colors,
}) {
  const [search, setSearch] = useState("");
  const query = search.trim();
  const { people, posts } = useMemo(() => searchResults(data, query), [data, query]);
  const hasResults = people.length > 0 || posts.length > 0;

  return (
    <View style={styles.screen}>
      <Header title="Search" onSettings={onSettings} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchPageInput}>
          <Icon name="search-outline" color={colors.muted} size={20} />
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholder="Search people or posts"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            accessibilityLabel="Search people or posts"
          />
          {!!search && (
            <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setSearch("")}>
              <Icon name="close-circle" color={colors.muted} size={19} />
            </Pressable>
          )}
        </View>

        {!query ? (
          <View style={styles.searchPrompt}>
            <View style={styles.searchPromptIcon}>
              <Icon name="search" color={colors.purple} size={29} />
            </View>
            <Text style={styles.searchPromptTitle}>Search Secret</Text>
            <Text style={styles.searchPromptText}>Find people and conversations by name or keyword.</Text>
          </View>
        ) : hasResults ? (
          <>
            {!!people.length && (
              <>
                <Text style={styles.searchSectionTitle}>People</Text>
                <View style={styles.searchPeopleCard}>
                  {people.map((person, index) => (
                    <Pressable
                      key={String(idOf(person) || person.username || index)}
                      onPress={() => onOpenProfile(person)}
                      style={({ pressed }) => [styles.searchPersonRow, index < people.length - 1 && styles.divider, pressed && styles.pressed]}
                    >
                      <Avatar person={person} size={48} />
                      <View style={[styles.flex, styles.personCopy]}>
                        <Text style={styles.postName}>{nameOf(person)}</Text>
                        <Text style={styles.searchUsername}>{person.username ? `@${person.username}` : person.email || "Profile"}</Text>
                      </View>
                      <Icon name="chevron-forward" color={colors.muted} size={19} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            {!!posts.length && (
              <>
                <Text style={styles.searchSectionTitle}>Posts</Text>
                {posts.map((post) => (
                  <PostCard
                    key={String(post.id)}
                    post={post}
                    canManage={String(idOf(post.author || post.user)) === String(idOf(data.currentUser))}
                    onOpen={() => onOpenPost(post)}
                    onFavorite={() => onFavorite(post.id)}
                    onEdit={() => onEditPost(post)}
                    onDelete={() => onDeletePost(post)}
                    onOpenProfile={() => onOpenProfile(post.author || post.user)}
                    styles={styles}
                    colors={colors}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <Empty icon="search-outline" text={`No results for “${query}”.`} styles={styles} />
        )}
      </ScrollView>
      <BottomNav active="discover" onNavigate={onNavigate} unread={data.unreadNotificationCount} styles={styles} colors={colors} />
    </View>
  );
}
