import React from 'react';
import AppButton from '../AppButton';
export default function Button({ fullWidth, variant = 'primary', style, ...props }) {
  return <AppButton {...props} variant={variant} style={[fullWidth && { width: '100%' }, style]} />;
}
