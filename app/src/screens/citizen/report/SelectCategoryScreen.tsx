import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { CATEGORIES, ReportCategoryType } from '../../../constants/categories';
import { CategoryTile } from '../../../components/dashboard/CategoryTile';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'SelectCategory'>;

export const SelectCategoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryType | null>(null);
  const handleSelect = (category: ReportCategoryType) => {
    setSelectedCategory(category);
    navigation.navigate('Camera', { category });
  };

  const environmentalCategories = CATEGORIES.filter((c) => c.group === 'environmental');
  const safetyCategories = CATEGORIES.filter((c) => c.group === 'safety');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <X size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('selectCategoryTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          {t('chooseMatchingCategory')}
        </Text>

        <Text style={styles.sectionTitle}>Environmental Pollution</Text>
        <View style={styles.grid}>
          {environmentalCategories.map((cat) => (
            <CategoryTile
              key={cat.id}
              category={cat}
              onPress={() => handleSelect(cat.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Safety & Security</Text>
        <View style={styles.grid}>
          {safetyCategories.map((cat) => (
            <CategoryTile
              key={cat.id}
              category={cat}
              onPress={() => handleSelect(cat.id)}
            />
          ))}
        </View>
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
  closeBtn: {
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
  instruction: {
    fontSize: 14,
    color: Colors.grayText,
    marginBottom: Colors.spacing.lg,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Colors.spacing.lg,
    marginHorizontal: -Colors.spacing.xs,
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
    padding: Colors.spacing.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
    paddingBottom: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  modalScroll: {
    marginBottom: Colors.spacing.md,
  },
  modalFooter: {
    paddingTop: Colors.spacing.xs,
  },
  continueButton: {
    width: '100%',
  },
});
