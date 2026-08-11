import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Icon } from "./Ui";

const steps = [
  ["sparkles-outline", "Welcome to Secret", "Start conversations in the way that feels natural to you."],
  ["images-outline", "Make it yours", "Posts can include text, a photo, a voice note, or all three."],
  ["shield-checkmark-outline", "You are in control", "Save what matters and mute or block profiles locally at any time."],
];

export function OnboardingSheet({ onComplete, styles, colors }) {
  const [step, setStep] = useState(0);
  const [icon, title, text] = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.onboardingOverlay}>
        <View style={styles.onboardingCard}>
          <View style={styles.onboardingIcon}>
            <Icon name={icon} color={colors.purple} size={32} />
          </View>
          <Text accessibilityRole="header" style={styles.onboardingTitle}>{title}</Text>
          <Text style={styles.onboardingText}>{text}</Text>
          <View style={styles.onboardingDots}>
            {steps.map((_, index) => <View key={index} style={[styles.onboardingDot, index === step && styles.onboardingDotActive]} />)}
          </View>
          <Pressable accessibilityRole="button" onPress={() => isLast ? onComplete() : setStep((current) => current + 1)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{isLast ? "Start exploring" : "Continue"}</Text>
          </Pressable>
          {!isLast && <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={onComplete} style={styles.onboardingSkip}><Text style={styles.onboardingSkipText}>Skip</Text></Pressable>}
        </View>
      </View>
    </Modal>
  );
}
