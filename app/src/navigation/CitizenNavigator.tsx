import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
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

const Tab = createBottomTabNavigator<CitizenTabParamList>();
const Stack = createNativeStackNavigator<ReportStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// nested report creation stack
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

// nested reports tracking stack
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

// nested profile  settings stack
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

export const CitizenNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryBlue,
        tabBarInactiveTintColor: Colors.grayText,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CitizenDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackNavigator}
        options={{
          tabBarLabel: 'My Reports',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
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
