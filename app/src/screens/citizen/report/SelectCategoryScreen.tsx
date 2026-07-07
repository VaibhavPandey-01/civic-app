import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const instructionY = useRef(new Animated.Value(10)).current;
  const grid1Y = useRef(new Animated.Value(20)).current;
  const grid2Y = useRef(new Animated.Value(20)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    instructionY.setValue(10);
    grid1Y.setValue(20);
    grid2Y.setValue(20);

    Animated.stagger(85, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(instructionY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(grid1Y, {
        toValue: 0,
        tension: 55,
        friction: 7.5,
        useNativeDriver: true,
      }),
      Animated.spring(grid2Y, {
        toValue: 0,
        tension: 55,
        friction: 7.5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  const handleSelect = (category: ReportCategoryType) => {
    setSelectedCategory(category);
    navigation.navigate('Camera', { category });
  };

  const environmentalCategories = CATEGORIES.filter((c) => c.group === 'environmental');
  const safetyCategories = CATEGORIES.filter((c) => c.group === 'safety');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.getParent()?.navigate('CitizenTabs')}>
            <X size={20} color={Colors.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('selectCategoryTitle')}</Text>
          <View style={styles.placeholder} />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: instructionY }] }}>
          <Text style={styles.instruction}>
            {t('chooseMatchingCategory')}
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid1Y }] }}>
          <Text style={styles.sectionTitle}>{t('environmentalPollution' as any)}</Text>
          <View style={styles.grid}>
            {environmentalCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => handleSelect(cat.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid2Y }] }}>
          <Text style={styles.sectionTitle}>{t('safetySecurity' as any)}</Text>
          <View style={styles.grid}>
            {safetyCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => handleSelect(cat.id)}
              />
            ))}
          </View>
        </Animated.View>
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
