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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Calendar, Clipboard, FolderOpen } from 'lucide-react-native';
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
  const { t } = useTranslation();
  const { category, imageUri, latitude, longitude, timestamp, description } = route.params;

  const [submitting, setSubmitting] = useState(false);

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

      await createReport(formData);

      if (category === 'emergency_situation') {
        Linking.openURL('tel:112').catch((err) =>
          console.error('Failed to trigger emergency call:', err)
        );
      }

      navigation.navigate('SafetyTips', { category });
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(t('error'), 'An error occurred while uploading your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('reviewSubmitTitle')}</Text>
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
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
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
});
