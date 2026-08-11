import React, { useEffect, useRef } from "react";
import { Animated, SafeAreaView, View } from "react-native";
import { Brand } from "./Brand";

export function Skeleton({ width = "100%", height = 14, style, styles }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.skeleton, { width, height, opacity }, style]}
    />
  );
}

export function PostSkeleton({ styles }) {
  return (
    <View style={styles.card}>
      <View style={styles.skeletonPostTop}>
        <Skeleton
          width={42}
          height={42}
          style={styles.skeletonCircle}
          styles={styles}
        />
        <View style={styles.skeletonPostCopy}>
          <Skeleton width="45%" height={13} styles={styles} />
          <Skeleton
            width="30%"
            height={10}
            style={styles.skeletonGap}
            styles={styles}
          />
        </View>
      </View>
      <Skeleton height={16} style={styles.skeletonPostLine} styles={styles} />
      <Skeleton
        width="78%"
        height={16}
        style={styles.skeletonGap}
        styles={styles}
      />
      <View style={styles.skeletonPostActions}>
        <Skeleton width={80} height={14} styles={styles} />
        <Skeleton width={54} height={14} styles={styles} />
      </View>
    </View>
  );
}

export function HomeSkeletonScreen({ styles }) {
  return (
    <SafeAreaView style={styles.app} accessibilityLabel="Loading your feed">
      <View style={styles.header}>
        <Brand compact styles={styles} />
        <Skeleton
          width={38}
          height={38}
          style={styles.skeletonCircle}
          styles={styles}
        />
      </View>
      <View style={styles.content}>
        <Skeleton height={46} style={styles.skeletonSearch} styles={styles} />
        <View style={styles.skeletonComposer}>
          <Skeleton
            width={45}
            height={45}
            style={styles.skeletonCircle}
            styles={styles}
          />
          <View style={styles.skeletonComposerCopy}>
            <Skeleton height={15} styles={styles} />
            <Skeleton
              width="72%"
              height={15}
              style={styles.skeletonGap}
              styles={styles}
            />
          </View>
        </View>
        <Skeleton
          width={104}
          height={20}
          style={styles.skeletonSectionTitle}
          styles={styles}
        />
        <PostSkeleton styles={styles} />
        <PostSkeleton styles={styles} />
      </View>
      <View style={styles.nav}>
        <Skeleton width={46} height={12} styles={styles} />
        <Skeleton width={46} height={12} styles={styles} />
        <Skeleton width={46} height={12} styles={styles} />
      </View>
    </SafeAreaView>
  );
}

export function ProfileSkeleton({ styles }) {
  return (
    <View>
      <View style={styles.skeletonProfileHero}>
        <Skeleton
          width={94}
          height={94}
          style={styles.skeletonCircle}
          styles={styles}
        />
        <View style={styles.skeletonProfileCopy}>
          <Skeleton width="66%" height={22} styles={styles} />
          <Skeleton
            width="38%"
            height={12}
            style={styles.skeletonGap}
            styles={styles}
          />
        </View>
        <Skeleton
          width={76}
          height={35}
          style={styles.skeletonPill}
          styles={styles}
        />
      </View>
      <Skeleton
        width="82%"
        height={14}
        style={styles.skeletonBio}
        styles={styles}
      />
      <View style={styles.skeletonStats}>
        <Skeleton width="24%" height={26} styles={styles} />
        <Skeleton width="24%" height={26} styles={styles} />
        <Skeleton width="24%" height={26} styles={styles} />
      </View>
      <View style={styles.skeletonTabs}>
        <Skeleton width="25%" height={13} styles={styles} />
        <Skeleton width="25%" height={13} styles={styles} />
        <Skeleton width="25%" height={13} styles={styles} />
      </View>
      <PostSkeleton styles={styles} />
      <PostSkeleton styles={styles} />
    </View>
  );
}
