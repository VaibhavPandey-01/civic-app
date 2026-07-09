import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Linking,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Calendar, Clipboard, FolderOpen, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { createReport } from '../../../services/reportService';
import { CATEGORIES } from '../../../constants/categories';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReviewSubmit'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'ReviewSubmit'>;

export const ReviewSubmitScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { t, language } = useTranslation();
  const { category, imageUri, latitude, longitude, timestamp, description } = route.params;

  const [submitting, setSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const matchedCategory = CATEGORIES.find((c) => c.id === category);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const formData = new FormData();

      const fileUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
      formData.append('image', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'report_incident.jpg',
      } as any);

      formData.append('category', category);
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('description', description);
      formData.append('language', language);

      await createReport(formData);

      if (category === 'emergency_situation') {
        Linking.openURL('tel:112').catch((err) =>
          console.error('Failed to trigger emergency call:', err)
        );
      }

      navigation.navigate('SafetyTips', { category });
    } catch (error: any) {
      console.error('Error submitting report:', error);
      const backendMsg = error?.response?.data?.message || 'An error occurred while uploading your report. Please try again.';
      
      if (backendMsg.includes('AI Validation Failed:')) {
        const cleanMsg = backendMsg.replace('AI Validation Failed:', '').trim();
        setErrorMessage(cleanMsg);
        setShowErrorModal(true);
      } else {
        Alert.alert(t('error'), backendMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle size={36} color="#DC2626" />
            </View>
            
            <Text style={styles.modalTitle}>{t('aiValidationTitle')}</Text>
            <Text style={styles.modalSub}>{t('aiValidationSub')}</Text>
            
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{errorMessage}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>{t('aiValidationButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('reviewSubmitTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.mainImage} />
        </View>

        {}
        <Card style={styles.card}>
          <Text style={styles.summaryTitle}>{t('confirmDetails')}</Text>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <FolderOpen size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('categoryLabel')}</Text>
              <Text style={styles.infoValue}>
                {matchedCategory ? matchedCategory.label : category}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('locationCoords')}</Text>
              <Text style={styles.infoValue}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Calendar size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Captured Timestamp</Text>
              <Text style={styles.infoValue}>
                {new Date(timestamp).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Clipboard size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('descriptionLabel')}</Text>
              <Text style={styles.infoValue}>
                {description || <Text style={styles.emptyText}>No optional description provided.</Text>}
              </Text>
            </View>
          </View>
        </Card>

        {}
        <Button
          title={t('submitReportBtn')}
          onPress={handleSubmit}
          variant="secondary"
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
    resizeMode: 'contain',
    backgroundColor: '#000', // add a black background for letterboxing
  },
  card: {
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Colors.spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryBlue + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.darkText,
    marginTop: 2,
    lineHeight: 18,
  },
  emptyText: {
    fontStyle: 'italic',
    color: Colors.grayText,
  },
  submitBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    alignItems: 'center',
    ...Colors.shadow.medium,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
    marginBottom: Colors.spacing.xs,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Colors.spacing.md,
    lineHeight: 18,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  reasonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: Colors.primaryBlue,
    borderRadius: Colors.radius.md,
    paddingVertical: Colors.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});
