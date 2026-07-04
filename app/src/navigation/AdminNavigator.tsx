import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { LayoutDashboard, Map, FileSpreadsheet, BarChart2 } from 'lucide-react-native';
import { AdminTabParamList, ReportsStackParamList } from '../types/navigation.types';
import { AdminDashboardScreen } from '../screens/admin/dashboard/AdminDashboardScreen';
import { LiveMapScreen } from '../screens/admin/map/LiveMapScreen';
import { ReportListScreen } from '../screens/admin/reports/ReportListScreen';
import { AdminReportDetailScreen } from '../screens/admin/reports/AdminReportDetailScreen';
import { UploadResolutionScreen } from '../screens/admin/resolution/UploadResolutionScreen';
import { AnalyticsScreen } from '../screens/admin/analytics/AnalyticsScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();

const AdminReportsStackNavigator = () => {
  return (
    <ReportsStack.Navigator
      initialRouteName="ReportList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ReportsStack.Screen name="ReportList" component={ReportListScreen} />
      <ReportsStack.Screen name="ReportDetail" component={AdminReportDetailScreen} />
      <ReportsStack.Screen name="UploadResolution" component={UploadResolutionScreen} />
    </ReportsStack.Navigator>
  );
};

export const AdminNavigator = () => {
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
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={LiveMapScreen}
        options={{
          tabBarLabel: 'Live Map',
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AdminReportsStackNavigator}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => <FileSpreadsheet color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
