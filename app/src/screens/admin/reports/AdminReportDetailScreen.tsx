import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Calendar, MapPin, Plus, CheckSquare } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getReportById } from '../../../services/reportService';
import { updateReportStatus } from '../../../services/adminService';
import { useAuthStore } from '../../../context/useAuthStore';
import { StatusUpdater } from '../../../components/admin/StatusUpdater';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Report, StatusHistory } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { ReportsStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'ReportDetail'>;
type ScreenRouteProp = RouteProp<ReportsStackParamList, 'ReportDetail'>;

export const AdminReportDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { reportId } = route.params;

  const currentAdmin = useAuthStore((s) => s.user);

  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await getReportById(reportId);
      setReport(data.report);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching admin report details:', error);
      Alert.alert('Error', 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReportData();
    });
    return unsubscribe;
  }, [navigation, reportId]);

  const handleAssignToMe = async () => {
    if (!report || !currentAdmin) return;
    setAssigning(true);
    try {

      await updateReportStatus(report.id, report.status, 'Assigned to officer: ' + currentAdmin.name, currentAdmin.id);
      Alert.alert('Assigned', 'Incident report has been assigned to you.');
      loadReportData();
    } catch (error: any) {
      console.error('Error self-assigning report:', error);
      Alert.alert('Assignment Failed', error.message || 'An error occurred.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  const categoryItem = CATEGORIES.find((c) => c.id === report.category);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return { bg: '#F3F4F6', text: '#374151', label: 'Submitted' };
      case 'under_review':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Under Review' };
      case 'assigned':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'Assigned' };
      case 'action_started':
        return { bg: '#FFEDD5', text: '#EA580C', label: 'Action Started' };
      case 'resolved':
        return { bg: '#D1FAE5', text: '#059669', label: 'Resolved' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status.toUpperCase() };
    }
  };

  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAssignedToMe = report.assignedAdminId === currentAdmin?.id;

  const userIdStr = typeof report.userId === 'object' && report.userId 
    ? ((report.userId as any).id || (report.userId as any)._id || '') 
    : (report.userId || '');
  const userDisplayId = userIdStr ? userIdStr.slice(-6) : 'Unknown';

  const resolvedEvent = history.find((h) => h.status === 'resolved');
  const badgeConfig = getStatusBadge(report.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('ReportList')}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Review: {categoryItem?.label || report.category}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.statusBadgeRow}>
          <View style={[styles.badgeContainer, { backgroundColor: badgeConfig.bg }]}>
            <Text style={[styles.badgeText, { color: badgeConfig.text }]}>
              ● {badgeConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: report.imageURL }} style={styles.mainImage} />
        </View>

        {report.status !== 'resolved' ? (
          <View style={styles.actionsPanel}>
            {!isAssignedToMe ? (
              <Button
                title="Assign to Me"
                onPress={handleAssignToMe}
                loading={assigning}
                variant="outline"
                style={styles.actionBtn}
              />
            ) : (
              <View style={styles.ownershipBadge}>
                <Text style={styles.ownershipText}>✓ Assigned to You</Text>
              </View>
            )}

            {report.status === 'action_started' && (
              <Button
                title="Resolve Incident"
                onPress={() => navigation.navigate('UploadResolution', { reportId: report.id })}
                variant="secondary"
                style={styles.actionBtn}
              />
            )}
          </View>
        ) : null}

        {report.status !== 'resolved' && (
          <StatusUpdater
            reportId={report.id}
            currentStatus={report.status}
            onStatusUpdated={loadReportData}
          />
        )}

        {report.status === 'resolved' && (
          <View style={styles.resolutionContainer}>
            <Text style={styles.sectionTitle}>Resolution Details</Text>
            <Card style={styles.detailsCard}>
              <View style={styles.resolutionHeader}>
                <CheckSquare size={18} color="#059669" />
                <Text style={styles.resolutionTitle}>Issue Resolved</Text>
              </View>

              {report.resolutionNotes ? (
                <View style={styles.descriptionBlock}>
                  <Text style={styles.descriptionLabel}>Official Resolution Remarks</Text>
                  <Text style={styles.descriptionText}>{report.resolutionNotes}</Text>
                </View>
              ) : (
                <View style={styles.descriptionBlock}>
                  <Text style={styles.descriptionLabel}>Official Resolution Remarks</Text>
                  <Text style={[styles.descriptionText, { fontStyle: 'italic', color: Colors.grayText }]}>
                    No resolution notes provided.
                  </Text>
                </View>
              )}

              {resolvedEvent && (
                <View style={styles.resolverBlock}>
                  <Text style={styles.resolverLabel}>
                    Resolved by: <Text style={styles.resolverValue}>{resolvedEvent.changedBy.name}</Text>
                  </Text>
                  <Text style={styles.resolverDate}>
                    Date: {new Date(resolvedEvent.changedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </Card>

            {report.resolutionImage ? (
              <View style={{ marginTop: Colors.spacing.md }}>
                <Text style={styles.sectionTitle}>Resolution Proof Photo</Text>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: report.resolutionImage }} style={styles.mainImage} />
                </View>
              </View>
            ) : null}
          </View>
        )}

        <Text style={styles.sectionTitle}>Incident Details</Text>
        <Card style={styles.detailsCard}>
          <View style={styles.metaRow}>
            <User size={16} color={Colors.grayText} />
            <Text style={styles.metaText}>Reporter Reference: User_{userDisplayId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Calendar size={16} color={Colors.grayText} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={16} color={Colors.grayText} />
            <Text style={styles.metaText}>
              GPS Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </Text>
          </View>

          {report.description ? (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionLabel}>Citizen Description</Text>
              <Text style={styles.descriptionText}>{report.description}</Text>
            </View>
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>Incident Location</Text>
        <Card style={styles.detailsCard}>
          <Text style={{ fontSize: 13, color: Colors.darkText, marginBottom: Colors.spacing.sm, lineHeight: 18 }}>
            This incident was reported at GPS coordinates: <Text style={{ fontWeight: 'bold' }}>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</Text>. You can open this location directly in your device's native maps application for navigation.
          </Text>
          <Button
            title="Open in Google / Apple Maps"
            onPress={() => {
              const url = Platform.select({
                ios: `maps:0,0?q=${report.latitude},${report.longitude}`,
                android: `geo:0,0?q=${report.latitude},${report.longitude}(Incident)`,
              }) || `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
              Linking.openURL(url).catch((err) => console.error('Failed to open map app:', err));
            }}
            variant="outline"
          />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grayText,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Colors.spacing.md,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    marginBottom: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadgeRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: Colors.spacing.md,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  resolutionContainer: {
    width: '100%',
    marginBottom: Colors.spacing.md,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Colors.spacing.md,
  },
  resolutionTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#059669',
  },
  resolverBlock: {
    marginTop: Colors.spacing.md,
    paddingTop: Colors.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resolverLabel: {
    fontSize: 13,
    color: Colors.darkText,
  },
  resolverValue: {
    fontWeight: 'bold',
  },
  resolverDate: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 4,
  },
  actionsPanel: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Colors.spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  ownershipBadge: {
    flex: 1,
    height: 48,
    borderRadius: Colors.radius.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownershipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsCard: {
    padding: Colors.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Colors.spacing.sm,
  },
  metaText: {
    fontSize: 13,
    color: Colors.darkText,
  },
  descriptionBlock: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: Colors.spacing.sm,
    marginTop: Colors.spacing.xs,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.darkText,
    lineHeight: 18,
  },
  mapContainer: {
    width: '100%',
    height: 150,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: Colors.spacing.xs,
    ...Colors.shadow.soft,
  },
});
