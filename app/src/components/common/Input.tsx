import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, containerStyle, style, ...rest }, ref) => {
    const hasError = Boolean(error);
    const isMultiline = rest.multiline;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View style={[
          styles.inputRow,
          hasError && styles.inputRowError,
          isMultiline && styles.inputRowMultiline
        ]}>
          {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            style={[styles.input, leftIcon ? styles.inputWithIcon : null, style]}
            placeholderTextColor={Colors.grayText}
            {...rest}
          />
        </View>

        {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Colors.spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 52,
    paddingHorizontal: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  inputRowError: {
    borderColor: Colors.alertOrange,
  },
  inputRowMultiline: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: Colors.spacing.sm,
  },
  iconSlot: {
    marginRight: Colors.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    color: Colors.darkText,
    paddingVertical: 0, // prevents android extra padding
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.alertOrange,
    marginTop: Colors.spacing.xs,
  },
});
