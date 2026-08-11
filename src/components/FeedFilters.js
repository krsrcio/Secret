import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { feedFilters } from "../utils/feedFilters";

export function FeedFilters({ value, onChange, styles }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {feedFilters.map(([key, label]) => (
        <Pressable
          key={key}
          accessibilityRole="radio"
          accessibilityLabel={`Filter feed by ${label}`}
          accessibilityState={{ selected: value === key }}
          onPress={() => onChange(key)}
          style={[styles.filterChip, value === key && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, value === key && styles.filterChipTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
