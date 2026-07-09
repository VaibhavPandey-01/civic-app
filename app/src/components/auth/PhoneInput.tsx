import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Phone } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  theme?: 'light' | 'dark';
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChangeText, error, theme }) => {
  const hasError = Boolean(error);
  const isDark = theme === 'dark';

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, isDark && { color: '#D1D5DB' }]}>Mobile Number</Text>

      <View style={[
        styles.row,
        isDark && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
        hasError && styles.rowError
      ]}>
        <TouchableOpacity style={styles.countryBadge} activeOpacity={0.7}>
          <Text style={[styles.countryText, isDark && { color: '#ffffff' }]}>🇮🇳 +91</Text>
        </TouchableOpacity>

        <View style={[styles.divider, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

        <Phone size={16} color={isDark ? '#60A5FA' : Colors.grayText} style={styles.icon} />

        <TextInput
          style={[styles.input, isDark && { color: '#ffffff' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter phone number"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : Colors.grayText}
          keyboardType="phone-pad"
          maxLength={10}
          returnKeyType="done"
        />
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 52,
    overflow: 'hidden',
    ...Colors.shadow.soft,
  },
  rowError: {
    borderColor: Colors.alertOrange,
  },
  countryBadge: {
    paddingHorizontal: Colors.spacing.sm,
    height: '100%',
    justifyContent: 'center',
  },
  countryText: {
    fontSize: 15,
    color: Colors.darkText,
    fontWeight: Typography.fontWeight.semibold,
  },
  divider: {
    width: 1,
    height: '55%',
    backgroundColor: '#E5E7EB',
  },
  icon: {
    marginLeft: Colors.spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Colors.spacing.sm,
    fontSize: Typography.fontSize.body,
    color: Colors.darkText,
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.alertOrange,
    marginTop: Colors.spacing.xs,
  },
});
