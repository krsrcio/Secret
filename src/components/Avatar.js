import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '../constants/theme';

const nameOf = (person) => person?.name || person?.displayName || person?.username || 'Unknown user';
const imageOf = (person) => person?.avatarUrl || person?.profileImageUrl || person?.avatar || person?.imageUrl;

export function Avatar({ person, size }) {
  const uri = imageOf(person);
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.lavender }} />;
  const initials = nameOf(person).split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.purpleDark, fontWeight: '800', fontSize: Math.max(10, size * 0.34) }}>{initials || '?'}</Text></View>;
}
