import * as SecureStore from 'expo-secure-store';
import api, { USE_MOCK } from './api';
import { Report, ReportStatus } from '../types/report.types';

const MOCK_REPORTS_KEY = 'op_mock_reports';

const getMockReports = async (): Promise<Report[]> => {
  try {
    const raw = await SecureStore.getItemAsync(MOCK_REPORTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

const saveMockReports = async (reports: Report[]) => {
  await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(reports));
};

interface AdminFilters {
  status?: string;
  category?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export const getAllReports = async (
  filters: AdminFilters
): Promise<{ reports: Report[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  if (USE_MOCK) {
    let reports = await getMockReports();
    if (filters.status && filters.status !== 'all') {
      reports = reports.filter(r => r.status === filters.status);
    }
    if (filters.category) {
      reports = reports.filter(r => r.category === filters.category);
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    return {
      reports: reports.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: reports.length,
        pages: Math.ceil(reports.length / limit)
      }
    };
  }

  const response = await api.get('/admin/reports', { params: filters });
  return response.data.data;
};

export const updateReportStatus = async (
  id: string,
  status: ReportStatus,
  remarks?: string,
  assignedAdminId?: string
): Promise<Report> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    
    reports[index].status = status;
    reports[index].updatedAt = new Date().toISOString();
    if (assignedAdminId) reports[index].assignedAdminId = assignedAdminId;
    
    await saveMockReports(reports);
    return reports[index];
  }

  const response = await api.patch(`/admin/reports/${id}/status`, {
    status,
    remarks,
    assignedAdminId,
  });
  return response.data.data.report;
};

export const uploadResolution = async (
  id: string,
  formData: FormData
): Promise<Report> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');

    const parts = (formData as any)._parts || [];
    const getPart = (key: string) => parts.find(([k]: any) => k === key)?.[1];
    
    const resolutionImgObj = getPart('resolutionImage');
    
    reports[index].status = 'resolved';
    reports[index].resolutionNotes = getPart('resolutionNotes') || 'Resolved by authority';
    reports[index].resolutionImage = resolutionImgObj?.uri || reports[index].imageURL;
    reports[index].updatedAt = new Date().toISOString();

    await saveMockReports(reports);
    return reports[index];
  }

  const response = await api.post(`/admin/reports/${id}/resolution`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data,
  });
  return response.data.data.report;
};

export const getAnalytics = async (): Promise<{
  totalReports: number;
  byStatus: { _id: string; count: number }[];
  byCategory: { _id: string; count: number }[];
  byDepartment: { _id: string; count: number }[];
}> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const byStatusMap: Record<string, number> = {};
    const byCategoryMap: Record<string, number> = {};
    const byDepartmentMap: Record<string, number> = {};

    reports.forEach(r => {
      byStatusMap[r.status] = (byStatusMap[r.status] || 0) + 1;
      byCategoryMap[r.category] = (byCategoryMap[r.category] || 0) + 1;
      
      const dept = r.category === 'suspicious_object' || r.category === 'emergency_situation' 
        ? 'Police / Safety Dept' 
        : 'Municipal Sanitation';
      byDepartmentMap[dept] = (byDepartmentMap[dept] || 0) + 1;
    });

    return {
      totalReports: reports.length,
      byStatus: Object.keys(byStatusMap).map(k => ({ _id: k, count: byStatusMap[k] })),
      byCategory: Object.keys(byCategoryMap).map(k => ({ _id: k, count: byCategoryMap[k] })),
      byDepartment: Object.keys(byDepartmentMap).map(k => ({ _id: k, count: byDepartmentMap[k] }))
    };
  }

  const response = await api.get('/admin/analytics');
  return response.data.data;
};
