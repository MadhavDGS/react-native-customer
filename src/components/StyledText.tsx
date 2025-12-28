/**
 * Styled Text Component
 * Automatically applies Inter font family to all text
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Typography } from '../constants/theme';

interface StyledTextProps extends RNTextProps {
  bold?: boolean;
  semiBold?: boolean;
  medium?: boolean;
  extraBold?: boolean;
}

export function Text({ style, bold, semiBold, medium, extraBold, ...props }: StyledTextProps) {
  // Determine font family based on props
  let fontFamily = Typography.fonts.regular;
  
  if (extraBold) {
    fontFamily = Typography.fonts.extraBold;
  } else if (bold) {
    fontFamily = Typography.fonts.bold;
  } else if (semiBold) {
    fontFamily = Typography.fonts.semiBold;
  } else if (medium) {
    fontFamily = Typography.fonts.medium;
  }

  return (
    <RNText
      {...props}
      style={[{ fontFamily }, style]}
    />
  );
}

export default Text;
