import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ReportCategoryType } from '../../constants/categories';

interface PreventionTipsProps {
  category: ReportCategoryType;
}

const TIPS: Record<ReportCategoryType, { title: string; tips: string[]; isSafety: boolean }> = {
  garbage_dump: {
    title: 'Sanitation Guidelines',
    isSafety: false,
    tips: [
      'Dispose of garbage only in designated collection bins.',
      'Do not burn trash openly, as it releases toxic chemical fumes.',
      'Keep household waste bins covered to prevent pests and disease spread.',
    ],
  },
  plastic_pollution: {
    title: 'Plastic Reduction Tips',
    isSafety: false,
    tips: [
      'Switch to reusable bags, bottles, and metal/bamboo straws.',
      'Segregate plastic waste correctly to ensure it gets sent to recycling centers.',
      'Avoid buying products wrapped in excessive single-use plastic layers.',
    ],
  },
  waste_accumulation: {
    title: 'Waste Management Rules',
    isSafety: false,
    tips: [
      'Segregate your waste at the source (organic, dry, and hazardous).',
      'Compost organic kitchen waste locally to reduce landfill volumes.',
      'Coordinate with community cleanup drives for periodic clearing.',
    ],
  },
  water_pollution: {
    title: 'Water Safety Precautions',
    isSafety: false,
    tips: [
      'Never dump motor oil, chemicals, or household waste into storm drains.',
      'Minimize pesticide and chemical fertilizer application on lawns.',
      'Report large discharges or suspicious coloring in local waterways immediately.',
    ],
  },
  suspicious_object: {
    title: 'Emergency Safety Rules',
    isSafety: true,
    tips: [
      'Do not touch, kick, or move the object under any circumstances.',
      'Maintain a safe distance of at least 100 meters immediately.',
      'Alert other people nearby to move away from the vicinity.',
      'Call local authorities or emergency responders at once.',
    ],
  },
  emergency_situation: {
    title: 'Critical Emergency Steps',
    isSafety: true,
    tips: [
      'Remain calm and quickly assess the safest path to safety.',
      'Evacuate the area and find secure shelter away from immediate danger.',
      'Call emergency numbers immediately and provide clear location details.',
      'Only assist others if doing so does not jeopardize your own life.',
    ],
  },
};

export const PreventionTips: React.FC<PreventionTipsProps> = ({ category }) => {
  const data = TIPS[category];
  if (!data) return null;

  const Icon = data.isSafety ? ShieldAlert : CheckCircle2;
  const iconColor = data.isSafety ? Colors.alertOrange : Colors.environmentalGreen;

  return (
    <View style={[styles.container, data.isSafety ? styles.safetyContainer : null]}>
      <View style={styles.header}>
        <Icon size={20} color={iconColor} />
        <Text style={[styles.title, { color: data.isSafety ? Colors.alertOrange : Colors.darkText }]}>
          {data.title}
        </Text>
      </View>
      <View style={styles.tipsList}>
        {data.tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={[styles.bullet, { color: iconColor }]}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  safetyContainer: {
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFBEB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    marginRight: 6,
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.grayText,
    lineHeight: 18,
  },
});
