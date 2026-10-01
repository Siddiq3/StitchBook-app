import React from 'react';
import IconInput from '../IconInput';
export default function Input({ label, required, ...props }) {
  return <IconInput {...props} label={required && label ? `${label} *` : label} />;
}
