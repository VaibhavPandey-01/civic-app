export type ReportCategoryType =
  | 'garbage_dump'
  | 'plastic_pollution'
  | 'waste_accumulation'
  | 'water_pollution'
  | 'suspicious_object'
  | 'emergency_situation';

export interface CategoryItem {
  id: ReportCategoryType;
  label: string;
  iconName: string; // lucide icon name to be rendered
  color: string;
  group: 'environmental' | 'safety';
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'garbage_dump',
    label: 'Garbage Dump',
    iconName: 'Trash2',
    color: '#10B981',
    group: 'environmental',
  },
  {
    id: 'plastic_pollution',
    label: 'Plastic Pollution',
    iconName: 'Package',
    color: '#06B6D4',
    group: 'environmental',
  },
  {
    id: 'waste_accumulation',
    label: 'Waste Accumulation',
    iconName: 'Layers',
    color: '#8B5CF6',
    group: 'environmental',
  },
  {
    id: 'water_pollution',
    label: 'Water Pollution',
    iconName: 'Droplet',
    color: '#3B82F6',
    group: 'environmental',
  },
  {
    id: 'suspicious_object',
    label: 'Suspicious Object',
    iconName: 'AlertTriangle',
    color: '#F59E0B',
    group: 'safety',
  },
  {
    id: 'emergency_situation',
    label: 'Emergency Situation',
    iconName: 'ShieldAlert',
    color: '#EF4444',
    group: 'safety',
  },
];
