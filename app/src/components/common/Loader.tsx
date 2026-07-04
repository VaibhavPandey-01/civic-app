import React from 'react';
import { View, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface LoaderProps {
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({ style, size = 'large' }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={Colors.primaryBlue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
