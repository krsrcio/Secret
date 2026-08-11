import React from "react";
import { Image, Text, View } from "react-native";

const logo = require("../../img/final logo.png");

export function Brand({ compact = false, style, styles }) {
  return (
    <View style={[styles.brand, compact && styles.compactBrand, style]}>
      {!compact && (
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      )}
      <Text style={styles.brandText}>
        secret<Text style={styles.brandDot}>.</Text>
      </Text>
    </View>
  );
}
