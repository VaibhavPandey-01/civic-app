import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Star, MapPin, Calendar, ClipboardList } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { getReportById } from '../../../services/reportService';
import { submitFeedback } from '../../../services/feedbackService';
import { ReportTimeline } from '../../../components/report/ReportTimeline';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Report, StatusHistory } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { ReportsStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'ReportDetail'>;
type ScreenRouteProp = RouteProp<ReportsStackParamList, 'ReportDetail'>;

export const ReportDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { reportId } = route.params;

  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // feedback states
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getReportById(reportId);
      setReport(data.report);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching report details:', error);
      Alert.alert('Error', 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportId]);

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

  const handleFeedbackSubmit = async () => {
    setFeedbackSubmitting(true);
    try {
      await submitFeedback(reportId, rating, comment);
      setFeedbackSubmitted(true);
      setFeedbackModalVisible(false);
      Alert.alert(t('feedbackSuccessTitle'), t('feedbackSuccessMsg'));
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('error'), error.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const StarRating = () => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
          <Star
            size={36}
            color={star <= rating ? '#FBBF24' : '#D1D5DB'}
            fill={star <= rating ? '#FBBF24' : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Report: {categoryItem?.label || report.category}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {}
        <Text style={styles.sectionTitle}>{t('routingTimeline')}</Text>
        <ReportTimeline
          currentStatus={report.status}
          historyLogs={history.map((h) => ({
            status: h.status,
            changedAt: h.changedAt,
            remarks: h.remarks,
          }))}
        />

        {}
        {report.status === 'resolved' && (
          <View style={styles.resolutionContainer}>
            <Text style={styles.sectionTitle}>{t('resolutionComparison')}</Text>
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonBox}>
                <Image source={{ uri: report.imageURL }} style={styles.comparisonImage} />
                <Text style={styles.comparisonLabel}>{t('beforeIncident')}</Text>
              </View>
              <View style={styles.comparisonBox}>
                <Image
                  source={{ uri: report.resolutionImage || report.imageURL }}
                  style={styles.comparisonImage}
                />
                <Text style={styles.comparisonLabel}>{t('afterResolved')}</Text>
              </View>
            </View>
            {report.resolutionNotes ? (
              <Card style={styles.resolutionNotesCard}>
                <Text style={styles.notesTitle}>{t('resolutionNotes')}</Text>
                <Text style={styles.notesContent}>{report.resolutionNotes}</Text>
              </Card>
            ) : null}

            {}
            {!feedbackSubmitted && (
              <Button
                title={t('leaveFeedbackBtn')}
                onPress={() => setFeedbackModalVisible(true)}
                variant="primary"
                style={styles.feedbackBtn}
              />
            )}
          </View>
        )}

        {}
        <Text style={styles.sectionTitle}>{t('reportDetailsTitle')}</Text>
        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <MapPin size={16} color={Colors.grayText} />
            <Text style={styles.metaText}>
              Location: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Calendar size={16} color={Colors.grayText} />
            <Text style={styles.metaText}>
              Submitted on: {new Date(report.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {report.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>{t('descriptionLabel')}</Text>
              <Text style={styles.descriptionText}>{report.description}</Text>
            </View>
          ) : null}
        </Card>

      </ScrollView>

      {}
      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('rateResolutionTitle')}</Text>
            <Text style={styles.modalSub}>
              {t('howSatisfiedPrompt')}
            </Text>

            <StarRating />

            <Input
              label={t('descriptionLabel')}
              placeholder="Tell us what you think..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              style={styles.remarksInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <Button
                title={t('submit')}
                onPress={handleFeedbackSubmit}
                loading={feedbackSubmitting}
                style={styles.submitFeedbackBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resolutionContainer: {
    marginTop: Colors.spacing.sm,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: Colors.spacing.sm,
    marginBottom: Colors.spacing.sm,
  },
  comparisonBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 1,
  },
  comparisonLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    paddingVertical: 6,
    color: Colors.grayText,
  },
  resolutionNotesCard: {
    padding: Colors.spacing.md,
    borderColor: '#EFF6FF',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    marginBottom: Colors.spacing.md,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 13,
    color: Colors.darkText,
    lineHeight: 18,
  },
  feedbackBtn: {
    width: '100%',
    marginBottom: Colors.spacing.sm,
  },
  metaCard: {
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
  descriptionContainer: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.lg,
    borderTopRightRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Colors.spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Colors.spacing.lg,
    lineHeight: 18,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: Colors.spacing.lg,
  },
  remarksInput: {
    marginBottom: Colors.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Colors.spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  submitFeedbackBtn: {
    flex: 2,
  },
});
