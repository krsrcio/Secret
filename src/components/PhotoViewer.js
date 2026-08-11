import React, { useRef, useState } from "react";
import { Animated, Image, Modal, PanResponder, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./Ui";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const MIN_SCALE = 1;
const MAX_SCALE = 3;

function distanceBetween(touches) {
  if (touches.length < 2) return 0;
  const [first, second] = touches;
  return Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
}

export function ExpandableImage({ uri, style, accessibilityLabel = "View photo fullscreen", styles, colors }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!uri) return null;

  return (
    <>
      <Pressable accessibilityLabel={accessibilityLabel} onPress={() => setIsOpen(true)}>
        <Image source={{ uri }} style={style} resizeMode="cover" />
      </Pressable>
      <PhotoViewer uri={isOpen ? uri : null} onClose={() => setIsOpen(false)} styles={styles} colors={colors} />
    </>
  );
}

export function PhotoViewer({ uri, onClose, styles, colors }) {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const currentScale = useRef(MIN_SCALE);
  const pinchStartDistance = useRef(null);
  const startingScale = useRef(MIN_SCALE);

  const reset = () => {
    currentScale.current = MIN_SCALE;
    Animated.spring(scale, { toValue: MIN_SCALE, useNativeDriver: true }).start();
  };

  const beginPinch = (event) => {
    const startDistance = distanceBetween(event.nativeEvent.touches);
    if (!startDistance) return;
    pinchStartDistance.current = startDistance;
    startingScale.current = currentScale.current;
  };

  const responder = useRef(
    PanResponder.create({
      // Claim the first touch so this view also receives the second finger.
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: beginPinch,
      onPanResponderStart: beginPinch,
      onPanResponderMove: (event) => {
        const nextDistance = distanceBetween(event.nativeEvent.touches);
        if (!nextDistance) return;
        if (!pinchStartDistance.current) {
          pinchStartDistance.current = nextDistance;
          startingScale.current = currentScale.current;
          return;
        }
        const nextScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, startingScale.current * (nextDistance / pinchStartDistance.current)),
        );
        currentScale.current = nextScale;
        scale.setValue(nextScale);
      },
      onPanResponderRelease: () => {
        pinchStartDistance.current = null;
        if (currentScale.current < 1.06) reset();
      },
      onPanResponderTerminate: () => {
        pinchStartDistance.current = null;
        if (currentScale.current < 1.06) reset();
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  if (!uri) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.photoViewerOverlay}>
        <View style={[styles.photoViewerToolbar, { paddingTop: Math.max(insets.top + 16, 60) }]}>
          <Pressable accessibilityLabel="Close photo viewer" onPress={onClose} style={styles.photoViewerControl}>
            <Icon name="close" color={colors.white} size={23} />
          </Pressable>
          <Pressable accessibilityLabel="Reset photo zoom" onPress={reset} style={styles.photoViewerControl}>
            <Icon name="scan-outline" color={colors.white} size={20} />
          </Pressable>
        </View>
        <View style={styles.photoViewerImageArea} {...responder.panHandlers}>
          <AnimatedImage source={{ uri }} resizeMode="contain" style={[styles.photoViewerImage, { transform: [{ scale }] }]} />
        </View>
      </View>
    </Modal>
  );
}
