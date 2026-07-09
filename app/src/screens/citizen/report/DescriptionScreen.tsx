import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ReportStackParamList } from '../../../types/navigation.types';
import { CATEGORIES, ReportCategoryType } from '../../../constants/categories';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'Description'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'Description'>;

export const DescriptionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { t } = useTranslation();
  const { category: initialCategory, imageUri, latitude, longitude, timestamp } = route.params;

  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryType>(initialCategory);
  const [description, setDescription] = useState('');

  const handleNext = () => {
    navigation.navigate('ReviewSubmit', {
      category: selectedCategory,
      imageUri,
      latitude,
      longitude,
      timestamp,
      description: description.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('describeIssueTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {}
          <Card style={styles.card}>
            {}
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.thumbnail} />
              <View style={styles.metaContainer}>
                <Text style={styles.metaLabel}>Location Coordinates</Text>
                <Text style={styles.metaValue}>
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </Text>
                <Text style={styles.metaLabel}>Captured On</Text>
                <Text style={styles.metaValue}>
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {}
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Incident Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsContainer}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryPill,
                        isSelected && {
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            {}
            <Input
              label={t('describeIssueTitle')}
              placeholder={t('contextPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              containerStyle={styles.inputContainer}
            />

            {}
            <View style={styles.guidelineCard}>
              <AlertCircle size={16} color={Colors.grayText} />
              <Text style={styles.guidelineText}>
                Reports must contain accurate descriptions. Intentionally false reporting will restrict account access.
              </Text>
            </View>
          </Card>

          <Button
            title={t('next')}
            onPress={handleNext}
            variant="primary"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  card: {
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  previewContainer: {
    flexDirection: 'row',
    marginBottom: Colors.spacing.md,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  metaContainer: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: Colors.darkText,
    marginBottom: 8,
  },
  aiWrapper: {
    marginBottom: Colors.spacing.md,
  },
  aiLoadingContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: Colors.radius.sm,
    padding: Colors.spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  aiLoadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiLoadingTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 6,
  },
  aiProcessing: {
    fontSize: 12,
    color: Colors.grayText,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: Colors.spacing.md,
  },
  inputContainer: {
    marginBottom: Colors.spacing.sm,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: Colors.spacing.sm,
  },
  guidelineText: {
    flex: 1,
    fontSize: 11,
    color: Colors.grayText,
    lineHeight: 15,
  },
  submitBtn: {
    width: '100%',
  },
  categorySection: {
    marginBottom: Colors.spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Colors.spacing.xs,
  },
  categoryPillsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
  },
  categoryPillTextSelected: {
    color: Colors.white,
  },
});
