import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Animated, StyleSheet } from 'react-native';
import { Home, ClipboardList, User } from 'lucide-react-native';
import {
  CitizenTabParamList,
  ReportStackParamList,
  ReportsStackParamList,
  ProfileStackParamList,
} from '../types/navigation.types';
import { CitizenDashboardScreen } from '../screens/citizen/dashboard/CitizenDashboardScreen';
import { ReportTrackingScreen } from '../screens/citizen/tracking/ReportTrackingScreen';
import { ReportDetailScreen } from '../screens/citizen/tracking/ReportDetailScreen';
import { ProfileScreen } from '../screens/citizen/profile/ProfileScreen';
import { SettingsScreen } from '../screens/citizen/profile/SettingsScreen';
import { SelectCategoryScreen } from '../screens/citizen/report/SelectCategoryScreen';
import { CameraScreen } from '../screens/citizen/report/CameraScreen';
import { DescriptionScreen } from '../screens/citizen/report/DescriptionScreen';
import { ReviewSubmitScreen } from '../screens/citizen/report/ReviewSubmitScreen';
import { SafetyTipsScreen } from '../screens/citizen/report/SafetyTipsScreen';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedTabScreen } from '../components/common/AnimatedTabScreen';
import { useSettingsStore } from '../context/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

const Tab = createBottomTabNavigator<CitizenTabParamList>();
const Stack = createNativeStackNavigator<ReportStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ReportStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SelectCategory"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />
      <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
    </Stack.Navigator>
  );
};

const ReportsStackNavigator = () => {
  return (
    <ReportsStack.Navigator
      initialRouteName="ReportList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ReportsStack.Screen name="ReportList" component={ReportTrackingScreen} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </ReportsStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};

const AnimatedDashboard = () => (
  <AnimatedTabScreen>
    <CitizenDashboardScreen />
  </AnimatedTabScreen>
);

const AnimatedReports = () => (
  <AnimatedTabScreen>
    <ReportsStackNavigator />
  </AnimatedTabScreen>
);

const AnimatedProfile = () => (
  <AnimatedTabScreen>
    <ProfileStackNavigator />
  </AnimatedTabScreen>
);

const AnimatedTabBar = (props: any) => {
  const tabBarVisible = useSettingsStore((s) => s.tabBarVisible);
  const tabBarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(tabBarAnim, {
      toValue: tabBarVisible ? 1 : 0,
      tension: 45,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [tabBarVisible]);

  const scale = tabBarAnim;
  const translateY = tabBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [45, 0],
  });
  const opacity = tabBarAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.1, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }, { scale }],
        opacity,
        zIndex: 99,
        backgroundColor: 'transparent',
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

export const CitizenNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryBlue,
        tabBarInactiveTintColor: Colors.grayText,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          backgroundColor: 'transparent',
          borderRadius: 24,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: 'rgba(229, 231, 235, 0.5)',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 8,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.98)', 'rgba(245, 247, 250, 0.92)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={AnimatedDashboard}
        options={{
          tabBarLabel: t('tabHome' as any) || 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AnimatedReports}
        options={{
          tabBarLabel: t('tabReports' as any) || 'My Reports',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AnimatedProfile}
        options={{
          tabBarLabel: t('tabProfile' as any) || 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ReportStack"
        component={ReportStackNavigator}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};
