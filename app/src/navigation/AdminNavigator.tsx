import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet, Animated } from 'react-native';
import { LayoutDashboard, Map, FileSpreadsheet, BarChart2 } from 'lucide-react-native';
import { AdminTabParamList, ReportsStackParamList } from '../types/navigation.types';
import { AdminDashboardScreen } from '../screens/admin/dashboard/AdminDashboardScreen';
import { LiveMapScreen } from '../screens/admin/map/LiveMapScreen';
import { ReportListScreen } from '../screens/admin/reports/ReportListScreen';
import { AdminReportDetailScreen } from '../screens/admin/reports/AdminReportDetailScreen';
import { UploadResolutionScreen } from '../screens/admin/resolution/UploadResolutionScreen';
import { AnalyticsScreen } from '../screens/admin/analytics/AnalyticsScreen';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedTabScreen } from '../components/common/AnimatedTabScreen';
import { useSettingsStore } from '../context/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

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

const AnimatedDashboard = () => (
  <AnimatedTabScreen>
    <AdminDashboardScreen />
  </AnimatedTabScreen>
);

const AnimatedLiveMap = () => (
  <AnimatedTabScreen>
    <LiveMapScreen />
  </AnimatedTabScreen>
);

const AnimatedReports = () => (
  <AnimatedTabScreen>
    <AdminReportsStackNavigator />
  </AnimatedTabScreen>
);

const AnimatedAnalytics = () => (
  <AnimatedTabScreen>
    <AnalyticsScreen />
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

export const AdminNavigator = () => {
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
        name="Dashboard"
        component={AnimatedDashboard}
        options={{
          tabBarLabel: t('tabDashboard' as any) || 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={AnimatedLiveMap}
        options={{
          tabBarLabel: t('tabLiveMap' as any) || 'Live Map',
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AnimatedReports}
        options={{
          tabBarLabel: t('tabReportsAdmin' as any) || 'Reports',
          tabBarIcon: ({ color, size }) => <FileSpreadsheet color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnimatedAnalytics}
        options={{
          tabBarLabel: t('tabAnalytics' as any) || 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

