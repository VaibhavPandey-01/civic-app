import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Navigation } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAllReports } from '../../../services/adminService';
import { getCurrentLocation } from '../../../services/locationService';
import { Card } from '../../../components/common/Card';
import { Report } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';

type NavigationProp = NativeStackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 18.9400,
  longitude: 72.8200,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const LiveMapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const initMapData = async () => {
    try {
      setLoading(true);

      const loc = await getCurrentLocation();
      if (loc) {
        setRegion({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }

      // fetch pending and resolved reports
      const data = await getAllReports({ limit: 100 }); // fetch up to 100 markers
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching live map details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initMapData();
  }, []);

  const handleMarkerPress = (report: Report) => {
    setSelectedReport(report);
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={styles.loaderText}>Loading live map coordinates...</Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: Colors.spacing.md, paddingTop: insets.top + Colors.spacing.md, backgroundColor: Colors.background }}>
          {}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Colors.spacing.md }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.darkText }}>Incident Tracker</Text>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <X size={20} color={Colors.darkText} />
            </TouchableOpacity>
          </View>

          {}
          <Card style={{ padding: Colors.spacing.md, marginBottom: Colors.spacing.md, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }}>
            <Text style={{ fontSize: 11, color: Colors.primaryBlue, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Location Navigation
            </Text>
            <Text style={{ fontSize: 12, color: Colors.darkText, lineHeight: 18 }}>
              Inline maps require a configured Google Maps API Key. You can navigate to any reported coordinate directly in your device's native map application.
            </Text>
          </Card>

          {reports.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: Colors.grayText }}>No active reports to display.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Colors.spacing.xl }}>
              {reports.map((report) => {
                const matchedCat = CATEGORIES.find(c => c.id === report.category);
                return (
                  <Card key={report.id} style={{ padding: Colors.spacing.md, marginBottom: Colors.spacing.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.darkText }}>
                          {matchedCat?.label || report.category}
                        </Text>
                        <Text style={{ fontSize: 12, color: Colors.grayText, marginTop: 2 }}>
                          GPS: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                        </Text>
                      </View>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: Colors.radius.sm,
                        backgroundColor: report.status === 'resolved' ? '#ECFDF5' : '#FEF3C7'
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: report.status === 'resolved' ? '#059669' : '#D97706'
                        }}>
                          {getStatusLabel(report.status)}
                        </Text>
                      </View>
                    </View>

                    {report.description ? (
                      <Text style={{ fontSize: 13, color: Colors.darkText, marginTop: Colors.spacing.xs, lineHeight: 18 }} numberOfLines={2}>
                        {report.description}
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: Colors.spacing.sm }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: Colors.primaryBlue,
                          borderRadius: Colors.radius.sm,
                          paddingVertical: 8,
                          paddingHorizontal: Colors.spacing.md,
                          gap: 6
                        }}
                        activeOpacity={0.8}
                        onPress={() => {
                          const url = Platform.select({
                            ios: `maps:0,0?q=${report.latitude},${report.longitude}`,
                            android: `geo:0,0?q=${report.latitude},${report.longitude}(Incident)`,
                          }) || `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
                          Linking.openURL(url).catch((err) => console.error('Failed to open map app:', err));
                        }}
                      >
                        <Navigation size={14} color={Colors.white} />
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.white }}>
                          Open Map
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: Colors.white,
                          borderColor: '#E5E7EB',
                          borderWidth: 1,
                          borderRadius: Colors.radius.sm,
                          paddingVertical: 8,
                          paddingHorizontal: Colors.spacing.md,
                          justifyContent: 'center'
                        }}
                        activeOpacity={0.8}
                        onPress={() => {
                          navigation.navigate('Reports', {
                            screen: 'ReportDetail',
                            params: { reportId: report.id },
                          });
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 'semibold', color: Colors.darkText }}>
                          View Details & Act
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Colors.spacing.sm,
  },
  loaderText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  mapWrapper: {
    flex: 1,
  },
  floatingClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Colors.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.medium,
  },
  previewPanel: {
    position: 'absolute',
    bottom: Colors.spacing.lg,
    left: Colors.spacing.md,
    right: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    ...Colors.shadow.medium,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  panelContent: {
    flexDirection: 'row',
    marginBottom: Colors.spacing.md,
  },
  panelThumbnail: {
    width: 60,
    height: 60,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  panelMeta: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  panelCategory: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  panelStatus: {
    fontSize: 12,
    color: Colors.grayText,
    marginTop: 2,
  },
  statusBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  panelCoords: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 4,
  },
  detailsBtn: {
    height: 44,
    borderRadius: Colors.radius.sm,
    backgroundColor: Colors.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailsBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 14,
  },
});
