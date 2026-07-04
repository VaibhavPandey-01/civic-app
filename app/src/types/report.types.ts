import { ReportCategoryType } from '../constants/categories';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'action_started'
  | 'resolved';

export type ReportPriority = 'low' | 'medium' | 'high';

export interface AiDetection {
  label: string;
  confidence: number;
}

export interface StatusHistory {
  id: string;
  reportId: string;
  status: ReportStatus;
  changedBy: {
    id: string;
    name: string;
    role: string;
  };
  remarks?: string;
  changedAt: string; // iso date string
}

export interface Feedback {
  id: string;
  reportId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string; // iso date string
}

export interface Report {
  id: string;
  userId: string;
  category: ReportCategoryType;
  description?: string;
  imageURL: string;
  latitude: number;
  longitude: number;
  timestamp: string; // iso date string
  status: ReportStatus;
  assignedDepartment?: string;
  priority?: ReportPriority;
  assignedAdminId?: string;
  resolutionImage?: string;
  resolutionNotes?: string;
  aiDetection?: AiDetection;
  createdAt: string; // iso date string
  updatedAt: string; // iso date string
}
