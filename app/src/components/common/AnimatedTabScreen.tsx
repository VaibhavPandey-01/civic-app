import React, { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedTabScreenProps {
  children: React.ReactNode;
}

export const AnimatedTabScreen: React.FC<AnimatedTabScreenProps> = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const slideY = useRef(new Animated.Value(12)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.96);
      slideY.setValue(12);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.96);
        slideY.setValue(12);
      };
    }, [])
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideY }],
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </Animated.View>
  );
};
