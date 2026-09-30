import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors123, SIZES, normalize } from '../../utils/theme';

export default function AppHeader({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightComponent,
  backgroundColor = colors123.background,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 12,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left Icon/Back */}
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftPress}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name={leftIcon}
              size={24}
              color={colors123.text}
            />
          </TouchableOpacity>
        )}

        {/* Title & Subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Right Component */}
        {rightComponent && <View style={styles.right}>{rightComponent}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: SIZES.headerH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg2,
    paddingBottom: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: normalize(21),
    fontWeight: '800',
    color: colors123.text,
  },
  subtitle: {
    fontSize: normalize(SIZES.sm),
    color: colors123.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  right: {
    marginLeft: 12,
  },
});
