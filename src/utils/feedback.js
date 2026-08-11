import * as Haptics from "expo-haptics";

export function confirmAction() {
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function acknowledgeAction() {
  return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );
}
