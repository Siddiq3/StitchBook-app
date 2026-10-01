import React from 'react';
import AppButton from '../AppButton';
export default function PrimaryButton({ fullWidth, variant = 'primary', style, ...props }) {
  return <AppButton {...props} variant={variant === 'outline' ? 'secondary' : variant} style={[fullWidth && { width: '100%' }, style]} />;
}
