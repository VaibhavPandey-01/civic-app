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
    color: '#2E9E5B', // environmental green
    group: 'environmental',
  },
  {
    id: 'plastic_pollution',
    label: 'Plastic Pollution',
    iconName: 'Package',
    color: '#2E9E5B',
    group: 'environmental',
  },
  {
    id: 'waste_accumulation',
    label: 'Waste Accumulation',
    iconName: 'Layers',
    color: '#2E9E5B',
    group: 'environmental',
  },
  {
    id: 'water_pollution',
    label: 'Water Pollution',
    iconName: 'Droplet',
    color: '#1E63D6', // primary blue
    group: 'environmental',
  },
  {
    id: 'suspicious_object',
    label: 'Suspicious Object',
    iconName: 'AlertTriangle',
    color: '#FF6B35', // alert orange
    group: 'safety',
  },
  {
    id: 'emergency_situation',
    label: 'Emergency Situation',
    iconName: 'ShieldAlert',
    color: '#FF6B35',
    group: 'safety',
  },
];
