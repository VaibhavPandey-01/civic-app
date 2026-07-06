import { NavigatorScreenParams } from '@react-navigation/native';
import { ReportCategoryType } from '../constants/categories';

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  CitizenTabs: NavigatorScreenParams<CitizenTabParamList>;
  AdminTabs: NavigatorScreenParams<AdminTabParamList>;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
};

export type ReportStackParamList = {
  SelectCategory: undefined;
  Camera: { category: ReportCategoryType };
  Description: {
    category: ReportCategoryType;
    imageUri: string;
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  ReviewSubmit: {
    category: ReportCategoryType;
    imageUri: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    description: string;
  };
  SafetyTips: {
    category: ReportCategoryType;
  };
};

export type ReportsStackParamList = {
  ReportList: undefined;
  ReportDetail: { reportId: string };
  UploadResolution: { reportId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
};

export type CitizenTabParamList = {
  Home: undefined;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  ReportStack: NavigatorScreenParams<ReportStackParamList>;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Analytics: undefined;
};
