import React, { useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";
import { Icon } from "./Ui";

const steps = [
  {
    icon: "sparkles-outline",
    eyebrow: "WELCOME TO SECRET",
    title: "A softer place to speak your mind.",
    text: "Start conversations in the way that feels natural to you—without the noise.",
    detailIcon: "heart-outline",
    detail: "Share what matters, at your own pace.",
  },
  {
    icon: "color-wand-outline",
    eyebrow: "MAKE IT YOURS",
    title: "More ways to tell your story.",
    text: "Bring a thought to life with text, a photo, a voice note—or all three together.",
    detailIcon: "mic-outline",
    detail: "Your words, your voice, your way.",
  },
  {
    icon: "shield-checkmark-outline",
    eyebrow: "YOU ARE IN CONTROL",
    title: "Your space stays yours.",
    text: "Save what inspires you and quietly mute or block profiles whenever you need to.",
    detailIcon: "lock-closed-outline",
    detail: "Privacy tools work locally on this device.",
  },
];

export function OnboardingSheet({ onComplete, styles, colors }) {
  const [step, setStep] = useState(0);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const isTransitioning = useRef(false);
  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const moveToStep = (nextStep) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 110,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        isTransitioning.current = false;
        return;
      }
      setStep(nextStep);
      contentTranslateY.setValue(14);
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        isTransitioning.current = false;
      });
    });
  };

  const continueOnboarding = () => {
    if (isLast) onComplete();
    else moveToStep(step + 1);
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.onboardingOverlay}>
        <View pointerEvents="none" style={styles.onboardingBackdropOrbOne} />
        <View pointerEvents="none" style={styles.onboardingBackdropOrbTwo} />
        <View style={styles.onboardingCard}>
          <View style={styles.onboardingTopRow}>
            <View style={styles.onboardingWordmark}>
              <View style={styles.onboardingWordmarkDot} />
              <Text style={styles.onboardingWordmarkText}>secret.</Text>
            </View>
            {!isLast ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
                onPress={onComplete}
                style={({ pressed }) => [styles.onboardingSkipButton, pressed && styles.pressed]}
              >
                <Text style={styles.onboardingSkipButtonText}>Skip</Text>
              </Pressable>
            ) : (
              <View style={styles.onboardingStepBadge}>
                <Text style={styles.onboardingStepBadgeText}>READY</Text>
              </View>
            )}
          </View>
          <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}>
            <View style={styles.onboardingHero}>
              <View style={styles.onboardingHeroOrbOne} />
              <View style={styles.onboardingHeroOrbTwo} />
              <View style={styles.onboardingHeroOrbit}>
                <View style={styles.onboardingIcon}>
                  <Icon name={currentStep.icon} color={colors.purple} size={35} />
                </View>
              </View>
              <View style={styles.onboardingHeroCopy}>
                <Text style={styles.onboardingHeroLabel}>YOUR SPACE, YOUR PACE</Text>
                <Text style={styles.onboardingHeroTitle}>Feel more like yourself.</Text>
              </View>
            </View>
            <View style={styles.onboardingEyebrow}>
              <Text style={styles.onboardingEyebrowText}>{currentStep.eyebrow}</Text>
            </View>
            <Text accessibilityRole="header" style={styles.onboardingTitle}>{currentStep.title}</Text>
            <Text style={styles.onboardingText}>{currentStep.text}</Text>
            <View style={styles.onboardingDetail}>
              <View style={styles.onboardingDetailIcon}>
                <Icon name={currentStep.detailIcon} color={colors.purple} size={17} />
              </View>
              <Text style={styles.onboardingDetailText}>{currentStep.detail}</Text>
            </View>
          </Animated.View>
          <View style={styles.onboardingProgressRow}>
            <Text style={styles.onboardingProgressCount}>0{step + 1} <Text style={styles.onboardingProgressTotal}>/ 0{steps.length}</Text></Text>
            <View style={styles.onboardingProgressTrack}>
              <View style={[styles.onboardingProgressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} />
            </View>
          </View>
          <View style={styles.onboardingActions}>
            {step > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous onboarding step"
                onPress={() => moveToStep(step - 1)}
                style={({ pressed }) => [styles.onboardingBackButton, pressed && styles.pressed]}
              >
                <Icon name="arrow-back" color={colors.purpleDark} size={19} />
              </Pressable>
            ) : (
              <View style={styles.onboardingBackPlaceholder} />
            )}
            <Pressable
              accessibilityRole="button"
              onPress={continueOnboarding}
              style={({ pressed }) => [styles.onboardingPrimaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.onboardingPrimaryButtonText}>{isLast ? "Start exploring" : "Continue"}</Text>
              <Icon name={isLast ? "arrow-forward" : "arrow-down"} color={colors.white} size={18} />
            </Pressable>
          </View>
          <Text style={styles.onboardingFootnote}>
            You can update these preferences anytime in Settings.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
