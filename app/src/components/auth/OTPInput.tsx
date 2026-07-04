import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(length).fill(null));

  const handleChange = (text: string, index: number) => {
    // only accept digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < length - 1) {
      // advance focus to next box
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== '')) {
      onComplete(updated.join(''));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {

      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[styles.box, digit ? styles.boxFilled : null]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Colors.spacing.sm,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    ...Colors.shadow.soft,
  },
  boxFilled: {
    borderColor: Colors.primaryBlue,
    backgroundColor: '#EEF4FF', // faint blue tint on filled boxes
  },
});
