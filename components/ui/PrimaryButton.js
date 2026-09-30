import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors123, SIZES, normalize } from '../../utils/theme';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon = null,
  size = 'md',
  fullWidth = false,
  style,
}) {
  const sizeMap = { sm: 36, md: SIZES.buttonH, lg: 56 };
  const height = sizeMap[size];

  const getBackgroundColor = () => {
    if (variant === 'primary') return colors123.primary;
    if (variant === 'danger') return colors123.danger;
    if (variant === 'outline') return colors123.surface;
    if (variant === 'ghost') return 'transparent';
    return colors123.primary;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors123.border;
    if (variant === 'ghost') return 'transparent';
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger') return colors123.surface;
    return colors123.primary;
  };

  const getLoaderColor = () => {
    if (variant === 'outline' || variant === 'ghost') return colors123.primary;
    return colors123.surface;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          height,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
          paddingHorizontal: fullWidth ? 0 : 24,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={
          variant === 'primary'
            ? [colors123.primary, colors123.primaryDark]
            : variant === 'danger'
              ? [colors123.danger, '#A9473B']
              : ['transparent', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.content}
      >
        {loading ? (
          <ActivityIndicator color={getLoaderColor()} size="small" />
        ) : (
          <>
            {icon && (
              <MaterialCommunityIcons
                name={icon}
                size={18}
                color={getTextColor()}
                style={{ marginRight: title ? 8 : 0 }}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  fontSize: normalize(SIZES.md),
                  color: getTextColor(),
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
