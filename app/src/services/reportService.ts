import * as SecureStore from 'expo-secure-store';
import api, { USE_MOCK } from './api';
import { Report } from '../types/report.types';

const MOCK_REPORTS_KEY = 'op_mock_reports';

const getMockReports = async (): Promise<Report[]> => {
  try {
    const raw = await SecureStore.getItemAsync(MOCK_REPORTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  const samples: Report[] = [
    {
      id: 'mock-report-1',
      userId: 'mock-user-id',
      category: 'garbage_dump',
      imageURL: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500',
      latitude: 28.6139,
      longitude: 77.2090,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Garbage piled up near the park entrance. Needs immediate cleanup.',
      status: 'resolved',
      resolutionImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500',
      resolutionNotes: 'Municipal sanitation team cleaned the trash dump and sanitized the area.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-report-2',
      userId: 'mock-user-id',
      category: 'water_pollution',
      imageURL: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=500',
      latitude: 28.6150,
      longitude: 77.2100,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      description: 'Open sewage drain overflowing onto the side street. Strong foul odor.',
      status: 'action_started',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }
  ];

  await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(samples));
  return samples;
};

const saveMockReports = async (reports: Report[]) => {
  await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(reports));
};

export const createReport = async (formData: FormData): Promise<Report> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const parts = (formData as any)._parts || [];
    const getPart = (key: string) => parts.find(([k]: any) => k === key)?.[1];

    const imageObj = getPart('image');

    const newReport: Report = {
      id: 'mock-report-' + Math.random().toString(36).substr(2, 9),
      userId: 'mock-user-id',
      category: (getPart('category') as any) || 'garbage_dump',
      imageURL: imageObj?.uri || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500',
      latitude: Number(getPart('latitude')) || 28.6139,
      longitude: Number(getPart('longitude')) || 77.2090,
      timestamp: new Date().toISOString(),
      description: getPart('description') || '',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reports.unshift(newReport);
    await saveMockReports(reports);
    return newReport;
  }

  const response = await api.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data,
  });
  return response.data.data.report;
};

export const getUserReports = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reports: Report[]; pagination: any }> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    return {
      reports,
      pagination: { total: reports.length, page, limit }
    };
  }

  const response = await api.get(`/reports/user/${userId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const getReportById = async (
  id: string
): Promise<{ report: Report; history: any[] }> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const report = reports.find((r) => r.id === id);
    if (!report) throw new Error('Report not found');
    

    const history = [
      { status: 'submitted', changedAt: report.createdAt, remarks: 'Report submitted by citizen.' }
    ];
    if (report.status === 'action_started' || report.status === 'resolved') {
      history.push({ status: 'action_started', changedAt: report.updatedAt, remarks: 'Action initiated by local municipality.' });
    }
    if (report.status === 'resolved') {
      history.push({ status: 'resolved', changedAt: report.updatedAt, remarks: 'Issue resolved successfully.' });
    }
    
    return { report, history };
  }

  const response = await api.get(`/reports/${id}`);
  return response.data.data;
};
