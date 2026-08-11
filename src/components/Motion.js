import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function ScreenTransition({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, translateY]);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export function SheetEntrance({ children, style }) {
  const translateY = useRef(new Animated.Value(36)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 240,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [scale, translateY]);

  return (
    <Animated.View style={[style, { transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}
